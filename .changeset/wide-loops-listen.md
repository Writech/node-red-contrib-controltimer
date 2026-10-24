---
"node-red-contrib-controltimer": minor
---

Allow overriding `isTimerProgressUpdateEnabled`, `timerMaxLoopIterations`, `timerLoopTimeout` and `timerLoopTimeoutUnit` with the `START` action, for example `{ payload: "START", timerMaxLoopIterations: 5 }`. Each of them can be sent on its own, `0` switches the iteration limit or the loop timeout off for that run, and invalid values report an error.
