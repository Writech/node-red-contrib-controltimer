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

    // Real timers with a tiny chunk size, so the chunking is exercised without waiting 24 days.
    describe('with real timers', () => {
        const CHUNK = 40;

        beforeEach(() => {
            mock.timers.reset();
        });

        const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

        it('fires a chunked timeout once, no earlier than its delay', async () => {
            const startedAt = Date.now();
            const firedAfter: number[] = [];
            setLongTimeout(() => firedAfter.push(Date.now() - startedAt), 130, CHUNK);

            await sleep(100);
            assert.deepEqual(firedAfter, []);
            await sleep(150);
            assert.equal(firedAfter.length, 1);
            assert.ok((firedAfter[0] ?? 0) >= 129, `fired early after ${firedAfter[0]} ms`);
        });

        it('does not fire a chunked timeout that was cleared mid-way', async () => {
            const callback = mock.fn();
            const timer = setLongTimeout(callback, 130, CHUNK);

            await sleep(60);
            timer.clear();
            await sleep(150);
            assert.equal(callback.mock.callCount(), 0);
        });

        it('fires a chunked interval repeatedly at its delay', async () => {
            const startedAt = Date.now();
            const tickTimes: number[] = [];
            const timer = setLongInterval(() => tickTimes.push(Date.now() - startedAt), 90, CHUNK);

            await sleep(300);
            timer.clear();
            const ticks = tickTimes.length;
            assert.ok(ticks >= 2 && ticks <= 3, `unexpected tick count ${ticks}`);
            assert.ok((tickTimes[0] ?? 0) >= 89, `first tick early after ${tickTimes[0]} ms`);

            await sleep(200);
            assert.equal(tickTimes.length, ticks);
        });
    });
});
