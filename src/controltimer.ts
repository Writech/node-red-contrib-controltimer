import { NodeAPI, Node, NodeMessageInFlow } from 'node-red';
import { defaults, nodeName, STATE, TIMER_TYPE, DurationUnit, constants, ControlTimerNodeDef, Props } from './helpers';

type NodeMessage = NodeMessageInFlow;

export = (RED: NodeAPI): void => {
    RED.nodes.registerType(nodeName, function (config: ControlTimerNodeDef) {
        RED.nodes.createNode(this, config);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node: Node = this;

        function getEvaluatedProperty(property: string | number, propertyType: 'num' | 'str', defaultProperty: string | number) {
            return propertyType === 'num'
                ? parseInt(RED.util.evaluateNodeProperty(String(property), propertyType, this, null), 10) || Number(defaultProperty)
                : RED.util.evaluateNodeProperty(String(property), propertyType, this, null) || defaultProperty;
        }

        const setting: Partial<Props> = {};

        setting.timerType = config.timerType || defaults.timerType;

        setting.timerDurationUnit = config.timerDurationUnit || defaults.timerDurationUnit;
        setting.timerDurationType = config.timerDurationType || defaults.timerDurationType;
        setting.timerDuration = getEvaluatedProperty(config.timerDuration, setting.timerDurationType, defaults.timerDuration);

        setting.timerLoopTimeoutUnit = config.timerLoopTimeoutUnit || defaults.timerLoopTimeoutUnit;
        setting.timerLoopTimeoutType = config.timerLoopTimeoutType || defaults.timerLoopTimeoutType;
        setting.timerLoopTimeout = getEvaluatedProperty(config.timerLoopTimeout, setting.timerLoopTimeoutType, defaults.timerLoopTimeout);

        setting.loopTimeoutMessageType = config.loopTimeoutMessageType || defaults.loopTimeoutMessageType;
        setting.loopTimeoutMessage = getEvaluatedProperty(config.loopTimeoutMessage, setting.loopTimeoutMessageType, defaults.loopTimeoutMessage);
        setting.timerMaxLoopIterationsType = config.timerMaxLoopIterationsType || defaults.timerMaxLoopIterationsType;
        setting.timerMaxLoopIterations = getEvaluatedProperty(config.timerMaxLoopIterations, setting.timerMaxLoopIterationsType, defaults.timerMaxLoopIterations);
        setting.loopMaxIterationsMessageType = config.loopMaxIterationsMessageType || defaults.loopMaxIterationsMessageType;
        setting.loopMaxIterationsMessage = getEvaluatedProperty(config.loopMaxIterationsMessage, setting.loopMaxIterationsMessageType, defaults.loopMaxIterationsMessage);

        setting.isConsecutiveStartActionTimerResetAllowed = config.isConsecutiveStartActionTimerResetAllowed ?? defaults.isConsecutiveStartActionTimerResetAllowed;
        setting.isRunningTimerProgressVisible = config.isRunningTimerProgressVisible ?? defaults.isRunningTimerProgressVisible;
        setting.outputReceivedMessageOnTimerTrigger = config.outputReceivedMessageOnTimerTrigger ?? defaults.outputReceivedMessageOnTimerTrigger;
        setting.outputReceivedMessageOnTimerHalt = config.outputReceivedMessageOnTimerHalt ?? defaults.outputReceivedMessageOnTimerHalt;
        setting.startTimerOnReceivalOfUnknownMessage = config.startTimerOnReceivalOfUnknownMessage ?? defaults.startTimerOnReceivalOfUnknownMessage;
        setting.resetTimerOnReceivalOfUnknownMessage = config.resetTimerOnReceivalOfUnknownMessage ?? defaults.resetTimerOnReceivalOfUnknownMessage;
        setting.isDebugModeEnabled = config.isDebugModeEnabled ?? defaults.isDebugModeEnabled;
        setting.timerTriggeredMessageType = config.timerTriggeredMessageType || defaults.timerTriggeredMessageType;
        setting.timerTriggeredMessage = getEvaluatedProperty(config.timerTriggeredMessage, setting.timerTriggeredMessageType, defaults.timerTriggeredMessage);
        setting.timerHaltedMessageType = config.timerHaltedMessageType || defaults.timerHaltedMessageType;
        setting.timerHaltedMessage = getEvaluatedProperty(config.timerHaltedMessage, setting.timerHaltedMessageType, defaults.timerHaltedMessage);

        setting.isStartActionEnabled = config.isStartActionEnabled ?? defaults.isStartActionEnabled;
        setting.isStopActionEnabled = config.isStopActionEnabled ?? defaults.isStopActionEnabled;
        setting.isResetActionEnabled = config.isResetActionEnabled ?? defaults.isResetActionEnabled;
        setting.isPauseActionEnabled = config.isPauseActionEnabled ?? defaults.isPauseActionEnabled;
        setting.isContinueActionEnabled = config.isContinueActionEnabled ?? defaults.isContinueActionEnabled;
        setting.actionPropertyNameType = config.actionPropertyNameType || defaults.actionPropertyNameType;
        setting.actionPropertyName = getEvaluatedProperty(config.actionPropertyName, setting.actionPropertyNameType, defaults.actionPropertyName);
        setting.startActionNameType = config.startActionNameType || defaults.startActionNameType;
        setting.startActionName = getEvaluatedProperty(config.startActionName, setting.startActionNameType, defaults.startActionName);
        setting.stopActionNameType = config.stopActionNameType || defaults.stopActionNameType;
        setting.stopActionName = getEvaluatedProperty(config.stopActionName, setting.stopActionNameType, defaults.stopActionName);
        setting.resetActionNameType = config.resetActionNameType || defaults.resetActionNameType;
        setting.resetActionName = getEvaluatedProperty(config.resetActionName, setting.resetActionNameType, defaults.resetActionName);
        setting.pauseActionNameType = config.pauseActionNameType || defaults.pauseActionNameType;
        setting.pauseActionName = getEvaluatedProperty(config.pauseActionName, setting.pauseActionNameType, defaults.pauseActionName);
        setting.continueActionNameType = config.continueActionNameType || defaults.continueActionNameType;
        setting.continueActionName = getEvaluatedProperty(config.continueActionName, setting.continueActionNameType, defaults.continueActionName);

        function getDurationInMilliseconds(duration: number, durationUnit: DurationUnit): number {
            if (durationUnit === DurationUnit.MILLISECOND) {
                return duration;
            }

            if (durationUnit === DurationUnit.SECOND) {
                return duration * 1000;
            }

            if (durationUnit === DurationUnit.MINUTE) {
                return duration * 60 * 1000;
            }

            if (durationUnit === DurationUnit.HOUR) {
                return duration * 60 * 60 * 1000;
            }
        }

        const timerDurationInMilliseconds = getDurationInMilliseconds(setting.timerDuration, setting.timerDurationUnit);
        const timerLoopTimeoutInMilliseconds = getDurationInMilliseconds(setting.timerLoopTimeout, setting.timerLoopTimeoutUnit);

        node.status({ fill: 'grey', shape: 'ring', text: 'Idle' });
        let currentState = STATE.IDLE;
        let override: { timerType: TIMER_TYPE; duration: number; durationUnit: DurationUnit; durationInMilliseconds: number } | null = null;

        let timerId: NodeJS.Timeout;
        let pausedTimerRunningMilliseconds: number;
        let timerStartedAtUnixTimestamp: number;

        function getRunningTimerProgress() {
            if (!setting.isRunningTimerProgressVisible) {
                return '';
            }

            const durationMilliseconds = override?.durationInMilliseconds ?? timerDurationInMilliseconds;
            const duration = override?.duration ?? setting.timerDuration;
            const durationUnit = override?.durationUnit ?? setting.timerDurationUnit;

            const previousRunningDurationInMilliseconds = pausedTimerRunningMilliseconds ?? 0;
            const timerPercentageCompletion = (100 * (Date.now() - timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds)) / durationMilliseconds;
            return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${duration} ${durationUnit}(s)`;
        }

        function getPausedTimerProgress() {
            if (!setting.isRunningTimerProgressVisible) {
                return '';
            }

            const durationMilliseconds = override?.durationInMilliseconds ?? timerDurationInMilliseconds;
            const duration = override?.duration ?? setting.timerDuration;
            const durationUnit = override?.durationUnit ?? setting.timerDurationUnit;

            const timerPercentageCompletion = (100 * pausedTimerRunningMilliseconds) / durationMilliseconds;
            return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${duration} ${durationUnit}(s)`;
        }

        let clockTimerId: NodeJS.Timeout;
        let stopIdleTimerId: NodeJS.Timeout;
        let loopTimeoutTimerId: NodeJS.Timeout;
        let currentLoopIteration = 0;

        function startClockTimer() {
            if (!setting.isRunningTimerProgressVisible) {
                return;
            }

            clockTimerId = setInterval(() => {
                if (currentState === STATE.RUNNING) {
                    node.status({
                        fill: 'green',
                        shape: 'dot',
                        text: `Running${getRunningTimerProgress()}`,
                    });
                }
            }, 50);
        }

        function stopClockTimer() {
            if (!setting.isRunningTimerProgressVisible) {
                return;
            }

            clearInterval(clockTimerId);
            clockTimerId = undefined;
        }

        function destroyTimer() {
            if (timerId === undefined) {
                return;
            }

            clearInterval(timerId);
            clearTimeout(timerId);
            timerId = undefined;
        }

        // TODO: Determine what happens when timer is paused right at the moment the timer expires

        node.on('input', (message: NodeMessage, send, done) => {
            const isStartActionMessage = message[setting.actionPropertyName] === setting.startActionName && setting.isStartActionEnabled;
            const isResetActionMessage = message[setting.actionPropertyName] === setting.resetActionName && setting.isResetActionEnabled;
            const isPauseActionMessage = message[setting.actionPropertyName] === setting.pauseActionName && setting.isPauseActionEnabled;
            const isContinueActionMessage = message[setting.actionPropertyName] === setting.continueActionName && setting.isContinueActionEnabled;
            const isStopActionMessage = message[setting.actionPropertyName] === setting.stopActionName && setting.isStopActionEnabled;
            const isUnknownMessage = !(isStartActionMessage || isResetActionMessage || isPauseActionMessage || isContinueActionMessage || isStopActionMessage);

            const timerTypeOverride = message[constants.timerTypeOverridePropertyName] ?? null;
            const timerDurationOverride = message[constants.timerDurationOverridePropertyName] ?? null;
            const timerDurationUnitOverride = message[constants.timerDurationUnitOverridePropertyName] ?? null;

            const isStartActionExternalOverrideMessage = isStartActionMessage && timerTypeOverride !== null && timerDurationOverride !== null && timerDurationUnitOverride !== null;

            if (isStartActionExternalOverrideMessage) {
                override = {
                    timerType: timerTypeOverride,
                    duration: timerDurationOverride,
                    durationUnit: timerDurationUnitOverride,
                    durationInMilliseconds: getDurationInMilliseconds(timerDurationOverride, timerDurationUnitOverride),
                };
            }

            function startStoppedIdleTimer() {
                stopStoppedIdleTimer();
                stopIdleTimerId = setTimeout(() => {
                    finishTimer();
                }, 1000 * 10);
            }

            function stopStoppedIdleTimer() {
                clearTimeout(stopIdleTimerId);
                stopIdleTimerId = undefined;
            }

            function startLoopTimeoutTimer() {
                if (setting.timerType !== TIMER_TYPE.LOOP || (setting.timerType === TIMER_TYPE.LOOP && setting.timerLoopTimeout === 0)) {
                    return;
                }

                stopLoopTimeoutTimer();
                loopTimeoutTimerId = setTimeout(() => {
                    stopTimer(true, setting.loopTimeoutMessage);
                }, timerLoopTimeoutInMilliseconds);
            }

            function stopLoopTimeoutTimer() {
                if (loopTimeoutTimerId === undefined) {
                    return;
                }

                clearTimeout(loopTimeoutTimerId);
                loopTimeoutTimerId = undefined;
            }

            function finishTimer() {
                override = null;
                stopLoopTimeoutTimer();
                stopClockTimer();
                destroyTimer();

                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = undefined;
                currentLoopIteration = 0;

                currentState = STATE.IDLE;
                node.status({ fill: 'grey', shape: 'ring', text: 'Idle' });
            }

            function handleLoopMaxIterations() {
                currentLoopIteration = currentLoopIteration + 1;

                if (currentLoopIteration === setting.timerMaxLoopIterations) {
                    stopTimer(true, setting.loopMaxIterationsMessage);
                }
            }

            function createAndGetTimer(durationInMillisecondsOverride?: number) {
                startLoopTimeoutTimer();
                currentLoopIteration = 0;

                const durationInMilliseconds = durationInMillisecondsOverride ?? override?.durationInMilliseconds ?? timerDurationInMilliseconds;

                if ((override !== null && override.timerType === TIMER_TYPE.LOOP) || (override === null && setting.timerType === TIMER_TYPE.LOOP)) {
                    return setInterval(() => {
                        const outputMessage = setting.outputReceivedMessageOnTimerTrigger
                            ? RED.util.cloneMessage(message)
                            : { [setting.actionPropertyName]: setting.timerTriggeredMessage };

                        node.send([outputMessage, null]);
                        timerStartedAtUnixTimestamp = Date.now();
                        pausedTimerRunningMilliseconds = undefined;

                        if (durationInMillisecondsOverride && durationInMillisecondsOverride !== timerDurationInMilliseconds) {
                            resetTimer();
                        }

                        handleLoopMaxIterations();
                    }, durationInMilliseconds);
                }

                if ((override !== null && override.timerType === TIMER_TYPE.DELAY) || (override === null && setting.timerType === TIMER_TYPE.DELAY)) {
                    return setTimeout(() => {
                        const outputMessage = setting.outputReceivedMessageOnTimerTrigger
                            ? RED.util.cloneMessage(message)
                            : { [setting.actionPropertyName]: setting.timerTriggeredMessage };

                        node.send([outputMessage, null]);
                        finishTimer();
                    }, durationInMilliseconds);
                }
            }

            function sendError(error: Error) {
                if (done) {
                    // Node-RED 1.0 compatible
                    done(error);
                } else {
                    // Node-RED 0.x compatible
                    node.error(error, message);
                }
            }

            function startTimer() {
                startLoopTimeoutTimer();
                stopStoppedIdleTimer();
                destroyTimer();

                timerId = createAndGetTimer();
                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = Date.now();

                startClockTimer();

                currentState = STATE.RUNNING;
                node.status({ fill: 'green', shape: 'dot', text: `Running${getRunningTimerProgress()}` });
            }

            function stopTimer(timerWasRunning: boolean, stopMessage?: string) {
                override = null;
                stopLoopTimeoutTimer();
                stopClockTimer();
                destroyTimer();

                timerId = undefined;
                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = undefined;
                currentLoopIteration = 0;

                currentState = STATE.STOPPED;
                node.status({ fill: 'red', shape: 'dot', text: 'Stopped' });

                if (timerWasRunning && !stopMessage) {
                    const outputMessage = setting.outputReceivedMessageOnTimerHalt ? RED.util.cloneMessage(message) : { [setting.actionPropertyName]: setting.timerHaltedMessage };
                    node.send([null, outputMessage]);
                }

                if (timerWasRunning && stopMessage) {
                    const outputMessage = {
                        [setting.actionPropertyName]: stopMessage,
                    };

                    node.send([null, outputMessage]);
                }

                startStoppedIdleTimer();
            }

            function pauseTimer() {
                stopLoopTimeoutTimer();
                stopClockTimer();
                destroyTimer();

                const previousRunningDurationInMilliseconds = pausedTimerRunningMilliseconds ?? 0;
                pausedTimerRunningMilliseconds = Date.now() - timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds;
                timerStartedAtUnixTimestamp = undefined;

                currentState = STATE.PAUSED;
                node.status({ fill: 'yellow', shape: 'dot', text: `Paused${getPausedTimerProgress()}` });

                const outputMessage = setting.outputReceivedMessageOnTimerHalt ? RED.util.cloneMessage(message) : { [setting.actionPropertyName]: setting.timerHaltedMessage };
                node.send([null, outputMessage]);
            }

            function resetTimer() {
                stopClockTimer();
                destroyTimer();

                timerId = createAndGetTimer();
                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = Date.now();

                startClockTimer();

                currentState = STATE.RUNNING;
                node.status({ fill: 'green', shape: 'dot', text: `Running${getRunningTimerProgress()}` });
            }

            function continueTimer() {
                timerId = createAndGetTimer((override?.durationInMilliseconds ?? timerDurationInMilliseconds) - pausedTimerRunningMilliseconds);
                timerStartedAtUnixTimestamp = Date.now();

                startClockTimer();

                currentState = STATE.RUNNING;
                node.status({ fill: 'green', shape: 'dot', text: `Running${getRunningTimerProgress()}` });
            }

            if (currentState === STATE.IDLE) {
                if (isStartActionMessage) {
                    startTimer();
                    done();
                    return;
                }

                if (setting.startTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    startTimer();
                    done();
                    return;
                }
            }

            if (currentState === STATE.RUNNING) {
                if ((isStartActionMessage && setting.isConsecutiveStartActionTimerResetAllowed) || isStartActionExternalOverrideMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (isResetActionMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (setting.resetTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (isStopActionMessage) {
                    stopTimer(true);
                    done();
                    return;
                }

                if (isPauseActionMessage) {
                    pauseTimer();
                    done();
                    return;
                }
            }

            if (currentState === STATE.STOPPED) {
                if (isStartActionMessage) {
                    startTimer();
                    done();
                    return;
                }

                if (setting.startTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    startTimer();
                    done();
                    return;
                }
            }

            if (currentState === STATE.PAUSED) {
                if (isStartActionMessage && setting.isConsecutiveStartActionTimerResetAllowed) {
                    resetTimer();
                    done();
                    return;
                }

                if (isResetActionMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (setting.resetTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (isStopActionMessage) {
                    stopTimer(false);
                    done();
                    return;
                }

                if (isContinueActionMessage) {
                    continueTimer();
                    done();
                    return;
                }
            }

            if (setting.isDebugModeEnabled) {
                sendError(new Error(`Can't trigger "${message[setting.actionPropertyName]}" action while state is "${currentState}"!`));
            }
        });

        node.on('close', (done) => {
            override = null;
            clearInterval(clockTimerId);
            clearInterval(loopTimeoutTimerId);
            stopClockTimer();
            destroyTimer();

            pausedTimerRunningMilliseconds = undefined;
            timerStartedAtUnixTimestamp = undefined;

            done();
        });
    });
};
