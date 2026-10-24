---
"node-red-contrib-controltimer": minor
---

Add a `STATUS` action. The node replies on its second output with the received message and a `timer` object holding the state, duration, elapsed time, remaining time, progress, loop iteration and time left until the loop timeout. The second output is now labelled `timer-events` instead of `timer-halted`.
