import { Node } from 'node-red';
import React from 'preact/compat';

import { DurationUnit, NodeProps, TIMER_TYPE } from '../../../../config.mjs';
import UiAccordion from '../ui/accordion/UiAccordion';
import UiInput from '../ui/input/UiInput';
import UiSelect from '../ui/select/UiSelect';

interface Props {
    node: Node & NodeProps;
    defaults: NodeProps;
}

export default function Editor({ node, defaults }: Props) {
    function resetToDefaults() {
        node.name = defaults.name;
        node.timerType = defaults.timerType;

        node.timerDurationUnit = defaults.timerDurationUnit;
        node.timerDurationType = defaults.timerDurationType;
        node.timerDuration = defaults.timerDuration;

        node.timerLoopTimeoutUnit = defaults.timerLoopTimeoutUnit;
        node.timerLoopTimeoutType = defaults.timerLoopTimeoutType;
        node.timerLoopTimeout = defaults.timerLoopTimeout;

        node.loopTimeoutMessageType = defaults.loopTimeoutMessageType;
        node.loopTimeoutMessage = defaults.loopTimeoutMessage;
        node.timerMaxLoopIterationsType = defaults.timerMaxLoopIterationsType;
        node.timerMaxLoopIterations = defaults.timerMaxLoopIterations;
        node.loopMaxIterationsMessageType = defaults.loopMaxIterationsMessageType;
        node.loopMaxIterationsMessage = defaults.loopMaxIterationsMessage;

        node.isConsecutiveStartActionTimerResetAllowed = defaults.isConsecutiveStartActionTimerResetAllowed;
        node.isRunningTimerProgressVisible = defaults.isRunningTimerProgressVisible;
        node.outputReceivedMessageOnTimerTrigger = defaults.outputReceivedMessageOnTimerTrigger;
        node.outputReceivedMessageOnTimerHalt = defaults.outputReceivedMessageOnTimerHalt;
        node.startTimerOnReceivalOfUnknownMessage = defaults.startTimerOnReceivalOfUnknownMessage;
        node.resetTimerOnReceivalOfUnknownMessage = defaults.resetTimerOnReceivalOfUnknownMessage;
        node.isDebugModeEnabled = defaults.isDebugModeEnabled;
        node.timerTriggeredMessageType = defaults.timerTriggeredMessageType;
        node.timerTriggeredMessage = defaults.timerTriggeredMessage;
        node.timerHaltedMessageType = defaults.timerHaltedMessageType;
        node.timerHaltedMessage = defaults.timerHaltedMessage;

        node.isStartActionEnabled = defaults.isStartActionEnabled;
        node.isResetActionEnabled = defaults.isResetActionEnabled;
        node.isStopActionEnabled = defaults.isStopActionEnabled;
        node.isPauseActionEnabled = defaults.isPauseActionEnabled;
        node.isContinueActionEnabled = defaults.isContinueActionEnabled;
        node.actionPropertyNameType = defaults.actionPropertyNameType;
        node.actionPropertyName = defaults.actionPropertyName;
        node.startActionNameType = defaults.startActionNameType;
        node.startActionName = defaults.startActionName;
        node.stopActionNameType = defaults.stopActionNameType;
        node.stopActionName = defaults.stopActionName;
        node.resetActionNameType = defaults.resetActionNameType;
        node.resetActionName = defaults.resetActionName;
        node.pauseActionNameType = defaults.pauseActionNameType;
        node.pauseActionName = defaults.pauseActionName;
        node.continueActionNameType = defaults.continueActionNameType;
        node.continueActionName = defaults.continueActionName;
    }
    return (
        <>
            {/*<div>This is Editor component</div>*/}
            {/*<Counter />*/}

            <UiInput label="Name" value={node.name} key="name" node={node} defaults={defaults} types={[]} />

            <UiSelect
                label="Timer type"
                value={node.timerType}
                key="name"
                node={node}
                defaults={defaults}
                options={[TIMER_TYPE.DELAY, TIMER_TYPE.DELAY]}
            />

            <UiSelect
                label="Timer duration unit"
                value={node.timerDurationUnit}
                key="name"
                node={node}
                defaults={defaults}
                options={[DurationUnit.MILLISECOND, DurationUnit.SECOND, DurationUnit.MINUTE, DurationUnit.HOUR]}
            />

            <UiInput label="Timer duration" value={node.timerDuration} key="name" node={node} defaults={defaults} types={['num']} />

            <UiAccordion name="This is name">
                <UiInput
                    label="Timer triggered message"
                    value={node.timerTriggeredMessage}
                    key="name"
                    node={node}
                    defaults={defaults}
                    types={[]}
                />
            </UiAccordion>

            <div className="form-row controltimer-input-row">
                <button type="button" className="red-ui-button" onClick={resetToDefaults}>
                    Reset to Default settings
                </button>
            </div>
        </>
    );
}
