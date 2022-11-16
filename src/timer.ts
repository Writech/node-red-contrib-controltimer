import { EventEmitter } from 'events';
import { clearInterval } from 'timers';

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

interface TimerSettings {
    baseConfig?: TimerBaseConfig;
    config?: TimerConfig;
}

interface TimerBaseConfig {
    isStartAllowedToResetTimer: boolean;
    isTimerProgressUpdateEnabled: boolean;
    timerMaxLoopIterations: number;
    timerLoopTimeout: number;
    timerLoopTimeoutUnit: DurationUnit;
}

interface TimerConfig {
    timerType: TIMER_TYPE;
    duration: number;
    durationUnit: DurationUnit;
}

// TODO: Determine what happens when timer is paused right at the moment the timer expires

export class Timer extends EventEmitter {
    static defaultBaseConfig: TimerBaseConfig = {
        isStartAllowedToResetTimer: false,
        isTimerProgressUpdateEnabled: false,
        timerMaxLoopIterations: 0,
        timerLoopTimeout: 0,
        timerLoopTimeoutUnit: DurationUnit.MILLISECOND,
    };

    static defaultConfig: TimerConfig = {
        timerType: TIMER_TYPE.DELAY,
        duration: 3,
        durationUnit: DurationUnit.SECOND,
    };

    static getInstance(settings: TimerSettings = {}) {
        return new Timer(settings);
    }

    // ############
    // ## Config ##
    // ############

    private baseConfig: TimerBaseConfig = Timer.defaultBaseConfig;
    private config: TimerConfig = Timer.defaultConfig;
    private configOverride: TimerConfig;

    // ###########
    // ## State ##
    // ###########

    private currentState: STATE = STATE.IDLE;
    private timerId: NodeJS.Timeout;
    private progressUpdateIntervalTimerId: NodeJS.Timeout;
    private stoppedTransitionToIdleTimeoutTimerId: NodeJS.Timeout;
    private loopTimeoutTimeoutTimerId: NodeJS.Timeout;
    private currentLoopIteration = 0;
    private pausedTimerRunningMilliseconds: number;
    private timerStartedAtUnixTimestamp: number;

    constructor(settings: TimerSettings) {
        super();

        if (settings?.baseConfig) {
            // TODO: Validate settings.baseConfig
            this.baseConfig = settings.baseConfig;
        }

        if (settings?.config) {
            // TODO: Validate settings.config
            this.config = settings.config;
        }

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
        this.baseConfig = Timer.defaultBaseConfig;
        this.config = Timer.defaultConfig;
        this.configOverride = undefined;

        this.softReset();
    }

    private softReset() {
        this.currentState = STATE.IDLE;
        this.destroyTimers();
        this.currentLoopIteration = 0;
        this.pausedTimerRunningMilliseconds = undefined;
        this.timerStartedAtUnixTimestamp = undefined;
    }

    public setConfigOverride(configOverride: TimerConfig) {
        // TODO: Validate configOverride
        this.configOverride = configOverride;
    }

    // ############################
    // ## Action utility methods ##
    // ############################

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

    // ###########################
    // ## Timer utility methods ##
    // ###########################

    private startTimer() {
        this.softReset();

        this.timerId = this.createAndGetTimer();

        this.setCurrentState(STATE.RUNNING);
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

        this.setCurrentState(STATE.RUNNING);
        this.startProgressUpdateTimer();
    }

    private pauseTimer() {
        this.destroyTimers();

        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        this.pausedTimerRunningMilliseconds = Date.now() - this.timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds;
        this.timerStartedAtUnixTimestamp = undefined;
        this.setCurrentState(STATE.PAUSED, this.getPausedTimerProgress());
    }

