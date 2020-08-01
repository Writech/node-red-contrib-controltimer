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
    isConsecutiveStartActionTimerResetAllowed: boolean;
    isRunningTimerProgressVisible: boolean;
    timerType: TIMER_TYPE;
    timerDurationUnit: TimerDurationUnit;
    timerDurationType: TimerDurationType;
    timerDuration: string;
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
    isConsecutiveStartActionTimerResetAllowed: boolean;
    isRunningTimerProgressVisible: boolean;
    timerType: TIMER_TYPE;
    timerDurationUnit: TimerDurationUnit;
    timerDurationType: TimerDurationType;
    timerDuration: number;
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
    isConsecutiveStartActionTimerResetAllowed: false,
    isRunningTimerProgressVisible: false,
    timerType: TIMER_TYPE.DELAY,
    timerDurationUnit: TimerDurationUnit.SECOND,
    timerDurationType: 'num',
    timerDuration: '5',
    actionPropertyNameType: 'msg',
    actionPropertyName: 'payload',
    startActionName: 'START',
    resetActionName: 'RESET',
    pauseActionName: 'PAUSE',
    continueActionName: 'CONTINUE',
    stopActionName: 'STOP',
};
