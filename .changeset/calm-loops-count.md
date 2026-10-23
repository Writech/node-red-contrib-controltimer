---
"node-red-contrib-controltimer": patch
---

Fix loop timer iteration counter being reset when a paused loop is continued, which let the loop run past `timerMaxLoopIterations`.
