import type { Node, NodeAPI, NodeMessageInFlow } from 'node-red';

import { type ControlTimerNodeDef, constants, nodeName } from './node-config';
import { STATE, Timer } from './timer';

type NodeMessage = NodeMessageInFlow;
type NodeMessageProperties = Record<string, unknown>;

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

        node.on('input', (message: NodeMessage, _send, done) => {
            lastMessage = message;
            const messageProperties = message as unknown as NodeMessageProperties;

            const isStartActionMessage = messageProperties[config.actionPropertyName] === config.startActionName && config.isStartActionEnabled;
            const isResetActionMessage = messageProperties[config.actionPropertyName] === config.resetActionName && config.isResetActionEnabled;
            const isPauseActionMessage = messageProperties[config.actionPropertyName] === config.pauseActionName && config.isPauseActionEnabled;
            const isContinueActionMessage = messageProperties[config.actionPropertyName] === config.continueActionName && config.isContinueActionEnabled;
            const isStopActionMessage = messageProperties[config.actionPropertyName] === config.stopActionName && config.isStopActionEnabled;
            const isUnknownMessage = !(isStartActionMessage || isResetActionMessage || isPauseActionMessage || isContinueActionMessage || isStopActionMessage);

            const timerTypeOverride = messageProperties[constants.timerTypeOverridePropertyName] ?? null;
            const timerDurationOverride = messageProperties[constants.timerDurationOverridePropertyName] ?? null;
            const timerDurationUnitOverride = messageProperties[constants.timerDurationUnitOverridePropertyName] ?? null;
            const isOverrideMessage = timerTypeOverride !== null && timerDurationOverride !== null && timerDurationUnitOverride !== null;

            if (isStartActionMessage && isOverrideMessage) {
                const configOverride = { timerType: timerTypeOverride, duration: timerDurationOverride, durationUnit: timerDurationUnitOverride };

                try {
                    Timer.validateConfigOverride(configOverride);
                } catch (error) {
                    done(error as Error);
                    return;
                }

                timer.setConfigOverride(configOverride);
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

        node.on('close', (done: () => void) => {
            timer.hardReset();
            done();
        });
    });
};
