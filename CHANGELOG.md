# node-red-contrib-controltimer

## 0.6.0

### Minor Changes

- c19a95d: Validate the `timerType`, `timerDuration` and `timerDurationUnit` override received with a `START` action. An invalid override now reports an error and the message is not acted on, instead of starting a broken timer. `timerDuration` must be a number greater than 0, so values such as `"5"`, `0` and negative numbers are now rejected. `timerDurationUnit` also accepts plural and differently cased names such as `minutes` or `Seconds`.

## 0.5.4

### Patch Changes

- 139d424: Fix timers with a duration, interval or loop timeout above about 24.8 days firing almost immediately.

## 0.5.3

### Patch Changes

- dc9cffd: Fix "NaN%" progress being shown when a configuration override is received while the timer is idle or stopped.

## 0.5.2

### Patch Changes

- fa68ffa: Fix loop timeout being restarted in full when a paused loop is continued; time already spent running before the pause now counts towards the timeout.

## 0.5.1

### Patch Changes

- b49a4d3: Fix loop timer iteration counter being reset when a paused loop is continued, which let the loop run past `timerMaxLoopIterations`.

## 0.5.0

### Minor Changes

- 003b1bd: Require Node.js 18 or later.

## v0.4.1 (27.05.2023)
- Bugfix: When the timer was in a paused state and received an override configuration, it failed to update the visible timer progress.

## v0.4.0 (27.05.2023)
- Rename `isConsecutiveStartActionTimerResetAllowed` configuration option to `resetTimerOnReceivalOfStartAction` for more consistent naming convention.
- Add new configuration option `continueTimerOnReceivalOfStartAction` to control whether `START` action should continue a paused timer.
- Move `resetTimerOnReceivalOfStartAction` option (previously `isConsecutiveStartActionTimerResetAllowed`) next to `continueTimerOnReceivalOfStartAction` option everywhere (in code an in UI).
- Continue paused timer on receival of `START` action if `continueTimerOnReceivalOfStartAction` option is enabled.

## v0.3.0 (17.11.2022)
- Allow overriding `timerType`, `timerDuration`, and `timerDurationUnit` via `START` action.
