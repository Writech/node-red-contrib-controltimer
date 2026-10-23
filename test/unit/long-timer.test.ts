import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { MAX_NATIVE_DELAY_MILLISECONDS, setLongInterval, setLongTimeout } from '../../src/long-timer';

const MAX = MAX_NATIVE_DELAY_MILLISECONDS;

describe('src/long-timer.ts', () => {
    beforeEach(() => {
        mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
    });

    afterEach(() => {
        mock.timers.reset();
    });

    describe('setLongTimeout', () => {
        it('fires after a short delay', () => {
            const callback = mock.fn();
            setLongTimeout(callback, 1000);

            mock.timers.tick(999);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 1);
        });

        it('fires at exactly the native limit', () => {
            const callback = mock.fn();
            setLongTimeout(callback, MAX);

            mock.timers.tick(MAX - 1);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 1);
        });

        it('does not fire early for delays above the native limit', () => {
            const callback = mock.fn();
            setLongTimeout(callback, MAX + 5000);

            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(MAX);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(4998);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 1);
        });

        it('fires once after several chunks', () => {
            const callback = mock.fn();
            const delay = 3 * MAX + 123;
            setLongTimeout(callback, delay);

            mock.timers.tick(delay - 1);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 1);
            mock.timers.tick(MAX);
            assert.equal(callback.mock.callCount(), 1);
        });

        it('can be cleared before and between chunks', () => {
            const early = mock.fn();
            setLongTimeout(early, MAX + 1000).clear();
            mock.timers.tick(MAX + 1000);
            assert.equal(early.mock.callCount(), 0);

            const later = mock.fn();
            const timer = setLongTimeout(later, 2 * MAX);
            mock.timers.tick(MAX + 10);
            timer.clear();
            mock.timers.tick(MAX);
            assert.equal(later.mock.callCount(), 0);
        });
    });

    describe('setLongInterval', () => {
        it('fires repeatedly for short delays', () => {
            const callback = mock.fn();
            setLongInterval(callback, 1000);

            mock.timers.tick(3000);
            assert.equal(callback.mock.callCount(), 3);
        });

        it('fires every interval for delays above the native limit', () => {
            const callback = mock.fn();
            const delay = MAX + 5000;
            setLongInterval(callback, delay);

            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 0);
            mock.timers.tick(delay - 1);
            assert.equal(callback.mock.callCount(), 1);
            mock.timers.tick(delay - 1);
            assert.equal(callback.mock.callCount(), 1);
            mock.timers.tick(1);
            assert.equal(callback.mock.callCount(), 2);
        });

        it('stops when cleared from inside its own callback', () => {
            const delay = MAX + 1000;
            let calls = 0;
            const timer = setLongInterval(() => {
                calls += 1;
                timer.clear();
            }, delay);

            mock.timers.tick(delay * 3);
            assert.equal(calls, 1);
        });

        it('stops when cleared between ticks', () => {
            const callback = mock.fn();
            const delay = MAX + 1000;
            const timer = setLongInterval(callback, delay);

            mock.timers.tick(delay);
            timer.clear();
            mock.timers.tick(delay * 2);
            assert.equal(callback.mock.callCount(), 1);
        });
    });
});
