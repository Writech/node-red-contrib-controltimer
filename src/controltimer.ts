import { Node, NodeAPI, NodeMessageInFlow } from 'node-red';

import { ControlTimerNodeDef, nodeName } from './node-config';
import { STATE, Timer } from './timer';

type NodeMessage = NodeMessageInFlow;

module.exports = function (RED: NodeAPI): void {
    RED.nodes.registerType(nodeName, function (config: ControlTimerNodeDef) {
        RED.nodes.createNode(this, config);
        const node: Node = this;

        const timer = Timer.getInstance({
            baseConfig: {
                isStartAllowedToResetTimer: config.isConsecutiveStartActionTimerResetAllowed,
                isTimerProgressUpdateEnabled: config.isRunningTimerProgressVisible,
                timerMaxLoopIterations: config.timerMaxLoopIterations,
                timerLoopTimeout: config.timerLoopTimeout,
                timerLoopTimeoutUnit: config.timerLoopTimeoutUnit,
            },
            config: {
                timerType: config.timerType,
                duration: config.timerDuration,
                durationUnit: config.timerDurationUnit,
            },
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
                node.status({ fill: 'grey', shape: 'ring', text: `Paused${progress}` });
            }
        });

        timer.on('loop-timeout', () => {
            // TODO
        });

        timer.on('loop-max-iterations', () => {
            // TODO
        });

        timer.on('timer', () => {
            // TODO
        });

        node.on('input', (message: NodeMessage, send, done) => {
            const isStartActionMessage = message[config.actionPropertyName] === config.startActionName && config.isStartActionEnabled;
            const isResetActionMessage = message[config.actionPropertyName] === config.resetActionName && config.isResetActionEnabled;
            const isPauseActionMessage = message[config.actionPropertyName] === config.pauseActionName && config.isPauseActionEnabled;
            const isContinueActionMessage = message[config.actionPropertyName] === config.continueActionName && config.isContinueActionEnabled;
            const isStopActionMessage = message[config.actionPropertyName] === config.stopActionName && config.isStopActionEnabled;
            const isUnknownMessage = !(isStartActionMessage || isResetActionMessage || isPauseActionMessage || isContinueActionMessage || isStopActionMessage);

            const timerTypeOverride = message[config.timerTypeOverridePropertyName] ?? null;
            const timerDurationOverride = message[config.timerDurationOverridePropertyName] ?? null;
            const timerDurationUnitOverride = message[config.timerDurationUnitOverridePropertyName] ?? null;
            const isOverrideMessage = timerTypeOverride !== null && timerDurationOverride !== null && timerDurationUnitOverride !== null;

            if (isStartActionMessage && isOverrideMessage) {
                timer.setConfigOverride({
                    timerType: timerTypeOverride,
                    duration: timerDurationOverride,
                    durationUnit: timerDurationUnitOverride,
                });
            }

            if ((isStartActionMessage && !isOverrideMessage) || (isUnknownMessage && config.startTimerOnReceivalOfUnknownMessage)) {
                timer.start();
                done();
                return;
            }

            if (isStopActionMessage) {
                timer.stop();
            }

            if (
                isResetActionMessage ||
                (isUnknownMessage && config.resetTimerOnReceivalOfUnknownMessage) ||
                (isStartActionMessage && config.isConsecutiveStartActionTimerResetAllowed) ||
                (isStartActionMessage && isOverrideMessage)
            ) {
                timer.reset();
                done();
                return;
            }

            if (isPauseActionMessage) {
                timer.pause();
            }

            if (isContinueActionMessage) {
                timer.continue();
            }
        });

        node.on('close', (done) => {
            timer.hardReset();
            done();
        });
    });
};
