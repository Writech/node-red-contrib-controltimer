import { NodeDef } from 'node-red';

import { DurationUnit, TimerType } from './timer';

export const nodeName = 'controltimer';
export type ControlTimerNodeDef = NodeDef & Props;

export type TimerDurationType = 'num';
export type TimerLoopTimeoutType = 'num';
export type LoopTimeoutMessageType = 'str';
export type TimerMaxLoopIterationsType = 'num';
export type LoopMaxIterationsMessageType = 'str';
export type TimerTriggeredMessageType = 'str' | 'num';
export type TimerHaltedMessageType = 'str' | 'num';
export type ActionPropertyNameType = 'str';
export type StartActionNameType = 'str';
export type StopActionNameType = 'str';
export type ResetActionNameType = 'str';
export type PauseActionNameType = 'str';
export type ContinueActionNameType = 'str';
export type ConfigActionNameType = 'str';

export interface Props {
    name: string;
    timerType: TimerType;

    timerDurationUnit: DurationUnit;
    timerDurationType: TimerDurationType;
    timerDuration: number;

    timerLoopTimeoutUnit: DurationUnit;
    timerLoopTimeoutType: TimerLoopTimeoutType;
    timerLoopTimeout: number;

    loopTimeoutMessageType: LoopTimeoutMessageType;
    loopTimeoutMessage: string;
    timerMaxLoopIterationsType: TimerMaxLoopIterationsType;
    timerMaxLoopIterations: number;
    loopMaxIterationsMessageType: LoopMaxIterationsMessageType;
    loopMaxIterationsMessage: string;
    timerTriggeredMessageType: TimerTriggeredMessageType;
    timerTriggeredMessage: string | number;
    timerHaltedMessageType: TimerHaltedMessageType;
    timerHaltedMessage: string | number;

    isRunningTimerProgressVisible: boolean;
    outputReceivedMessageOnTimerTrigger: boolean;
    outputReceivedMessageOnTimerHalt: boolean;
    startTimerOnReceivalOfUnknownMessage: boolean;
    resetTimerOnReceivalOfUnknownMessage: boolean;
    resetTimerOnReceivalOfStartAction: boolean;
    continueTimerOnReceivalOfStartAction: boolean;
    isDebugModeEnabled: boolean;

    isStartActionEnabled: boolean;
    isStopActionEnabled: boolean;
    isResetActionEnabled: boolean;
    isPauseActionEnabled: boolean;
    isContinueActionEnabled: boolean;
    isConfigActionEnabled: boolean;
    actionPropertyNameType: ActionPropertyNameType;
    actionPropertyName: string;
    startActionNameType: StartActionNameType;
    startActionName: string;
    stopActionNameType: StopActionNameType;
    stopActionName: string;
    resetActionNameType: ResetActionNameType;
    resetActionName: string;
    pauseActionNameType: PauseActionNameType;
    pauseActionName: string;
    continueActionNameType: ContinueActionNameType;
    continueActionName: string;
    configActionNameType: ConfigActionNameType;
    configActionName: string;
}

export const defaults: Props = {
    name: '',
    timerType: TimerType.DELAY,

    timerDurationUnit: DurationUnit.SECOND,
    timerDurationType: 'num',
    timerDuration: 5,

    timerLoopTimeoutUnit: DurationUnit.SECOND,
    timerLoopTimeoutType: 'num',
    timerLoopTimeout: 0,

    loopTimeoutMessageType: 'str',
    loopTimeoutMessage: 'LOOP_TIMEOUT',
    timerMaxLoopIterationsType: 'num',
    timerMaxLoopIterations: 0,
    loopMaxIterationsMessageType: 'str',
    loopMaxIterationsMessage: 'MAX_LOOP_ITERATIONS',

    isRunningTimerProgressVisible: true,
    outputReceivedMessageOnTimerTrigger: true,
    outputReceivedMessageOnTimerHalt: false,
    startTimerOnReceivalOfUnknownMessage: false,
    resetTimerOnReceivalOfUnknownMessage: false,
    resetTimerOnReceivalOfStartAction: false,
    continueTimerOnReceivalOfStartAction: false,
    isDebugModeEnabled: false,
    timerTriggeredMessageType: 'str',
    timerTriggeredMessage: 'TIMER_TRIGGERED',
    timerHaltedMessageType: 'str',
    timerHaltedMessage: 'TIMER_HALTED',

    isStartActionEnabled: true,
    isStopActionEnabled: true,
    isResetActionEnabled: true,
    isPauseActionEnabled: true,
    isContinueActionEnabled: true,
    isConfigActionEnabled: true,
    actionPropertyNameType: 'str',
    actionPropertyName: 'payload',
    startActionNameType: 'str',
    startActionName: 'START',
    stopActionNameType: 'str',
    stopActionName: 'STOP',
    resetActionNameType: 'str',
    resetActionName: 'RESET',
    pauseActionNameType: 'str',
    pauseActionName: 'PAUSE',
    continueActionNameType: 'str',
    continueActionName: 'CONTINUE',
    configActionNameType: 'str',
    configActionName: 'CONFIG',
};

export const constants = {
    timerTypeOverridePropertyName: 'timerType',
    timerDurationOverridePropertyName: 'timerDuration',
    timerDurationUnitOverridePropertyName: 'timerDurationUnit',
};
