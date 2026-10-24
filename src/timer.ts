import { EventEmitter } from 'events';
import { clearInterval, clearTimeout } from 'timers';

import { type LongTimer, setLongInterval, setLongTimeout } from './long-timer';

enum ACTION {
    START = 'START',
    STOP = 'STOP',
    RESET = 'RESET',
    PAUSE = 'PAUSE',
    CONTINUE = 'CONTINUE',
}

export enum STATE {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    PAUSED = 'PAUSED',
}

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

interface TimerConfig {
    timerType: TIMER_TYPE;
    timerDuration: number;
    timerDurationUnit: DurationUnit;
    isTimerProgressUpdateEnabled: boolean;
    timerMaxLoopIterations: number;
    timerLoopTimeout: number;
    timerLoopTimeoutUnit: DurationUnit;
}

type ConfigOverride = Pick<TimerConfig, 'timerType' | 'timerDuration' | 'timerDurationUnit'>;
type UnvalidatedConfigOverride = { [Key in keyof ConfigOverride]: unknown };

export class Timer extends EventEmitter {
    static defaultConfig: TimerConfig = {
        timerType: TIMER_TYPE.DELAY,
        timerDuration: 5,
        timerDurationUnit: DurationUnit.SECOND,
        isTimerProgressUpdateEnabled: true,
        timerMaxLoopIterations: 0,
        timerLoopTimeout: 0,
        timerLoopTimeoutUnit: DurationUnit.MILLISECOND,
    };

    static validateConfigOverride(configOverride: UnvalidatedConfigOverride): asserts configOverride is ConfigOverride {
        const { timerType, timerDuration, timerDurationUnit } = configOverride;

        if (!Object.values(TIMER_TYPE).includes(timerType as TIMER_TYPE)) {
            throw new Error(`Invalid timerType "${String(timerType)}", expected one of: ${Object.values(TIMER_TYPE).join(', ')}`);
        }

        if (typeof timerDuration !== 'number' || !Number.isFinite(timerDuration) || timerDuration <= 0) {
            throw new Error(`Invalid timerDuration "${String(timerDuration)}", expected a number greater than 0`);
        }

        if (!Object.values(DurationUnit).includes(timerDurationUnit as DurationUnit)) {
            throw new Error(`Invalid timerDurationUnit "${String(timerDurationUnit)}", expected one of: ${Object.values(DurationUnit).join(', ')}`);
        }
    }

    static getInstance(config: TimerConfig) {
        return new Timer(config);
    }

    private config: TimerConfig = Timer.defaultConfig;
    private configOverride?: ConfigOverride;

    private currentState: STATE = STATE.IDLE;
    private timerId?: LongTimer;
    private progressUpdateIntervalTimerId?: NodeJS.Timeout;
    private stoppedTransitionToIdleTimeoutTimerId?: NodeJS.Timeout;
    private loopTimeoutTimeoutTimerId?: LongTimer;
    private currentLoopIteration = 0;
    private pausedTimerRunningMilliseconds?: number;
    private timerStartedAtUnixTimestamp?: number;
    private loopTimeoutStartedAtUnixTimestamp?: number;
    private loopTimeoutRunningMilliseconds = 0;

    constructor(config: TimerConfig) {
        super();
        this.config = config; // TODO: Validate config
        this.setCurrentState(STATE.IDLE);
    }

    // ####################
    // ## Public methods ##
    // ####################

    public start() {
        this.handleAction(ACTION.START);
    }

    public stop() {
        this.handleAction(ACTION.STOP);
    }

    public reset() {
        this.handleAction(ACTION.RESET);
    }

    public pause() {
        this.handleAction(ACTION.PAUSE);
    }

    public continue() {
        this.handleAction(ACTION.CONTINUE);
    }

    public hardReset() {
        this.configOverride = undefined;
        this.softReset();
    }

    private softReset() {
        this.currentState = STATE.IDLE;
        this.destroyTimers();
        this.currentLoopIteration = 0;
        this.pausedTimerRunningMilliseconds = undefined;
        this.timerStartedAtUnixTimestamp = undefined;
        this.loopTimeoutStartedAtUnixTimestamp = undefined;
        this.loopTimeoutRunningMilliseconds = 0;
    }

    public setConfigOverride(configOverride: UnvalidatedConfigOverride) {
        Timer.validateConfigOverride(configOverride);
        this.configOverride = configOverride;

        this.emit('state', { state: this.currentState, progress: this.getProgressForCurrentState() });
    }

    public getState() {
        return this.currentState;
    }

    // ###########################
    // ## Timer action handling ##
    // ###########################

