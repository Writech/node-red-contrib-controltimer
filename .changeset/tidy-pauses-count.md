---
"node-red-contrib-controltimer": patch
---

Fix loop timeout being restarted in full when a paused loop is continued; time already spent running before the pause now counts towards the timeout.