    private continueTimer() {
        this.timerId = this.createAndGetTimer(this.timerDurationInMilliseconds - this.pausedTimerRunningMilliseconds);

        this.setCurrentState(STATE.RUNNING);
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

        if ((this.configOverride === null && this.config.timerType === TIMER_TYPE.LOOP) || this.configOverride?.timerType === TIMER_TYPE.LOOP) {
            this.pausedTimerRunningMilliseconds = undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            this.startLoopTimeoutTimer();

            return setInterval(() => {
                this.pausedTimerRunningMilliseconds = undefined;
                this.timerStartedAtUnixTimestamp = Date.now();

                if (durationInMillisecondsOverride && durationInMillisecondsOverride !== this.timerDurationInMilliseconds) {
                    this.resetTimer(); // TODO: What is going on here?
                }

                this.currentLoopIteration = this.currentLoopIteration + 1;

                if (this.currentLoopIteration === this.baseConfig.timerMaxLoopIterations) {
                    this.stopTimer();
                    this.emit('loop-max-iterations');
                }

                this.emit('timer');
            }, durationInMilliseconds);
        }

        if ((this.configOverride === null && this.config.timerType === TIMER_TYPE.DELAY) || this.configOverride?.timerType === TIMER_TYPE.DELAY) {
            this.pausedTimerRunningMilliseconds = undefined;
            this.timerStartedAtUnixTimestamp = Date.now();

            return setTimeout(() => {
                this.finishTimer();
                this.emit('timer');
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
        this.stopLoopTimeoutTimer();

        if (this.baseConfig.timerLoopTimeout === 0) {
            return;
        }

        this.loopTimeoutTimeoutTimerId = setTimeout(() => {
            this.stopTimer();
            this.emit('loop-timeout');
        }, this.getTimerLoopTimeoutInMilliseconds());
    }

    private stopLoopTimeoutTimer() {
        clearTimeout(this.loopTimeoutTimeoutTimerId);
        this.loopTimeoutTimeoutTimerId = undefined;
    }

    private startProgressUpdateTimer() {
        if (!this.baseConfig.isTimerProgressUpdateEnabled) {
            return;
        }

        this.progressUpdateIntervalTimerId = setInterval(() => {
            this.setCurrentState(STATE.RUNNING, this.getRunningTimerProgress());
        }, 50);
    }

    private stopProgressUpdateTimer() {
        clearInterval(this.progressUpdateIntervalTimerId);
        this.progressUpdateIntervalTimerId = undefined;
    }

    private startStoppedTransitionToIdleTimer() {
        this.stopStoppedTransitionToIdleTimer();

        this.stoppedTransitionToIdleTimeoutTimerId = setTimeout(() => {
            this.finishTimer();
        }, 1000 * 10);
    }

    private stopStoppedTransitionToIdleTimer() {
        clearTimeout(this.stoppedTransitionToIdleTimeoutTimerId);
        this.stoppedTransitionToIdleTimeoutTimerId = undefined;
    }

    // #############################
    // ## Other utility functions ##
    // #############################

    private setCurrentState(state: STATE, progress = '') {
        this.currentState = state;
        this.emit('state', { state, progress });
        this.emit(state);
    }

    private getRunningTimerProgress() {
        if (!this.baseConfig.isTimerProgressUpdateEnabled) {
            return '';
        }

        const previousRunningDurationInMilliseconds = this.pausedTimerRunningMilliseconds ?? 0;
        const timerPercentageCompletion = (100 * (Date.now() - this.timerStartedAtUnixTimestamp + previousRunningDurationInMilliseconds)) / this.timerDurationInMilliseconds;
        return ` ${Number(timerPercentageCompletion).toFixed(1)}% of ${this.timerDuration} ${this.timerDurationUnit}(s)`;
    }

    private getPausedTimerProgress() {
        if (!this.baseConfig.isTimerProgressUpdateEnabled) {
            return '';
        }

        const timerPercentageCompletion = (100 * this.pausedTimerRunningMilliseconds) / this.timerDurationInMilliseconds;
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
        return Timer.getDurationInMilliseconds(this.baseConfig.timerLoopTimeout, this.baseConfig.timerLoopTimeoutUnit);
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
