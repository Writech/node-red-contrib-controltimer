import { EventEmitter } from 'events';
import { clearInterval, clearTimeout } from 'timers';

enum Action {
    START = 'START',
    STOP = 'STOP',
    RESET = 'RESET',
    PAUSE = 'PAUSE',
    CONTINUE = 'CONTINUE',
}

export enum State {
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    PAUSED = 'PAUSED',
}

export enum TimerType {
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
    timerType: TimerType;
    duration: number;
    durationUnit: DurationUnit;
    isTimerProgressUpdateEnabled: boolean;
    timerMaxLoopIterations: number;
    timerLoopTimeout: number;
    timerLoopTimeoutUnit: DurationUnit;
}

export class Timer extends EventEmitter {
    static defaultConfig: TimerConfig = {
        timerType: TimerType.DELAY,
        duration: 5,
        durationUnit: DurationUnit.SECOND,
        isTimerProgressUpdateEnabled: true,
        timerMaxLoopIterations: 0,
        timerLoopTimeout: 0,
        timerLoopTimeoutUnit: DurationUnit.MILLISECOND,
    };

    static validateConfigOverride(configOverride: Pick<TimerConfig, 'timerType' | 'duration' | 'durationUnit'>) {
        const { timerType, duration, durationUnit } = configOverride;
        const isNil = (value: unknown) => value === undefined || value === null;

        if (isNil(timerType) || typeof timerType !== 'string' || !Object.values(TimerType).includes(timerType)) {
            throw new Error('timerType is not valid');
        }

        if (isNil(duration) || !Number.isInteger(duration) || !Number.isFinite(duration) || duration <= 0) {
            throw new Error('duration is not valid');
        }

        if (isNil(durationUnit) || typeof durationUnit !== 'string' || !Object.values(DurationUnit).includes(durationUnit)) {
            throw new Error('durationUnit is not valid');
        }
    }

    static getInstance(config: TimerConfig) {
        return new Timer(config);
    }

    private config: TimerConfig = Timer.defaultConfig;
    private configOverride: Pick<TimerConfig, 'timerType' | 'duration' | 'durationUnit'>;

    private currentState: State = State.IDLE;
    private timerId: NodeJS.Timeout;
    private progressUpdateIntervalTimerId: NodeJS.Timeout;
    private stoppedTransitionToIdleTimeoutTimerId: NodeJS.Timeout;
    private loopTimeoutTimeoutTimerId: NodeJS.Timeout;
    private currentLoopIteration = 0;
    private pausedTimerRunningMilliseconds: number;
    private timerStartedAtUnixTimestamp: number;

    constructor(config: TimerConfig) {
        super();
        this.config = config; // TODO: Validate config
        this.setCurrentState(State.IDLE);
    }

    // ####################
    // ## Public methods ##
    // ####################

    public start() {
        this.handleAction(Action.START);
    }

    public stop() {
        this.handleAction(Action.STOP);
    }

    public reset() {
        this.handleAction(Action.RESET);
    }

    public pause() {
        this.handleAction(Action.PAUSE);
    }

    public continue() {
        this.handleAction(Action.CONTINUE);
    }

    public hardReset() {
        this.configOverride = undefined;
        this.softReset();
    }

    private softReset() {
        this.currentState = State.IDLE;
        this.destroyTimers();
        this.currentLoopIteration = 0;
        this.pausedTimerRunningMilliseconds = undefined;
        this.timerStartedAtUnixTimestamp = undefined;
    }

    public setConfigOverride(configOverride: Pick<TimerConfig, 'timerType' | 'duration' | 'durationUnit'>) {
        Timer.validateConfigOverride(configOverride);
        this.configOverride = configOverride;

        this.emit('state', {
            state: this.currentState,
            progress: this.currentState === State.PAUSED ? this.getPausedTimerProgress() : this.getRunningTimerProgress(),
        });
    }

    public get state() {
        return this.currentState;
    }

    // ###########################
    // ## Timer action handling ##
    // ###########################

