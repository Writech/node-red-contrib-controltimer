---
"node-red-contrib-controltimer": minor
---

Validate the `timerType`, `timerDuration` and `timerDurationUnit` override received with a `START` action. An invalid override now reports an error and the message is not acted on, instead of starting a broken timer. `timerDuration` must be a number greater than 0, so values such as `"5"`, `0` and negative numbers are now rejected.
