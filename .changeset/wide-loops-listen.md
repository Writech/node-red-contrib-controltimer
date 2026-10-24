---
"node-red-contrib-controltimer": minor
---

Allow overriding `timerMaxLoopIterations`, `timerLoopTimeout` and `timerLoopTimeoutUnit` with the `START` action, for example `{ payload: "START", timerMaxLoopIterations: 5 }`. Each loop option can be sent on its own, `0` switches the limit or the timeout off for that run, and invalid values report an error.
