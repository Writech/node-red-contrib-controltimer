import { Node, NodeAPI, NodeMessageInFlow } from 'node-red';

import { constants, ControlTimerNodeDef, nodeName } from './node-config';
import { STATE, Timer } from './timer';

type NodeMessage = NodeMessageInFlow;

module.exports = function (RED: NodeAPI): void {
    RED.nodes.registerType(nodeName, function (config: ControlTimerNodeDef) {
        RED.nodes.createNode(this, config);
        const node: Node = this;
        let lastMessage: NodeMessage;

        const getMessage = (message: string | number) => ({ [config.actionPropertyName]: message });
        const getTriggerMessage = () =>
            config.outputReceivedMessageOnTimerTrigger ? RED.util.cloneMessage(lastMessage) : getMessage(config.timerTriggeredMessage);
        const getHaltedMessage = () => (config.outputReceivedMessageOnTimerHalt ? RED.util.cloneMessage(lastMessage) : getMessage(config.timerHaltedMessage));

        const timer = Timer.getInstance({
            timerType: config.timerType,
            duration: config.timerDuration,
            durationUnit: config.timerDurationUnit,
            isTimerProgressUpdateEnabled: config.isRunningTimerProgressVisible,
            timerMaxLoopIterations: config.timerMaxLoopIterations,
            timerLoopTimeout: config.timerLoopTimeout,
            timerLoopTimeoutUnit: config.timerLoopTimeoutUnit,
        });

        timer.on('state', ({ state, progress }) => {
            if (state === STATE.IDLE) {
                node.status({ fill: 'grey', shape: 'ring', text: 'Idle' });
            }

            if (state === STATE.RUNNING) {
                node.status({ fill: 'green', shape: 'dot', text: `Running${progress}` });
            }

            if (state === STATE.STOPPED) {
                node.status({ fill: 'red', shape: 'dot', text: 'Stopped' });
            }

            if (state === STATE.PAUSED) {
                node.status({ fill: 'yellow', shape: 'dot', text: `Paused${progress}` });
            }
        });

        timer.on(STATE.STOPPED, () => node.send([null, getHaltedMessage()]));
        timer.on(STATE.PAUSED, () => node.send([null, getHaltedMessage()]));
        timer.on('timer', () => node.send([getTriggerMessage(), null]));
        timer.on('loop-timeout', () => node.send([null, getMessage(config.loopTimeoutMessage)]));
        timer.on('loop-max-iterations', () => node.send([null, getMessage(config.loopMaxIterationsMessage)]));

        node.on('input', (message: NodeMessage, send, done) => {
            lastMessage = message;

            const isStartActionMessage = message[config.actionPropertyName] === config.startActionName && config.isStartActionEnabled;
            const isResetActionMessage = message[config.actionPropertyName] === config.resetActionName && config.isResetActionEnabled;
            const isPauseActionMessage = message[config.actionPropertyName] === config.pauseActionName && config.isPauseActionEnabled;
            const isContinueActionMessage = message[config.actionPropertyName] === config.continueActionName && config.isContinueActionEnabled;
            const isStopActionMessage = message[config.actionPropertyName] === config.stopActionName && config.isStopActionEnabled;
            const isUnknownMessage = !(isStartActionMessage || isResetActionMessage || isPauseActionMessage || isContinueActionMessage || isStopActionMessage);

            const timerTypeOverride = message[constants.timerTypeOverridePropertyName] ?? null;
            const timerDurationOverride = message[constants.timerDurationOverridePropertyName] ?? null;
            const timerDurationUnitOverride = message[constants.timerDurationUnitOverridePropertyName] ?? null;
            const isOverrideMessage = timerTypeOverride !== null && timerDurationOverride !== null && timerDurationUnitOverride !== null;

            if (isStartActionMessage && isOverrideMessage) {
                timer.setConfigOverride({
                    timerType: timerTypeOverride,
                    duration: timerDurationOverride,
                    durationUnit: timerDurationUnitOverride,
                });
            }

            if (timer.getState() === STATE.PAUSED) {
                if (isStartActionMessage && config.continueTimerOnReceivalOfStartAction) {
                    timer.continue();
                    done();
                    return;
                }
            }

            if (timer.getState() !== STATE.RUNNING) {
                if (isStartActionMessage || (isUnknownMessage && config.startTimerOnReceivalOfUnknownMessage)) {
                    timer.start();
                    done();
                    return;
                }
            }

            if (
                isResetActionMessage ||
                (isUnknownMessage && config.resetTimerOnReceivalOfUnknownMessage) ||
                (isStartActionMessage && config.resetTimerOnReceivalOfStartAction) ||
                (isStartActionMessage && isOverrideMessage)
            ) {
                timer.reset();
                done();
                return;
            }

            if (isStopActionMessage) {
                timer.stop();
                done();
                return;
            }

            if (isPauseActionMessage) {
                timer.pause();
                done();
                return;
            }

            if (isContinueActionMessage) {
                timer.continue();
                done();
                return;
            }
        });

        node.on('close', (done) => {
            timer.hardReset();
            done();
        });
    });
};
