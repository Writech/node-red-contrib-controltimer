# node-red-contrib-controltimer

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
