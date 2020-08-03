import { Node, NodeProperties } from 'node-red';

export enum TIMER_TYPE {
    LOOP = 'loop',
    DELAY = 'delay',
}

export enum STATE {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    PAUSED = 'PAUSED',
}

export enum TimerDurationUnit {
    MILLISECOND = 'millisecond',
    SECOND = 'second',
    MINUTE = 'minute',
    HOUR = 'hour',
}

export type TimerDurationType = 'num';
export type ActionPropertyNameType = 'msg' | 'flow' | 'global';

export interface RawProps {
    name: string;
    timerType: TIMER_TYPE;
    timerDurationUnit: TimerDurationUnit;
    timerDurationType: TimerDurationType;
    timerDuration: string;
    isConsecutiveStartActionTimerResetAllowed: boolean;
    isRunningTimerProgressVisible: boolean;
    outputReceivedMessageOnTimerTrigger: boolean;
    outputReceivedMessageOnTimerHalt: boolean;
    startTimerOnReceivalOfUnknownMessage: boolean;
    resetTimerOnReceivalOfUnknownMessage: boolean;
    isStartActionEnabled: boolean;
    isResetActionEnabled: boolean;
    isStopActionEnabled: boolean;
    isPauseActionEnabled: boolean;
    isContinueActionEnabled: boolean;
    isDebugModeEnabled: boolean;
    actionPropertyNameType: ActionPropertyNameType;
    actionPropertyName: string;
    startActionName: string;
    resetActionName: string;
    pauseActionName: string;
    continueActionName: string;
    stopActionName: string;
}

export interface Props {
    name: string;
    timerType: TIMER_TYPE;
    timerDurationUnit: TimerDurationUnit;
    timerDurationType: TimerDurationType;
    timerDuration: number;
    isConsecutiveStartActionTimerResetAllowed: boolean;
    isRunningTimerProgressVisible: boolean;
    outputReceivedMessageOnTimerTrigger: boolean;
    outputReceivedMessageOnTimerHalt: boolean;
    startTimerOnReceivalOfUnknownMessage: boolean;
    resetTimerOnReceivalOfUnknownMessage: boolean;
    isStartActionEnabled: boolean;
    isResetActionEnabled: boolean;
    isStopActionEnabled: boolean;
    isPauseActionEnabled: boolean;
    isContinueActionEnabled: boolean;
    isDebugModeEnabled: boolean;
    actionPropertyNameType: ActionPropertyNameType;
    actionPropertyName: string;
    startActionName: string;
    resetActionName: string;
    pauseActionName: string;
    continueActionName: string;
    stopActionName: string;
}

export type NodeConfigRaw = NodeProperties & RawProps;
export type NodeConfig = Node & Props;
export type OutputMessage = [null | any, null | any];

export const nodeName = 'controltimer';

export const defaults: RawProps = {
    name: '',
    timerType: TIMER_TYPE.DELAY,
    timerDurationUnit: TimerDurationUnit.SECOND,
    timerDurationType: 'num',
    timerDuration: '5',
    isConsecutiveStartActionTimerResetAllowed: false,
    isRunningTimerProgressVisible: false,
    outputReceivedMessageOnTimerTrigger: true,
    outputReceivedMessageOnTimerHalt: true,
    startTimerOnReceivalOfUnknownMessage: false,
    resetTimerOnReceivalOfUnknownMessage: false,
    isStartActionEnabled: true,
    isResetActionEnabled: true,
    isStopActionEnabled: true,
    isPauseActionEnabled: true,
    isContinueActionEnabled: true,
    isDebugModeEnabled: false,
    actionPropertyNameType: 'msg',
    actionPropertyName: 'payload',
    startActionName: 'START',
    resetActionName: 'RESET',
    pauseActionName: 'PAUSE',
    continueActionName: 'CONTINUE',
    stopActionName: 'STOP',
};
