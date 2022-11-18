export enum TIMER_TYPE {
    LOOP = 'loop',
    DELAY = 'delay',
}

export enum DurationUnit {
    MILLISECOND = 'millisecond',
    SECOND = 'second',
    MINUTE = 'minute',
    HOUR = 'hour',
}

export const nodeName = 'controltimer';
export const nodeCategory = 'timer';
export const nodeColor = '#C0DEED';
export const nodeDescription =
    // eslint-disable-next-line max-len
    'A controllable Node-RED timer node. Start, Stop, Reset, Pause and Continue the timer. Use the timer as a loop or a delay. See more info: https://github.com/Writech/node-red-contrib-controltimer';

export const defaults: NodeProps = {
    name: '',
    timerType: TIMER_TYPE.DELAY,

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

    isConsecutiveStartActionTimerResetAllowed: false,
    isRunningTimerProgressVisible: true,
    outputReceivedMessageOnTimerTrigger: true,
    outputReceivedMessageOnTimerHalt: false,
    startTimerOnReceivalOfUnknownMessage: false,
    resetTimerOnReceivalOfUnknownMessage: false,
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
};

export const constants = {
    timerTypeOverridePropertyName: 'timerType',
    timerDurationOverridePropertyName: 'timerDuration',
    timerDurationUnitOverridePropertyName: 'timerDurationUnit',
};

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

export interface NodeProps {
    name: string;
    timerType: TIMER_TYPE;

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

    isConsecutiveStartActionTimerResetAllowed: boolean;
    isRunningTimerProgressVisible: boolean;
    outputReceivedMessageOnTimerTrigger: boolean;
    outputReceivedMessageOnTimerHalt: boolean;
    startTimerOnReceivalOfUnknownMessage: boolean;
    resetTimerOnReceivalOfUnknownMessage: boolean;
    isDebugModeEnabled: boolean;

    isStartActionEnabled: boolean;
    isStopActionEnabled: boolean;
    isResetActionEnabled: boolean;
    isPauseActionEnabled: boolean;
    isContinueActionEnabled: boolean;
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
}

// type NodeRedInputType = 'str' | 'num';

interface BooleanValue {
    value: boolean;
    default: boolean;
}

interface StringValue {
    value: string;
    default: string;
    types: ['str'];
}

interface NumberValue {
    value: number;
    default: number;
    types: ['num'];
}

interface StringNumberValue {
    value: string | number;
    default: string | number;
    types: ['str', 'num'];
}

interface OptionValue<T> {
    value: T;
    default: T;
    options: T[];
}

export interface NodeProps2 {
    name: StringValue;
    timerType: OptionValue<TIMER_TYPE>;

    timerDurationUnit: OptionValue<DurationUnit>;
    timerDuration: NumberValue;

    timerLoopTimeoutUnit: OptionValue<DurationUnit>;
    timerLoopTimeout: NumberValue;
    loopTimeoutMessage: StringValue;

    timerMaxLoopIterations: NumberValue;
    loopMaxIterationsMessage: StringValue;

    timerTriggeredMessage: StringNumberValue;
    timerHaltedMessage: StringNumberValue;

    isConsecutiveStartActionTimerResetAllowed: BooleanValue;
    isRunningTimerProgressVisible: BooleanValue;
    outputReceivedMessageOnTimerTrigger: BooleanValue;
    outputReceivedMessageOnTimerHalt: BooleanValue;
    startTimerOnReceivalOfUnknownMessage: BooleanValue;
    resetTimerOnReceivalOfUnknownMessage: BooleanValue;
    isDebugModeEnabled: BooleanValue;

    isStartActionEnabled: BooleanValue;
    isStopActionEnabled: BooleanValue;
    isResetActionEnabled: BooleanValue;
    isPauseActionEnabled: BooleanValue;
    isContinueActionEnabled: BooleanValue;

    actionPropertyName: StringValue;
    startActionName: StringValue;
    stopActionName: StringValue;
    resetActionName: StringValue;
    pauseActionName: StringValue;
    continueActionName: StringValue;
}

export const defaults2: NodeProps2 = {
    name: {
        value: '',
        default: '',
        types: ['str'],
    },
    timerType: {
        value: TIMER_TYPE.DELAY,
        default: TIMER_TYPE.DELAY,
        options: [TIMER_TYPE.DELAY, TIMER_TYPE.LOOP],
    },

    timerDurationUnit: {
        value: DurationUnit.SECOND,
        default: DurationUnit.SECOND,
        options: [DurationUnit.MILLISECOND, DurationUnit.SECOND, DurationUnit.MINUTE, DurationUnit.HOUR],
    },
    timerDuration: {
        value: 5,
        default: 5,
        types: ['num'],
    },

    timerLoopTimeoutUnit: {
        value: DurationUnit.SECOND,
        default: DurationUnit.SECOND,
        options: [DurationUnit.MILLISECOND, DurationUnit.SECOND, DurationUnit.MINUTE, DurationUnit.HOUR],
    },
    timerLoopTimeout: {
        value: 0,
        default: 0,
        types: ['num'],
    },
    loopTimeoutMessage: {
        value: 'LOOP_TIMEOUT',
        default: 'LOOP_TIMEOUT',
        types: ['str'],
    },

    timerMaxLoopIterations: {
        value: 0,
        default: 0,
        types: ['num'],
    },
    loopMaxIterationsMessage: {
        value: 'MAX_LOOP_ITERATIONS',
        default: 'MAX_LOOP_ITERATIONS',
        types: ['str'],
    },

    timerTriggeredMessage: {
        value: 'TIMER_TRIGGERED',
        default: 'TIMER_TRIGGERED',
        types: ['str', 'num'],
    },
    timerHaltedMessage: {
        value: 'TIMER_HALTED',
        default: 'TIMER_HALTED',
        types: ['str', 'num'],
    },

    isConsecutiveStartActionTimerResetAllowed: {
        value: false,
        default: false,
    },
    isRunningTimerProgressVisible: {
        value: true,
        default: true,
    },
    outputReceivedMessageOnTimerTrigger: {
        value: true,
        default: true,
    },
    outputReceivedMessageOnTimerHalt: {
        value: false,
        default: false,
    },
    startTimerOnReceivalOfUnknownMessage: {
        value: false,
        default: false,
    },
    resetTimerOnReceivalOfUnknownMessage: {
        value: false,
        default: false,
    },
    isDebugModeEnabled: {
        value: false,
        default: false,
    },

    isStartActionEnabled: {
        value: true,
        default: true,
    },
    isStopActionEnabled: {
        value: true,
        default: true,
    },
    isResetActionEnabled: {
        value: true,
        default: true,
    },
    isPauseActionEnabled: {
        value: true,
        default: true,
    },
    isContinueActionEnabled: {
        value: true,
        default: true,
    },

    actionPropertyName: {
        value: 'payload',
        default: 'payload',
        types: ['str'],
    },
    startActionName: {
        value: 'START',
        default: 'START',
        types: ['str'],
    },
    stopActionName: {
        value: 'STOP',
        default: 'STOP',
        types: ['str'],
    },
    resetActionName: {
        value: 'RESET',
        default: 'RESET',
        types: ['str'],
    },
    pauseActionName: {
        value: 'PAUSE',
        default: 'PAUSE',
        types: ['str'],
    },
    continueActionName: {
        value: 'CONTINUE',
        default: 'CONTINUE',
        types: ['str'],
    },
};
