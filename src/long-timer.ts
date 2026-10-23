import { clearInterval, clearTimeout } from 'timers';

// setTimeout and setInterval treat delays above 2^31-1 ms (~24.8 days) as 1 ms.
export const MAX_NATIVE_DELAY_MILLISECONDS = 2 ** 31 - 1;

export interface LongTimer {
    clear(): void;
}

/**
 * Like setTimeout, but supports delays above the native limit by sleeping in chunks until the deadline.
 * Delays within the native limit use a plain setTimeout.
 * `maxChunkInMilliseconds` exists so tests can exercise the chunking with real timers and short delays.
 */
export function setLongTimeout(callback: () => void, delayInMilliseconds: number, maxChunkInMilliseconds = MAX_NATIVE_DELAY_MILLISECONDS): LongTimer {
    if (delayInMilliseconds <= maxChunkInMilliseconds) {
        const timeoutId = setTimeout(callback, delayInMilliseconds);
        return { clear: () => clearTimeout(timeoutId) };
    }

    const deadlineUnixTimestamp = Date.now() + delayInMilliseconds;
    let timeoutId: NodeJS.Timeout | undefined;

    const sleepUntilDeadline = () => {
        const remainingMilliseconds = deadlineUnixTimestamp - Date.now();
        timeoutId = setTimeout(
            () => {
                if (deadlineUnixTimestamp - Date.now() > 0) {
                    sleepUntilDeadline();
                } else {
                    callback();
                }
            },
            Math.min(Math.max(remainingMilliseconds, 0), maxChunkInMilliseconds),
        );
    };
    sleepUntilDeadline();

    return { clear: () => clearTimeout(timeoutId) };
}

/**
 * Like setInterval, but supports delays above the native limit. Delays within the native limit use a plain setInterval.
 */
export function setLongInterval(callback: () => void, delayInMilliseconds: number, maxChunkInMilliseconds = MAX_NATIVE_DELAY_MILLISECONDS): LongTimer {
    if (delayInMilliseconds <= maxChunkInMilliseconds) {
        const intervalId = setInterval(callback, delayInMilliseconds);
        return { clear: () => clearInterval(intervalId) };
    }

    let isCleared = false;
    let currentTimer: LongTimer;

    const scheduleNextTick = () => {
        currentTimer = setLongTimeout(
            () => {
                callback();
                if (!isCleared) {
                    scheduleNextTick();
                }
            },
            delayInMilliseconds,
            maxChunkInMilliseconds,
        );
    };
    scheduleNextTick();

    return {
        clear: () => {
            isCleared = true;
            currentTimer.clear();
        },
    };
}