    private handleAction(action: Action) {
        if (this.currentState === State.IDLE) {
            if (action === Action.START) {
                this.startTimer();
            }
        }

        if (this.currentState === State.RUNNING) {
            if (action === Action.STOP) {
                this.stopTimer();
            }

            if (action === Action.RESET) {
                this.resetTimer();
            }

            if (action === Action.PAUSE) {
                this.pauseTimer();
            }
        }

        if (this.currentState === State.STOPPED) {
            if (action === Action.START) {
                this.startTimer();
            }
        }

        if (this.currentState === State.PAUSED) {
            if (action === Action.STOP) {
                this.stopTimer();
            }

            if (action === Action.RESET) {
                this.resetTimer();
            }

            if (action === Action.CONTINUE) {
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
        this.setCurrentState(State.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private stopTimer() {
        this.hardReset();
        this.setCurrentState(State.STOPPED);
        this.startStoppedTransitionToIdleTimer();
    }

    private resetTimer() {
        this.softReset();
        this.timerId = this.createAndGetTimer();
        this.setCurrentState(State.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private pauseTimer() {
        this.destroyTimers();
        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        this.pausedTimerRunningMilliseconds = Date.now() - this.timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds;
        this.timerStartedAtUnixTimestamp = undefined;
        this.setCurrentState(State.PAUSED, this.getPausedTimerProgress());
    }

    private continueTimer() {
        this.timerId = this.createAndGetTimer(this.timerDurationInMilliseconds - this.pausedTimerRunningMilliseconds);
        this.setCurrentState(State.RUNNING, this.getRunningTimerProgress());
        this.startProgressUpdateTimer();
    }

    private finishTimer() {
        this.hardReset();
        this.setCurrentState(State.IDLE);
    }

    // ###########################
    // ## Timer helpers methods ##
    // ###########################

    private createAndGetTimer(durationInMillisecondsOverride?: number) {
        const durationInMilliseconds = durationInMillisecondsOverride ?? this.timerDurationInMilliseconds;

        if ((this.config.timerType === TimerType.LOOP && !this.configOverride) || this.configOverride?.timerType === TimerType.LOOP) {
            this.pausedTimerRunningMilliseconds = durationInMillisecondsOverride ? this.pausedTimerRunningMilliseconds : undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            this.startLoopTimeoutTimer();

            return setInterval(() => {
                this.emit('timer');

                if (durationInMillisecondsOverride && durationInMillisecondsOverride !== this.timerDurationInMilliseconds) {
                    this.resetTimer();
                }

                this.pausedTimerRunningMilliseconds = undefined;
                this.timerStartedAtUnixTimestamp = Date.now();

                this.currentLoopIteration = this.currentLoopIteration + 1;

                if (this.currentLoopIteration === this.config.timerMaxLoopIterations) {
                    this.stopTimer();
                    this.emit('loop-max-iterations');
                }
            }, durationInMilliseconds);
        }

        if ((this.config.timerType === TimerType.DELAY && !this.configOverride) || this.configOverride?.timerType === TimerType.DELAY) {
            this.pausedTimerRunningMilliseconds = durationInMillisecondsOverride ? this.pausedTimerRunningMilliseconds : undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            return setTimeout(() => {
                this.emit('timer');
                this.finishTimer();
            }, durationInMilliseconds);
        }

        throw new Error(`Unexpected timer type "${this.configOverride ? this.configOverride.timerType : this.config.timerType}"`);
    }

    private destroyTimers() {
        clearInterval(this.timerId);
        clearTimeout(this.timerId);
        clearInterval(this.progressUpdateIntervalTimerId);
        clearTimeout(this.stoppedTransitionToIdleTimeoutTimerId);
        clearTimeout(this.loopTimeoutTimeoutTimerId);

        this.timerId = undefined;
        this.progressUpdateIntervalTimerId = undefined;
        this.stoppedTransitionToIdleTimeoutTimerId = undefined;
        this.loopTimeoutTimeoutTimerId = undefined;
    }

    // ####################################
    // ## Timer setup & teardown methods ##
    // ####################################

    private startLoopTimeoutTimer() {
        clearTimeout(this.loopTimeoutTimeoutTimerId);
        this.loopTimeoutTimeoutTimerId = undefined;

        if (this.config.timerLoopTimeout === 0) {
            return;
        }

        this.loopTimeoutTimeoutTimerId = setTimeout(() => {
            this.stopTimer();
            this.emit('loop-timeout');
        }, this.getTimerLoopTimeoutInMilliseconds());
    }

    private startProgressUpdateTimer() {
        clearInterval(this.progressUpdateIntervalTimerId);
        this.progressUpdateIntervalTimerId = undefined;

        if (!this.config.isTimerProgressUpdateEnabled) {
            return;
        }

        this.progressUpdateIntervalTimerId = setInterval(() => {
            this.setCurrentState(State.RUNNING, this.getRunningTimerProgress());
        }, 50);
    }

    private startStoppedTransitionToIdleTimer() {
        clearTimeout(this.stoppedTransitionToIdleTimeoutTimerId);
        this.stoppedTransitionToIdleTimeoutTimerId = undefined;

        if (this.currentState !== State.STOPPED) {
            return;
        }

        this.stoppedTransitionToIdleTimeoutTimerId = setTimeout(() => {
            this.finishTimer();
        }, 1000 * 10);
    }

    // #############################
    // ## Other utility functions ##
    // #############################

    private setCurrentState(state: State, progress = '') {
        this.currentState = state;
        this.emit('state', { state, progress });
        this.emit(state);
    }

    private getRunningTimerProgress() {
        if (!this.config.isTimerProgressUpdateEnabled) {
            return '';
        }

        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        const timerPercentageCompletion =
            (100 * (Date.now() - this.timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds)) / this.timerDurationInMilliseconds;
        return this.getTimerProgressString(timerPercentageCompletion);
    }

    private getPausedTimerProgress() {
        if (!this.config.isTimerProgressUpdateEnabled) {
            return '';
        }

        const timerPercentageCompletion = (100 * this.pausedTimerRunningMilliseconds) / this.timerDurationInMilliseconds;
        return this.getTimerProgressString(timerPercentageCompletion);
    }

    private getTimerProgressString(timerPercentageCompletion) {
        return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${this.timerDuration} ${this.timerDurationUnit}(s)`;
    }

    private get timerDuration() {
        return this.configOverride?.duration ?? this.config.duration;
    }

    private get timerDurationUnit() {
        return this.configOverride?.durationUnit ?? this.config.durationUnit;
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
