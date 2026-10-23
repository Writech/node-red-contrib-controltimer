import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { DurationUnit, STATE, TIMER_TYPE, Timer } from '../../src/timer';

describe('src/timer.ts', () => {
    beforeEach(() => {
        mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
    });

    afterEach(() => {
        mock.timers.reset();
    });

    describe('getDurationInMilliseconds', () => {
        it('converts every unit to milliseconds', () => {
            assert.equal(Timer.getDurationInMilliseconds(5, DurationUnit.MILLISECOND), 5);
            assert.equal(Timer.getDurationInMilliseconds(5, DurationUnit.SECOND), 5_000);
            assert.equal(Timer.getDurationInMilliseconds(5, DurationUnit.MINUTE), 300_000);
            assert.equal(Timer.getDurationInMilliseconds(5, DurationUnit.HOUR), 18_000_000);
        });

        it('throws on an unknown unit', () => {
            assert.throws(() => Timer.getDurationInMilliseconds(1, 'fortnight' as DurationUnit), /Unexpected durationUnit "fortnight"/);
        });
    });

    describe('validateConfigOverride', () => {
        const valid = { timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND };

        it('accepts a valid override, including fractional durations', () => {
            assert.doesNotThrow(() => Timer.validateConfigOverride(valid));
            assert.doesNotThrow(() => Timer.validateConfigOverride({ ...valid, duration: 0.5 }));
            assert.doesNotThrow(() => Timer.validateConfigOverride({ timerType: TIMER_TYPE.LOOP, duration: 100, durationUnit: DurationUnit.MILLISECOND }));
        });

        it('rejects an unknown timer type', () => {
            assert.throws(() => Timer.validateConfigOverride({ ...valid, timerType: 'repeat' }), /Invalid timerType "repeat", expected one of: loop, delay/);
        });

        it('rejects a duration that is not a positive finite number', () => {
            for (const duration of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '3', null, undefined, {}]) {
                assert.throws(() => Timer.validateConfigOverride({ ...valid, duration }), /Invalid timerDuration/, `accepted ${String(duration)}`);
            }
        });

        it('rejects an unknown duration unit', () => {
            assert.throws(() => Timer.validateConfigOverride({ ...valid, durationUnit: 'fortnight' }), /Invalid timerDurationUnit "fortnight"/);
        });

        it('is applied by setConfigOverride, which keeps the previous override on failure', () => {
            const { timer } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.setConfigOverride(valid);
            assert.throws(() => timer.setConfigOverride({ ...valid, duration: -1 }), /Invalid timerDuration/);

            timer.start();
            mock.timers.tick(2999);
            assert.equal(timer.getState(), STATE.RUNNING);
            mock.timers.tick(1);
            assert.equal(timer.getState(), STATE.IDLE);
        });
    });

    describe('initial state', () => {
        it('starts in the idle state', () => {
            const { timer } = createTimer();
            assert.equal(timer.getState(), STATE.IDLE);
        });

        it('ignores stop, reset, pause and continue while idle', () => {
            const { timer, states } = createTimer();
            timer.stop();
            timer.reset();
            timer.pause();
            timer.continue();
            assert.equal(timer.getState(), STATE.IDLE);
            assert.deepEqual(states, []);
        });
    });

    describe('delay', () => {
        it('fires once after the duration and returns to idle', () => {
            const { timer, counts, states } = createTimer();
            timer.start();
            assert.equal(timer.getState(), STATE.RUNNING);

            mock.timers.tick(999);
            assert.equal(counts.timer, 0);

            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
            assert.equal(timer.getState(), STATE.IDLE);
            assert.deepEqual(states, [STATE.RUNNING, STATE.IDLE]);

            mock.timers.tick(10_000);
            assert.equal(counts.timer, 1);
        });

        it('can be started again after finishing', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(1000);
            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 2);
        });

        it('ignores start while already running', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(500);
            timer.start();
            mock.timers.tick(500);
            assert.equal(counts.timer, 1);
        });

        it('converts the configured unit', () => {
            const { timer, counts } = createTimer({ duration: 2, durationUnit: DurationUnit.MINUTE });
            timer.start();
            mock.timers.tick(119_999);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });
    });

    describe('loop', () => {
        it('fires on every interval and stays running', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP });
            timer.start();

            mock.timers.tick(3000);
            assert.equal(counts.timer, 3);
            assert.equal(timer.getState(), STATE.RUNNING);
        });

        it('stops and emits loop-max-iterations after the maximum number of iterations', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 3 });
            timer.start();

            mock.timers.tick(3000);
            assert.equal(counts.timer, 3);
            assert.equal(counts['loop-max-iterations'], 1);
            assert.equal(timer.getState(), STATE.STOPPED);

            mock.timers.tick(5000);
            assert.equal(counts.timer, 3);
        });

        it('stops and emits loop-timeout once the loop timeout elapses', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500, timerLoopTimeoutUnit: DurationUnit.MILLISECOND });
            timer.start();

            mock.timers.tick(2499);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
            assert.equal(counts.timer, 2);
            assert.equal(timer.getState(), STATE.STOPPED);
        });

        it('does not start a loop timeout when it is 0', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP });
            timer.start();
            mock.timers.tick(60_000);
            assert.equal(counts['loop-timeout'], 0);
            assert.equal(timer.getState(), STATE.RUNNING);
        });
    });

    describe('stop', () => {
        it('stops a running timer so it never fires', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(500);
            timer.stop();

            assert.equal(timer.getState(), STATE.STOPPED);
            assert.equal(counts[STATE.STOPPED], 1);

            mock.timers.tick(500);
            assert.equal(counts.timer, 0);
        });

        it('transitions from stopped back to idle after 10 seconds', () => {
            const { timer } = createTimer();
            timer.start();
            timer.stop();

            mock.timers.tick(9_999);
            assert.equal(timer.getState(), STATE.STOPPED);
            mock.timers.tick(1);
            assert.equal(timer.getState(), STATE.IDLE);
        });

        it('can be started again while stopped', () => {
            const { timer, counts } = createTimer();
            timer.start();
            timer.stop();
            timer.start();
            assert.equal(timer.getState(), STATE.RUNNING);

            mock.timers.tick(1000);
            assert.equal(counts.timer, 1);
        });

        it('stops a paused timer', () => {
            const { timer } = createTimer();
            timer.start();
            timer.pause();
            timer.stop();
            assert.equal(timer.getState(), STATE.STOPPED);
        });
    });

    describe('reset', () => {
        it('restarts the full duration of a running timer', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(800);
            timer.reset();

            mock.timers.tick(999);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('restarts the full duration of a paused timer', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(800);
            timer.pause();
            timer.reset();
            assert.equal(timer.getState(), STATE.RUNNING);

            mock.timers.tick(1000);
            assert.equal(counts.timer, 1);
        });

        it('restarts the loop iteration count', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 3 });
            timer.start();
            mock.timers.tick(2000);
            timer.reset();

            mock.timers.tick(2000);
            assert.equal(counts['loop-max-iterations'], 0);
            mock.timers.tick(1000);
            assert.equal(counts['loop-max-iterations'], 1);
        });

        it('is ignored while stopped', () => {
            const { timer } = createTimer();
            timer.start();
            timer.stop();
            timer.reset();
            assert.equal(timer.getState(), STATE.STOPPED);
        });
    });

    describe('pause and continue', () => {
        it('pauses a running timer without firing', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(400);
            timer.pause();

            assert.equal(timer.getState(), STATE.PAUSED);
            assert.equal(counts[STATE.PAUSED], 1);

            mock.timers.tick(60_000);
            assert.equal(counts.timer, 0);
        });

        it('continues with the remaining time', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(400);
            timer.pause();
            mock.timers.tick(5000);
            timer.continue();
            assert.equal(timer.getState(), STATE.RUNNING);

            mock.timers.tick(599);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('accumulates the running time across multiple pauses', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(300);
            timer.pause();
            timer.continue();
            mock.timers.tick(300);
            timer.pause();
            timer.continue();

            mock.timers.tick(399);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('ignores pause while stopped and continue while running', () => {
            const { timer } = createTimer();
            timer.start();
            timer.continue();
            assert.equal(timer.getState(), STATE.RUNNING);

            timer.stop();
            timer.pause();
            assert.equal(timer.getState(), STATE.STOPPED);
        });

        it('ignores start while paused', () => {
            const { timer, events } = createTimer();
            timer.start();
            timer.pause();
            const eventsBeforeStart = [...events];
            timer.start();
            assert.equal(timer.getState(), STATE.PAUSED);
            assert.deepEqual(events, eventsBeforeStart);
        });
    });

    describe('config override', () => {
        it('uses the overridden duration and unit', () => {
            const { timer, counts } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.start();

            mock.timers.tick(2999);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('uses the overridden timer type', () => {
            const { timer, counts } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.LOOP, duration: 100, durationUnit: DurationUnit.MILLISECOND });
            timer.start();

            mock.timers.tick(350);
            assert.equal(counts.timer, 3);
        });

        it('is cleared by a stop', () => {
            const { timer, counts } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.start();
            timer.stop();
            timer.start();

            mock.timers.tick(1000);
            assert.equal(counts.timer, 1);
        });

        it('emits the current state when set', () => {
            const { timer, states } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            assert.deepEqual(states, [STATE.IDLE]);
        });
    });

    describe('hardReset', () => {
        it('cancels timers and returns to idle', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP });
            timer.start();
            mock.timers.tick(1000);
            timer.hardReset();

            assert.equal(timer.getState(), STATE.IDLE);
            mock.timers.tick(10_000);
            assert.equal(counts.timer, 1);
        });
    });

    describe('progress', () => {
        it('reports no progress when disabled', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: false });
            timer.start();
            mock.timers.tick(500);
            timer.pause();
            assert.ok(progress.every((p) => p === ''));
        });

        it('reports progress as a percentage of the duration while running', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.start();
            assert.equal(progress.at(-1), ' 0.0% of 1 second(s)');

            mock.timers.tick(500);
            assert.equal(progress.at(-1), ' 50.0% of 1 second(s)');
        });

        it('keeps reporting the progress it paused at', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.start();
            mock.timers.tick(250);
            timer.pause();
            assert.equal(progress.at(-1), ' 25.0% of 1 second(s)');

            timer.continue();
            assert.equal(progress.at(-1), ' 25.0% of 1 second(s)');
            mock.timers.tick(500);
            assert.equal(progress.at(-1), ' 75.0% of 1 second(s)');
        });

        it('stops emitting progress updates once the timer finishes', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.start();
            mock.timers.tick(1000);
            const emitted = progress.length;

            mock.timers.tick(1000);
            assert.equal(progress.length, emitted);
        });
    });

    describe('event order', () => {
        it('emits the state event before the event named after the state', () => {
            const { timer } = createTimer();
            const order: string[] = [];
            timer.on('state', () => order.push('state'));
            timer.on(STATE.RUNNING, () => order.push(STATE.RUNNING));
            timer.start();
            assert.deepEqual(order, ['state', STATE.RUNNING]);
        });

        it('emits timer before returning a delay to idle', () => {
            const { timer, events } = createTimer();
            timer.start();
            mock.timers.tick(1000);
            assert.deepEqual(events, [STATE.RUNNING, 'timer', STATE.IDLE]);
        });

        it('emits stopped before loop-max-iterations', () => {
            const { timer, events } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 2 });
            timer.start();
            mock.timers.tick(2000);
            assert.deepEqual(events, [STATE.RUNNING, 'timer', 'timer', STATE.STOPPED, 'loop-max-iterations']);
        });

        it('emits stopped before loop-timeout', () => {
            const { timer, events } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 1500 });
            timer.start();
            mock.timers.tick(1500);
            assert.deepEqual(events, [STATE.RUNNING, 'timer', STATE.STOPPED, 'loop-timeout']);
        });
    });

    describe('stopped to idle transition', () => {
        it('does not let the stale idle transition end a timer started while stopped', () => {
            const { timer } = createTimer({ timerType: TIMER_TYPE.LOOP });
            timer.start();
            timer.stop();
            mock.timers.tick(5_000);
            timer.start();

            mock.timers.tick(5_500);
            assert.equal(timer.getState(), STATE.RUNNING);
        });

        it('does not fire after the stopped timer has gone idle', () => {
            const { timer, counts } = createTimer();
            timer.start();
            timer.stop();
            mock.timers.tick(60_000);
            assert.equal(counts.timer, 0);
            assert.equal(timer.getState(), STATE.IDLE);
        });
    });

    describe('loop details', () => {
        it('fires after the remaining time when continued, then every full interval', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP });
            timer.start();
            mock.timers.tick(400);
            timer.pause();
            timer.continue();

            mock.timers.tick(599);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);

            mock.timers.tick(999);
            assert.equal(counts.timer, 1);
            mock.timers.tick(1);
            assert.equal(counts.timer, 2);
        });

        it('counts iterations from before a pause towards the maximum', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 3 });
            timer.start();
            mock.timers.tick(1000);
            mock.timers.tick(400);
            timer.pause();
            timer.continue();
            mock.timers.tick(600);
            mock.timers.tick(1000);

            assert.equal(counts.timer, 3);
            assert.equal(counts['loop-max-iterations'], 1);
            assert.equal(timer.getState(), STATE.STOPPED);
        });

        it('stops after a single iteration when the maximum is 1', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 1 });
            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 1);
            assert.equal(counts['loop-max-iterations'], 1);
            assert.equal(timer.getState(), STATE.STOPPED);
        });

        it('loops without limit when the maximum is 0', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 0 });
            timer.start();
            mock.timers.tick(100_000);
            assert.equal(counts.timer, 100);
            assert.equal(counts['loop-max-iterations'], 0);
            assert.equal(timer.getState(), STATE.RUNNING);
        });

        it('converts the loop timeout unit', () => {
            const cases: [number, DurationUnit, number][] = [
                [2, DurationUnit.SECOND, 2_000],
                [1, DurationUnit.MINUTE, 60_000],
                [1, DurationUnit.HOUR, 3_600_000],
            ];

            for (const [timerLoopTimeout, timerLoopTimeoutUnit, milliseconds] of cases) {
                const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout, timerLoopTimeoutUnit });
                timer.start();
                mock.timers.tick(milliseconds - 1);
                assert.equal(counts['loop-timeout'], 0, `${timerLoopTimeoutUnit} timed out early`);
                mock.timers.tick(1);
                assert.equal(counts['loop-timeout'], 1, `${timerLoopTimeoutUnit} did not time out`);
            }
        });

        it('does not time out after being stopped', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500 });
            timer.start();
            mock.timers.tick(1000);
            timer.stop();
            mock.timers.tick(10_000);
            assert.equal(counts['loop-timeout'], 0);
        });

        it('restarts the loop timeout on reset', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500 });
            timer.start();
            mock.timers.tick(2000);
            timer.reset();

            mock.timers.tick(2499);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
        });

        it('does not extend the loop timeout by pausing', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500 });
            timer.start();
            mock.timers.tick(1000);
            timer.pause();
            mock.timers.tick(5000);
            timer.continue();

            mock.timers.tick(1499);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
        });

        it('accumulates the loop timeout across several pauses', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500 });
            timer.start();
            mock.timers.tick(1000);
            timer.pause();
            timer.continue();
            mock.timers.tick(1000);
            timer.pause();
            timer.continue();

            mock.timers.tick(499);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
        });

        it('restarts the full loop timeout on RESET after a pause', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, timerLoopTimeout: 2500 });
            timer.start();
            mock.timers.tick(1000);
            timer.pause();
            timer.reset();

            mock.timers.tick(2499);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
        });
    });

    describe('config override edge cases', () => {
        it('is cleared after a delay finishes', () => {
            const { timer, counts } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.start();
            mock.timers.tick(3000);
            assert.equal(counts.timer, 1);

            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 2);
        });

        it('is cleared by hardReset', () => {
            const { timer, counts } = createTimer();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.hardReset();
            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 1);
        });

        it('applies to a running timer on reset', () => {
            const { timer, counts } = createTimer();
            timer.start();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.reset();

            mock.timers.tick(2999);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('uses the overridden duration for the remaining time when continued', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(400);
            timer.pause();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            timer.continue();

            mock.timers.tick(2599);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('reports progress using the overridden duration and unit', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 2, durationUnit: DurationUnit.MINUTE });
            timer.start();
            assert.equal(progress.at(-1), ' 0.0% of 2 minute(s)');

            mock.timers.tick(60_000);
            assert.equal(progress.at(-1), ' 50.0% of 2 minute(s)');
        });

        it('reports no progress when an override is set while idle', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            assert.deepEqual(progress, ['']);
        });

        it('reports no progress when an override is set while stopped', () => {
            const { timer, progress } = createTimer({ isTimerProgressUpdateEnabled: true });
            timer.start();
            timer.stop();
            timer.setConfigOverride({ timerType: TIMER_TYPE.DELAY, duration: 3, durationUnit: DurationUnit.SECOND });
            assert.equal(progress.at(-1), '');
        });
    });

    describe('hardReset edge cases', () => {
        it('cancels a paused timer so continue does nothing', () => {
            const { timer, counts } = createTimer();
            timer.start();
            mock.timers.tick(400);
            timer.pause();
            timer.hardReset();
            timer.continue();

            assert.equal(timer.getState(), STATE.IDLE);
            mock.timers.tick(10_000);
            assert.equal(counts.timer, 0);
        });

        it('does not emit a state event', () => {
            const { timer, states } = createTimer();
            timer.start();
            states.length = 0;
            timer.hardReset();
            assert.deepEqual(states, []);
        });
    });

    describe('invalid and extreme input', () => {
        it('throws on an unknown timer type when started', () => {
            const { timer } = createTimer({ timerType: 'bogus' as TIMER_TYPE });
            assert.throws(() => timer.start(), /Unexpected timer type "bogus"/);
        });

        it('fires a zero-duration delay immediately', () => {
            const { timer, counts } = createTimer({ duration: 0 });
            timer.start();
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('fires a negative-duration delay immediately', () => {
            const { timer, counts } = createTimer({ duration: -5 });
            timer.start();
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('does not fire early for durations above the setTimeout limit', () => {
            const { timer, counts } = createTimer({ duration: 600, durationUnit: DurationUnit.HOUR });
            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 0);
            assert.equal(timer.getState(), STATE.RUNNING);

            mock.timers.tick(600 * 60 * 60 * 1000 - 1001);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
            assert.equal(timer.getState(), STATE.IDLE);
        });

        it('continues a long duration after a pause', () => {
            const { timer, counts } = createTimer({ duration: 600, durationUnit: DurationUnit.HOUR });
            timer.start();
            mock.timers.tick(100 * 60 * 60 * 1000);
            timer.pause();
            mock.timers.tick(30 * 24 * 60 * 60 * 1000);
            timer.continue();

            mock.timers.tick(500 * 60 * 60 * 1000 - 1);
            assert.equal(counts.timer, 0);
            mock.timers.tick(1);
            assert.equal(counts.timer, 1);
        });

        it('loops with an interval above the setTimeout limit', () => {
            const { timer, counts } = createTimer({ timerType: TIMER_TYPE.LOOP, duration: 600, durationUnit: DurationUnit.HOUR });
            timer.start();
            mock.timers.tick(1000);
            assert.equal(counts.timer, 0);

            mock.timers.tick(600 * 60 * 60 * 1000 - 1000);
            assert.equal(counts.timer, 1);
            mock.timers.tick(600 * 60 * 60 * 1000);
            assert.equal(counts.timer, 2);
        });

        it('supports a loop timeout above the setTimeout limit', () => {
            const { timer, counts } = createTimer({
                timerType: TIMER_TYPE.LOOP,
                duration: 1,
                durationUnit: DurationUnit.HOUR,
                timerLoopTimeout: 600,
                timerLoopTimeoutUnit: DurationUnit.HOUR,
            });
            timer.start();

            mock.timers.tick(600 * 60 * 60 * 1000 - 1);
            assert.equal(counts['loop-timeout'], 0);
            mock.timers.tick(1);
            assert.equal(counts['loop-timeout'], 1);
            assert.equal(counts.timer, 600);
        });

        it('keeps separate instances independent', () => {
            const first = createTimer();
            const second = createTimer();
            first.timer.start();
            mock.timers.tick(1000);

            assert.equal(first.counts.timer, 1);
            assert.equal(second.counts.timer, 0);
            assert.equal(second.timer.getState(), STATE.IDLE);
        });
    });
});

type TimerConfig = ConstructorParameters<typeof Timer>[0];

const baseConfig: TimerConfig = {
    timerType: TIMER_TYPE.DELAY,
    duration: 1,
    durationUnit: DurationUnit.SECOND,
    isTimerProgressUpdateEnabled: false,
    timerMaxLoopIterations: 0,
    timerLoopTimeout: 0,
    timerLoopTimeoutUnit: DurationUnit.MILLISECOND,
};

const EVENTS = ['timer', 'loop-timeout', 'loop-max-iterations', ...Object.values(STATE)];

// Records how many times each event fired, and every state transition in order.
const createTimer = (config: Partial<TimerConfig> = {}) => {
    const timer = Timer.getInstance({ ...baseConfig, ...config });
    const counts: Record<string, number> = {};
    const events: string[] = [];
    const states: STATE[] = [];
    const progress: string[] = [];

    for (const event of EVENTS) {
        counts[event] = 0;
        timer.on(event, () => {
            counts[event] = (counts[event] ?? 0) + 1;
            events.push(event);
        });
    }
    timer.on('state', (payload) => {
        states.push(payload.state);
        progress.push(payload.progress);
    });

    return { timer, counts, events, states, progress };
};
