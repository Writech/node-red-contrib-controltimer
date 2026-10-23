---
"node-red-contrib-controltimer": patch
---

Validate the `timerType`, `timerDuration` and `timerDurationUnit` override received with a `START` action. An invalid override now reports an error and the message is not acted on, instead of starting a broken timer.