    private handleAction(action: ACTION) {
        if (this.currentState === STATE.IDLE) {
            if (action === ACTION.START) {
                this.startTimer();
            }
        }

        if (this.currentState === STATE.RUNNING) {
            if (action === ACTION.STOP) {
                this.stopTimer();
            }

            if (action === ACTION.RESET) {
                this.resetTimer();
            }

            if (action === ACTION.PAUSE) {
                this.pauseTimer();
            }
        }

        if (this.currentState === STATE.STOPPED) {
            if (action === ACTION.START) {
                this.startTimer();
            }
        }

        if (this.currentState === STATE.PAUSED) {
            if (action === ACTION.STOP) {
                this.stopTimer();
            }

            if (action === ACTION.RESET) {
                this.resetTimer();
            }

            if (action === ACTION.CONTINUE) {
                this.continueTimer();
            }
        }
    }

    // ##########################
    // ## Timer action methods ##
    // ##########################

    private startTimer() {
        this.softReset();
        this.timerId = this.createAndGetTimer();
        this.setCurrentState(STATE.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private stopTimer() {
        this.hardReset();
        this.setCurrentState(STATE.STOPPED);
        this.startStoppedTransitionToIdleTimer();
    }

    private resetTimer() {
        this.softReset();
        this.timerId = this.createAndGetTimer();
        this.setCurrentState(STATE.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private pauseTimer() {
        this.destroyTimers();
        if (this.loopTimeoutStartedAtUnixTimestamp !== undefined) {
            this.loopTimeoutRunningMilliseconds += Date.now() - this.loopTimeoutStartedAtUnixTimestamp;
            this.loopTimeoutStartedAtUnixTimestamp = undefined;
        }
        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        // biome-ignore lint/style/noNonNullAssertion: only paused while running, so the start timestamp is set
        this.pausedTimerRunningMilliseconds = Date.now() - this.timerStartedAtUnixTimestamp! + previousRunningDurationInMilliseconds;
        this.timerStartedAtUnixTimestamp = undefined;
        this.setCurrentState(STATE.PAUSED, this.getPausedTimerProgress());
    }

    private continueTimer() {
        // biome-ignore lint/style/noNonNullAssertion: only continued while paused, so the paused duration is set
        this.timerId = this.createAndGetTimer(this.timerDurationInMilliseconds - this.pausedTimerRunningMilliseconds!);
        this.setCurrentState(STATE.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private finishTimer() {
        this.hardReset();
        this.setCurrentState(STATE.IDLE);
    }

    // ###########################
    // ## Timer helpers methods ##
    // ###########################

    private createAndGetTimer(durationInMillisecondsOverride?: number) {
        const durationInMilliseconds = durationInMillisecondsOverride ?? this.timerDurationInMilliseconds;

        if ((this.config.timerType === TIMER_TYPE.LOOP && !this.configOverride) || this.configOverride?.timerType === TIMER_TYPE.LOOP) {
            this.pausedTimerRunningMilliseconds = durationInMillisecondsOverride ? this.pausedTimerRunningMilliseconds : undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            this.startLoopTimeoutTimer(durationInMillisecondsOverride !== undefined);

            const isResumedWithRemainingDuration =
                durationInMillisecondsOverride !== undefined && durationInMillisecondsOverride !== this.timerDurationInMilliseconds;
            return this.createLoopInterval(durationInMilliseconds, isResumedWithRemainingDuration);
        }

        if ((this.config.timerType === TIMER_TYPE.DELAY && !this.configOverride) || this.configOverride?.timerType === TIMER_TYPE.DELAY) {
            this.pausedTimerRunningMilliseconds = durationInMillisecondsOverride ? this.pausedTimerRunningMilliseconds : undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            return setLongTimeout(() => {
                this.emit('timer');
                this.finishTimer();
            }, durationInMilliseconds);
        }

        throw new Error(`Unexpected timer type "${this.configOverride ? this.configOverride.timerType : this.config.timerType}"`);
    }

    private createLoopInterval(durationInMilliseconds: number, isResumedWithRemainingDuration: boolean) {
        return setLongInterval(() => {
            this.emit('timer');

            this.pausedTimerRunningMilliseconds = undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            if (isResumedWithRemainingDuration) {
                // The interval was shortened to the time left after a pause; carry on with full-length iterations.
                this.timerId?.clear();
                this.timerId = this.createLoopInterval(this.timerDurationInMilliseconds, false);
            }

            this.currentLoopIteration = this.currentLoopIteration + 1;

            if (this.currentLoopIteration === this.config.timerMaxLoopIterations) {
                this.stopTimer();
                this.emit('loop-max-iterations');
            }
        }, durationInMilliseconds);
    }

    private destroyTimers() {
        this.timerId?.clear();
        clearInterval(this.progressUpdateIntervalTimerId);
        clearTimeout(this.stoppedTransitionToIdleTimeoutTimerId);
        this.loopTimeoutTimeoutTimerId?.clear();

        this.timerId = undefined;
        this.progressUpdateIntervalTimerId = undefined;
        this.stoppedTransitionToIdleTimeoutTimerId = undefined;
        this.loopTimeoutTimeoutTimerId = undefined;
    }

    // ####################################
    // ## Timer setup & teardown methods ##
    // ####################################

    private startLoopTimeoutTimer(isContinuing = false) {
        this.loopTimeoutTimeoutTimerId?.clear();
        this.loopTimeoutTimeoutTimerId = undefined;

        if (!isContinuing) {
            this.loopTimeoutRunningMilliseconds = 0;
        }

        if (this.config.timerLoopTimeout === 0) {
            return;
        }

        this.loopTimeoutStartedAtUnixTimestamp = Date.now();
        this.loopTimeoutTimeoutTimerId = setLongTimeout(() => {
            this.stopTimer();
            this.emit('loop-timeout');
        }, this.getTimerLoopTimeoutInMilliseconds() - this.loopTimeoutRunningMilliseconds);
    }

    private startProgressUpdateTimer() {
        clearInterval(this.progressUpdateIntervalTimerId);
        this.progressUpdateIntervalTimerId = undefined;

        if (!this.config.isTimerProgressUpdateEnabled) {
            return;
        }

        this.progressUpdateIntervalTimerId = setInterval(() => {
            this.setCurrentState(STATE.RUNNING, this.getRunningTimerProgress());
        }, 50);
    }

    private startStoppedTransitionToIdleTimer() {
        clearTimeout(this.stoppedTransitionToIdleTimeoutTimerId);
        this.stoppedTransitionToIdleTimeoutTimerId = undefined;

        if (this.currentState !== STATE.STOPPED) {
            return;
        }

        this.stoppedTransitionToIdleTimeoutTimerId = setTimeout(() => {
            this.finishTimer();
        }, 1000 * 10);
    }

    // #############################
    // ## Other utility functions ##
    // #############################

    private setCurrentState(state: STATE, progress = '') {
        this.currentState = state;
        this.emit('state', { state, progress });
        this.emit(state);
    }

    private getProgressForCurrentState() {
        if (this.currentState === STATE.PAUSED) {
            return this.getPausedTimerProgress();
        }

        // Idle and stopped timers have no start timestamp, so there is no progress to show.
        return this.currentState === STATE.RUNNING ? this.getRunningTimerProgress() : '';
    }

    private getRunningTimerProgress() {
        if (!this.config.isTimerProgressUpdateEnabled) {
            return '';
        }

        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        const timerPercentageCompletion =
            // biome-ignore lint/style/noNonNullAssertion: only read while running, so the start timestamp is set
            (100 * (Date.now() - this.timerStartedAtUnixTimestamp! + previousRunningDurationInMilliseconds)) / this.timerDurationInMilliseconds;
        return this.getTimerProgressString(timerPercentageCompletion);
    }

    private getPausedTimerProgress() {
        if (!this.config.isTimerProgressUpdateEnabled) {
            return '';
        }

        // biome-ignore lint/style/noNonNullAssertion: progress is only read while the timer is paused
        const timerPercentageCompletion = (100 * this.pausedTimerRunningMilliseconds!) / this.timerDurationInMilliseconds;
        return this.getTimerProgressString(timerPercentageCompletion);
    }

    private getTimerProgressString(timerPercentageCompletion: number) {
        return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${this.timerDuration} ${this.timerDurationUnit}(s)`;
    }

    private get timerDuration() {
        return this.configOverride?.timerDuration ?? this.config.timerDuration;
    }

    private get timerDurationUnit() {
        return this.configOverride?.timerDurationUnit ?? this.config.timerDurationUnit;
    }

    private get timerDurationInMilliseconds() {
        return Timer.getDurationInMilliseconds(this.timerDuration, this.timerDurationUnit);
    }

    private getTimerLoopTimeoutInMilliseconds() {
        return Timer.getDurationInMilliseconds(this.config.timerLoopTimeout, this.config.timerLoopTimeoutUnit);
    }

    static getDurationInMilliseconds(duration: number, durationUnit: DurationUnit) {
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

        throw new Error(`Unexpected durationUnit "${durationUnit}"`);
    }
}
