## ControlTimer

A customizable Node-RED timer node which you use as a delay or as a loop. The timer can be interacted with by action strings (configurable) specified in received message action property (configurable).

The timer can be started and stopped. Timer can be reset (timer will restart countdown from beginning) explicitly by the `Reset action` or when `Is consecutive start action timer reset allowed` option is enabled timer will be reset every time a `Start action` is received in addition to received `Reset actions`. Timer can be paused and later continued - it will count down the remaining duration.

### Installation
 
Change directory to your node red installation:

    $ npm install --save node-red-contrib-controltimer
 
### Configuration 

| Option        | Description                                                              | DEFAULT
| --------------- | ------------------------------------------------------------------------ | -----
| `Is consecutive start action timer reset allowed` | If `true` it will reset the timer when it receives a `Start action`. | `false`
| `Is running timer progress visible` | If `true` it will display the timer's progress in node's status area as percentages. A good option for debugging long running tasks. | `false`
| `Output received message on timer trigger` | If `true` it will emit the message the node received when timer triggers. If `false` it will emit an empty message. | `true`
| `Output received message on timer halt` | If `true` it will emit the message the node received when timer is halted. If `false` it will emit an empty message. | `true`
| `Timer type` | Defines the timer behaviour. Available options are `Delay` and `Loop`. | `Delay`
| `Timer duration unit` | Defines the timer duration unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`. | `Seconds`
| `Timer duration` | Defines the timer duration in specified (`Timer duration unit`) units. | `5`
| `Action property name` | Defines the property on a received message on which the action string to interact with timer can be found. | `payload`
| `Start action name` | Defines the action string that will START the timer. | `START`
| `Reset action name`  | Defines the action string that will RESET the timer. | `RESET`
| `Pause action name` | Defines the action string that will PAUSE the timer. | `PAUSE`
| `Continue action name` | Defines the action string that will CONTINUE the paused timer. | `CONTINUE`
| `Stop action name` | Defines the action string that will STOP the timer. | `STOP`

### State diagram

![controltimer state diagram](https://github.com/Writech/node-red-contrib-controltimer/raw/master/img/state-diagram.png)

### Example

![controltimer example flow](https://github.com/Writech/node-red-contrib-controltimer/raw/master/img/example-flow.png)

```json
[
     {
         "id": "e3c81493.d9d2f8",
         "type": "tab",
         "label": "Controltimer",
         "disabled": false,
         "info": ""
     },
     {
         "id": "e9565a66.765b58",
         "type": "inject",
         "z": "e3c81493.d9d2f8",
         "name": "",
         "props": [
             {
                 "p": "payload"
             },
             {
                 "p": "topic",
                 "vt": "str"
             }
         ],
         "repeat": "",
         "crontab": "",
         "once": false,
         "onceDelay": 0.1,
         "topic": "",
         "payload": "START",
         "payloadType": "str",
         "x": 110,
         "y": 40,
         "wires": [
             [
                 "28b4e7da.de0758"
             ]
         ]
     },
     {
         "id": "87b98e47.b188c",
         "type": "debug",
         "z": "e3c81493.d9d2f8",
         "name": "TIMER TRIGGERED",
         "active": true,
         "tosidebar": true,
         "console": false,
         "tostatus": false,
         "complete": "true",
         "targetType": "full",
         "statusVal": "",
         "statusType": "auto",
         "x": 540,
         "y": 100,
         "wires": []
     },
     {
         "id": "6f03d8e2.43ef98",
         "type": "inject",
         "z": "e3c81493.d9d2f8",
         "name": "",
         "props": [
             {
                 "p": "payload"
             },
             {
                 "p": "topic",
                 "vt": "str"
             }
         ],
         "repeat": "",
         "crontab": "",
         "once": false,
         "onceDelay": 0.1,
         "topic": "",
         "payload": "STOP",
         "payloadType": "str",
         "x": 110,
         "y": 80,
         "wires": [
             [
                 "28b4e7da.de0758"
             ]
         ]
     },
     {
         "id": "80765310.41236",
         "type": "inject",
         "z": "e3c81493.d9d2f8",
         "name": "",
         "props": [
             {
                 "p": "payload"
             },
             {
                 "p": "topic",
                 "vt": "str"
             }
         ],
         "repeat": "",
         "crontab": "",
         "once": false,
         "onceDelay": 0.1,
         "topic": "",
         "payload": "RESET",
         "payloadType": "str",
         "x": 110,
         "y": 120,
         "wires": [
             [
                 "28b4e7da.de0758"
             ]
         ]
     },
     {
         "id": "8efa6f10.34b82",
         "type": "inject",
         "z": "e3c81493.d9d2f8",
         "name": "",
         "props": [
             {
                 "p": "payload"
             },
             {
                 "p": "topic",
                 "vt": "str"
             }
         ],
         "repeat": "",
         "crontab": "",
         "once": false,
         "onceDelay": 0.1,
         "topic": "",
         "payload": "PAUSE",
         "payloadType": "str",
         "x": 110,
         "y": 160,
         "wires": [
             [
                 "28b4e7da.de0758"
             ]
         ]
     },
     {
         "id": "dc1a826a.162c",
         "type": "inject",
         "z": "e3c81493.d9d2f8",
         "name": "CONTINUE",
         "props": [
             {
                 "p": "payload"
             },
             {
                 "p": "topic",
                 "vt": "str"
             }
         ],
         "repeat": "",
         "crontab": "",
         "once": false,
         "onceDelay": 0.1,
         "topic": "",
         "payload": "CONTINUE",
         "payloadType": "str",
         "x": 130,
         "y": 200,
         "wires": [
             [
                 "28b4e7da.de0758"
             ]
         ]
     },
     {
         "id": "4452e395.eca39c",
         "type": "debug",
         "z": "e3c81493.d9d2f8",
         "name": "TIMER HALTED",
         "active": true,
         "tosidebar": true,
         "console": false,
         "tostatus": false,
         "complete": "true",
         "targetType": "full",
         "statusVal": "",
         "statusType": "auto",
         "x": 520,
         "y": 140,
         "wires": []
     },
     {
         "id": "28b4e7da.de0758",
         "type": "controltimer",
         "z": "e3c81493.d9d2f8",
         "name": "",
         "isConsecutiveStartActionTimerResetAllowed": false,
         "isRunningTimerProgressVisible": false,
         "outputReceivedMessageOnTimerTrigger": false,
         "outputReceivedMessageOnTimerHalt": false,
         "timerType": "delay",
         "timerDurationUnit": "second",
         "timerDurationType": "num",
         "timerDuration": "5",
         "actionPropertyNameType": "msg",
         "actionPropertyName": "payload",
         "startActionName": "START",
         "resetActionName": "RESET",
         "pauseActionName": "PAUSE",
         "continueActionName": "CONTINUE",
         "stopActionName": "STOP",
         "x": 320,
         "y": 120,
         "wires": [
             [
                 "87b98e47.b188c"
             ],
             [
                 "4452e395.eca39c"
             ]
         ]
     }
 ]
```
