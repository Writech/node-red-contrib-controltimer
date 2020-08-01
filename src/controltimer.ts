import { Red } from 'node-red';
import { NodeConfig, NodeConfigRaw, defaults, nodeName, STATE, TIMER_TYPE } from './helpers';

module.exports = function (RED: Red) {
    RED.nodes.registerType(nodeName, function (config: NodeConfigRaw) {
        RED.nodes.createNode(this, config);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const node: NodeConfig = this;

        node.isConsecutiveStartActionTimerResetAllowed =
            config.isConsecutiveStartActionTimerResetAllowed ?? defaults.isConsecutiveStartActionTimerResetAllowed;
        node.isRunningTimerProgressVisible = config.isRunningTimerProgressVisible ?? defaults.isRunningTimerProgressVisible;
        node.timerType = config.timerType || defaults.timerType;
        node.timerDurationUnit = config.timerDurationUnit || defaults.timerDurationUnit;
        node.timerDurationType = config.timerDurationType || defaults.timerDurationType;
        node.timerDuration =
            parseInt(RED.util.evaluateNodeProperty(config.timerDuration, this.timerDurationType, this, null), 10) ||
            Number(defaults.timerDuration);
        node.actionPropertyNameType = config.actionPropertyNameType || defaults.actionPropertyNameType;
        node.actionPropertyName =
            RED.util.evaluateNodeProperty(config.actionPropertyName, this.actionPropertyNameType, this, null) ||
            defaults.actionPropertyName;
        node.startActionName = config.startActionName || defaults.startActionName;
        node.resetActionName = config.resetActionName || defaults.resetActionName;
        node.pauseActionName = config.pauseActionName || defaults.pauseActionName;
        node.continueActionName = config.continueActionName || defaults.continueActionName;
        node.stopActionName = config.stopActionName || defaults.stopActionName;

        const timerDurationInMilliseconds = (() => {
            node.timerDuration = Math.max(0, node.timerDuration);

            if (node.timerDurationUnit === 'second') {
                return this.timerDuration * 1000;
            }

            if (node.timerDurationUnit === 'minute') {
                return this.timerDuration * 1000 * 60;
            }

            if (node.timerDurationUnit === 'hour') {
                return this.timerDuration * 1000 * 60 * 60;
            }
        })();

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
            const timerPercentageCompletion =
                (100 * (Date.now() - timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds)) / timerDurationInMilliseconds;
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
            const isStartActionMessage = message[node.actionPropertyName] === node.startActionName;
            const isResetActionMessage = message[node.actionPropertyName] === node.resetActionName;
            const isPauseActionMessage = message[node.actionPropertyName] === node.pauseActionName;
            const isContinueActionMessage = message[node.actionPropertyName] === node.continueActionName;
            const isStopActionMessage = message[node.actionPropertyName] === node.stopActionName;

            function finishTimer() {
                stopClockTimer();
                destroyTimer();

                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = undefined;

                currentState = STATE.IDLE;
                node.status({ fill: 'grey', shape: 'ring', text: 'Idle' });
            }

            function createAndGetTimer(durationInMillisecondsOverride?: number) {
                if (node.timerType === TIMER_TYPE.LOOP) {
                    return setInterval(() => {
                        node.send([RED.util.cloneMessage(message), null]);
                        timerStartedAtUnixTimestamp = Date.now();
                        pausedTimerRunningMilliseconds = undefined;

                        if (durationInMillisecondsOverride && durationInMillisecondsOverride !== timerDurationInMilliseconds) {
                            resetTimer();
                        }
                    }, durationInMillisecondsOverride ?? timerDurationInMilliseconds);
                }

                if (node.timerType === TIMER_TYPE.DELAY) {
                    return setTimeout(() => {
                        node.send([RED.util.cloneMessage(message), null]);
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
                destroyTimer();

                timerId = createAndGetTimer();
                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = Date.now();

                startClockTimer();

                currentState = STATE.RUNNING;
                node.status({ fill: 'green', shape: 'dot', text: `Running${getRunningTimerProgress()}` });
            }

            function stopTimer(timerWasRunning: boolean) {
                stopClockTimer();
                destroyTimer();

                timerId = undefined;
                pausedTimerRunningMilliseconds = undefined;
                timerStartedAtUnixTimestamp = undefined;

                currentState = STATE.STOPPED;
                node.status({ fill: 'red', shape: 'dot', text: 'Stopped' });

                if (timerWasRunning) {
                    node.send([null, RED.util.cloneMessage(message)]);
                }
            }

            function pauseTimer() {
                stopClockTimer();
                destroyTimer();

                const previousRunningDurationInMilliseconds = pausedTimerRunningMilliseconds ?? 0;
                pausedTimerRunningMilliseconds = Date.now() - timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds;
                timerStartedAtUnixTimestamp = undefined;

                currentState = STATE.PAUSED;
                node.status({ fill: 'yellow', shape: 'dot', text: `Paused${getPausedTimerProgress()}` });
                node.send([null, RED.util.cloneMessage(message)]);
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

            sendError(new Error(`Can't trigger "${message[node.actionPropertyName]}" action while state is "${currentState}"!`));
        });

        node.on('close', (done) => {
            clearInterval(clockTimerId);
            destroyTimer();
            stopClockTimer();

            pausedTimerRunningMilliseconds = undefined;
            timerStartedAtUnixTimestamp = undefined;

            done();
        });
    });
};
