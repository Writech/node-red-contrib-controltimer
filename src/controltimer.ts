import { Red } from 'node-red';
import { NodeConfig, NodeConfigRaw, defaults, nodeName, STATE, TIMER_TYPE, DurationUnit } from './helpers';

module.exports = function (RED: Red) {
    RED.nodes.registerType(nodeName, function (config: NodeConfigRaw) {
        RED.nodes.createNode(this, config);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node: NodeConfig = this;

        function getEvaluatedProperty(property: string | number, propertyType: 'num' | 'str', defaultProperty: string | number) {
            return propertyType === 'num'
                ? parseInt(RED.util.evaluateNodeProperty(property, propertyType, this, null), 10) || Number(defaultProperty)
                : RED.util.evaluateNodeProperty(property, propertyType, this, null) || defaultProperty;
        }

        node.timerType = config.timerType || defaults.timerType;
        node.timerDurationUnit = config.timerDurationUnit || defaults.timerDurationUnit;
        node.timerDurationType = config.timerDurationType || defaults.timerDurationType;
        node.timerDuration = getEvaluatedProperty(config.timerDuration, node.timerDurationType, defaults.timerDuration);

        node.timerLoopTimeoutUnit = config.timerLoopTimeoutUnit || defaults.timerLoopTimeoutUnit;
        node.timerLoopTimeoutType = config.timerLoopTimeoutType || defaults.timerLoopTimeoutType;
        node.timerLoopTimeout = getEvaluatedProperty(config.timerLoopTimeout, node.timerLoopTimeoutType, defaults.timerLoopTimeout);
        node.loopTimeoutMessageType = config.loopTimeoutMessageType || defaults.loopTimeoutMessageType;
        node.loopTimeoutMessage = getEvaluatedProperty(config.loopTimeoutMessage, node.loopTimeoutMessageType, defaults.loopTimeoutMessage);
        node.timerMaxLoopIterationsType = config.timerMaxLoopIterationsType || defaults.timerMaxLoopIterationsType;
        node.timerMaxLoopIterations = getEvaluatedProperty(config.timerMaxLoopIterations, node.timerMaxLoopIterationsType, defaults.timerMaxLoopIterations);
        node.loopMaxIterationsMessageType = config.loopMaxIterationsMessageType || defaults.loopMaxIterationsMessageType;
        node.loopMaxIterationsMessage = getEvaluatedProperty(config.loopMaxIterationsMessage, node.loopMaxIterationsMessageType, defaults.loopMaxIterationsMessage);

        node.isConsecutiveStartActionTimerResetAllowed = config.isConsecutiveStartActionTimerResetAllowed ?? defaults.isConsecutiveStartActionTimerResetAllowed;
        node.isRunningTimerProgressVisible = config.isRunningTimerProgressVisible ?? defaults.isRunningTimerProgressVisible;
        node.outputReceivedMessageOnTimerTrigger = config.outputReceivedMessageOnTimerTrigger ?? defaults.outputReceivedMessageOnTimerTrigger;
        node.outputReceivedMessageOnTimerHalt = config.outputReceivedMessageOnTimerHalt ?? defaults.outputReceivedMessageOnTimerHalt;
        node.startTimerOnReceivalOfUnknownMessage = config.startTimerOnReceivalOfUnknownMessage ?? defaults.startTimerOnReceivalOfUnknownMessage;
        node.resetTimerOnReceivalOfUnknownMessage = config.resetTimerOnReceivalOfUnknownMessage ?? defaults.resetTimerOnReceivalOfUnknownMessage;
        node.isDebugModeEnabled = config.isDebugModeEnabled ?? defaults.isDebugModeEnabled;
        node.timerTriggeredMessageType = config.timerTriggeredMessageType || defaults.timerTriggeredMessageType;
        node.timerTriggeredMessage = getEvaluatedProperty(config.timerTriggeredMessage, node.timerTriggeredMessageType, defaults.timerTriggeredMessage);
        node.timerHaltedMessageType = config.timerHaltedMessageType || defaults.timerHaltedMessageType;
        node.timerHaltedMessage = getEvaluatedProperty(config.timerHaltedMessage, node.timerHaltedMessageType, defaults.timerHaltedMessage);

        node.isStartActionEnabled = config.isStartActionEnabled ?? defaults.isStartActionEnabled;
        node.isStopActionEnabled = config.isStopActionEnabled ?? defaults.isStopActionEnabled;
        node.isResetActionEnabled = config.isResetActionEnabled ?? defaults.isResetActionEnabled;
        node.isPauseActionEnabled = config.isPauseActionEnabled ?? defaults.isPauseActionEnabled;
        node.isContinueActionEnabled = config.isContinueActionEnabled ?? defaults.isContinueActionEnabled;
        node.actionPropertyNameType = config.actionPropertyNameType || defaults.actionPropertyNameType;
        node.actionPropertyName = getEvaluatedProperty(config.actionPropertyName, node.actionPropertyNameType, defaults.actionPropertyName);
        node.startActionNameType = config.startActionNameType || defaults.startActionNameType;
        node.startActionName = getEvaluatedProperty(config.startActionName, node.startActionNameType, defaults.startActionName);
        node.stopActionNameType = config.stopActionNameType || defaults.stopActionNameType;
        node.stopActionName = getEvaluatedProperty(config.stopActionName, node.stopActionNameType, defaults.stopActionName);
        node.resetActionNameType = config.resetActionNameType || defaults.resetActionNameType;
        node.resetActionName = getEvaluatedProperty(config.resetActionName, node.resetActionNameType, defaults.resetActionName);
        node.pauseActionNameType = config.pauseActionNameType || defaults.pauseActionNameType;
        node.pauseActionName = getEvaluatedProperty(config.pauseActionName, node.pauseActionNameType, defaults.pauseActionName);
        node.continueActionNameType = config.continueActionNameType || defaults.continueActionNameType;
        node.continueActionName = getEvaluatedProperty(config.continueActionName, node.continueActionNameType, defaults.continueActionName);

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

        const timerDurationInMilliseconds = getDurationInMilliseconds(node.timerDuration, node.timerDurationUnit);
        const timerLoopTimeoutInMilliseconds = getDurationInMilliseconds(node.timerLoopTimeout, node.timerLoopTimeoutUnit);

        node.status({ fill: 'grey', shape: 'ring', text: 'Idle' });
        let currentState = STATE.IDLE;

        let timerId: any;
        let pausedTimerRunningMilliseconds: number;
        let timerStartedAtUnixTimestamp: number;

        function getRunningTimerProgress() {
            if (!node.isRunningTimerProgressVisible) {
                return '';
            }

            const previousRunningDurationInMilliseconds = pausedTimerRunningMilliseconds ?? 0;
            const timerPercentageCompletion = (100 * (Date.now() - timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds)) / timerDurationInMilliseconds;
            return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${node.timerDuration} ${node.timerDurationUnit}(s)`;
        }

        function getPausedTimerProgress() {
            if (!node.isRunningTimerProgressVisible) {
                return '';
            }

            const timerPercentageCompletion = (100 * pausedTimerRunningMilliseconds) / timerDurationInMilliseconds;
            return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${node.timerDuration} ${node.timerDurationUnit}(s)`;
        }

        let clockTimerId: NodeJS.Timeout;
        let stopIdleTimerId: NodeJS.Timeout;
        let loopTimeoutTimerId: NodeJS.Timeout;
        let currentLoopIteration = 0;

        function startClockTimer() {
            if (!node.isRunningTimerProgressVisible) {
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
            if (!node.isRunningTimerProgressVisible) {
                return;
            }

            clearInterval(clockTimerId);
            clockTimerId = undefined;
        }

        function destroyTimer() {
            if (timerId === undefined) {
                return;
            }

            if (node.timerType === TIMER_TYPE.LOOP) {
                clearInterval(timerId);
            }

            if (node.timerType === TIMER_TYPE.DELAY) {
                clearTimeout(timerId);
            }

            timerId = undefined;
        }

        // TODO: Determine what happens when timer is paused right at the moment the timer expires

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node.on('input', (message, send, done) => {
            const isStartActionMessage = message[node.actionPropertyName] === node.startActionName && node.isStartActionEnabled;
            const isResetActionMessage = message[node.actionPropertyName] === node.resetActionName && node.isResetActionEnabled;
            const isPauseActionMessage = message[node.actionPropertyName] === node.pauseActionName && node.isPauseActionEnabled;
            const isContinueActionMessage = message[node.actionPropertyName] === node.continueActionName && node.isContinueActionEnabled;
            const isStopActionMessage = message[node.actionPropertyName] === node.stopActionName && node.isStopActionEnabled;
            const isUnknownMessage = !(isStartActionMessage || isResetActionMessage || isPauseActionMessage || isContinueActionMessage || isStopActionMessage);

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
                if (node.timerType !== TIMER_TYPE.LOOP || (node.timerType === TIMER_TYPE.LOOP && node.timerLoopTimeout === 0)) {
                    return;
                }

                stopLoopTimeoutTimer();
                loopTimeoutTimerId = setTimeout(() => {
                    stopTimer(true, node.loopTimeoutMessage);
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

                if (currentLoopIteration === node.timerMaxLoopIterations) {
                    stopTimer(true, node.loopMaxIterationsMessage);
                }
            }

            function createAndGetTimer(durationInMillisecondsOverride?: number) {
                startLoopTimeoutTimer();
                currentLoopIteration = 0;

                if (node.timerType === TIMER_TYPE.LOOP) {
                    return setInterval(() => {
                        const outputMessage = node.outputReceivedMessageOnTimerTrigger ? RED.util.cloneMessage(message) : { [node.actionPropertyName]: node.timerTriggeredMessage };
                        node.send([outputMessage, null]);
                        timerStartedAtUnixTimestamp = Date.now();
                        pausedTimerRunningMilliseconds = undefined;

                        if (durationInMillisecondsOverride && durationInMillisecondsOverride !== timerDurationInMilliseconds) {
                            resetTimer();
                        }

                        handleLoopMaxIterations();
                    }, durationInMillisecondsOverride ?? timerDurationInMilliseconds);
                }

                if (node.timerType === TIMER_TYPE.DELAY) {
                    return setTimeout(() => {
                        const outputMessage = node.outputReceivedMessageOnTimerTrigger ? RED.util.cloneMessage(message) : { [node.actionPropertyName]: node.timerTriggeredMessage };
                        node.send([outputMessage, null]);
                        finishTimer();
                    }, durationInMillisecondsOverride ?? timerDurationInMilliseconds);
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
                    const outputMessage = node.outputReceivedMessageOnTimerHalt ? RED.util.cloneMessage(message) : { [node.actionPropertyName]: node.timerHaltedMessage };
                    node.send([null, outputMessage]);
                }

                if (timerWasRunning && stopMessage) {
                    const outputMessage = {
                        [node.actionPropertyName]: stopMessage,
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

                const outputMessage = node.outputReceivedMessageOnTimerHalt ? RED.util.cloneMessage(message) : { [node.actionPropertyName]: node.timerHaltedMessage };
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
                timerId = createAndGetTimer(timerDurationInMilliseconds - pausedTimerRunningMilliseconds);
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

                if (node.startTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    startTimer();
                    done();
                    return;
                }
            }

            if (currentState === STATE.RUNNING) {
                if (isStartActionMessage && node.isConsecutiveStartActionTimerResetAllowed) {
                    resetTimer();
                    done();
                    return;
                }

                if (isResetActionMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (node.resetTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
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

                if (node.startTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
                    startTimer();
                    done();
                    return;
                }
            }

            if (currentState === STATE.PAUSED) {
                if (isStartActionMessage && node.isConsecutiveStartActionTimerResetAllowed) {
                    resetTimer();
                    done();
                    return;
                }

                if (isResetActionMessage) {
                    resetTimer();
                    done();
                    return;
                }

                if (node.resetTimerOnReceivalOfUnknownMessage && isUnknownMessage) {
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

            if (node.isDebugModeEnabled) {
                sendError(new Error(`Can't trigger "${message[node.actionPropertyName]}" action while state is "${currentState}"!`));
            }
        });

        node.on('close', (done) => {
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
