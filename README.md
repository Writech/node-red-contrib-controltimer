# ControlTimer

A customizable Node-RED timer node which you use as a delay or as a loop. The timer can be interacted with by action strings (configurable) specified in received message action property (configurable).

The timer can be started and stopped. Timer can be reset (timer will restart countdown from beginning) explicitly by the `Reset action` or when `Is consecutive start action timer reset allowed` option is enabled in addition to received `Reset actions` timer will be reset also every time a `Start action` is received. Timer can be paused and later continued - it will count down the remaining duration.

## Installation
 
Change directory to your node red installation:

    $ npm install --save node-red-contrib-controltimer
 
## Configuration 

| Option        | Description                                                              | DEFAULT
| --------------- | ------------------------------------------------------------------------ | -----
| `Timer type` | Defines the timer behaviour. Available options are `Delay` and `Loop`. | `Delay`
| `Timer duration unit` | Defines the timer duration unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`. | `Seconds`
| `Timer duration` | Defines the timer duration in specified (`Timer duration unit`) units. | `5`
| `Is consecutive start action timer reset allowed` | If `true` it will reset the timer when it receives a `Start action`. | `false`
| `Is running timer progress visible` | If `true` it will display the timer's progress in node's status area as percentages. A good option for debugging long running tasks. | `false`
| `Output received message on timer trigger` | If `true` it will emit the message the node received when timer triggers. If `false` it will emit an empty message. | `true`
| `Output received message on timer halt` | If `true` it will emit the message the node received when timer is halted. If `false` it will emit an empty message. | `true`
| `Start timer on receival of unknown message` | If `true` node will start the timer upon receival of unknown* message | `false`
| `Reset timer on receival of unknown message` | If `true` node will reset the timer upon receival of unknown* message | `false`
| `Is start action enabled` | If `true` node is permitted to receive Start actions | `true`
| `Is reset action enabled` | If `true` node is permitted to receive Reset actions | `true`
| `Is stop action enabled` | If `true` node is permitted to receive Stop actions | `true`
| `Is pause action enabled` | If `true` node is permitted to receive Pause actions | `true`
| `Is continue action enabled` | If `true` node is permitted to receive Continue actions | `true`
| `Is debug mode enabled` | If `true` node will log errors into debug console | `false`
| `Action property name` | Defines the property on a received message on which the action string to interact with timer can be found. | `payload`
| `Start action name` | Defines the action string that will START the timer. | `START`
| `Reset action name`  | Defines the action string that will RESET the timer. | `RESET`
| `Pause action name` | Defines the action string that will PAUSE the timer. | `PAUSE`
| `Continue action name` | Defines the action string that will CONTINUE the paused timer. | `CONTINUE`
| `Stop action name` | Defines the action string that will STOP the timer. | `STOP`

**Unknown message is a message with a payload that's not in the set of defined and enabled action strings. Ex. message with no defined `Action property name` or a message with `Action property name` contents which doesn't match any of the enabled action names. Ex. if Pause action is received but it's disabled in the settings it's regarded as unknown message.*

## State diagram

![controltimer state diagram](img/state-diagram.png?raw=true)

## Example

![controltimer example flow](img/example-flow.png?raw=true)

```json
[
    {
        "id": "e3c81493.d9d2f8",
        "type": "tab",
        "label": "ControlTimer Example",
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
                "302cfb99.eb6ad4"
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
        "x": 580,
        "y": 120,
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
                "302cfb99.eb6ad4"
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
                "302cfb99.eb6ad4"
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
                "302cfb99.eb6ad4"
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
                "302cfb99.eb6ad4"
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
        "x": 560,
        "y": 160,
        "wires": []
    },
    {
        "id": "3df24239.0889fe",
        "type": "inject",
        "z": "e3c81493.d9d2f8",
        "name": "",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "UNKNOWN1",
        "payloadType": "str",
        "x": 130,
        "y": 240,
        "wires": [
            [
                "302cfb99.eb6ad4"
            ]
        ]
    },
    {
        "id": "302cfb99.eb6ad4",
        "type": "controltimer",
        "z": "e3c81493.d9d2f8",
        "name": "",
        "timerType": "delay",
        "timerDurationUnit": "second",
        "timerDurationType": "num",
        "timerDuration": "5",
        "isConsecutiveStartActionTimerResetAllowed": false,
        "isRunningTimerProgressVisible": false,
        "outputReceivedMessageOnTimerTrigger": true,
        "outputReceivedMessageOnTimerHalt": true,
        "startTimerOnReceivalOfUnknownMessage": false,
        "resetTimerOnReceivalOfUnknownMessage": false,
        "isStartActionEnabled": true,
        "isResetActionEnabled": true,
        "isStopActionEnabled": true,
        "isPauseActionEnabled": true,
        "isContinueActionEnabled": true,
        "isDebugModeEnabled": false,
        "actionPropertyNameType": "msg",
        "actionPropertyName": "payload",
        "startActionName": "START",
        "resetActionName": "RESET",
        "pauseActionName": "PAUSE",
        "continueActionName": "CONTINUE",
        "stopActionName": "STOP",
        "x": 360,
        "y": 140,
        "wires": [
            [
                "87b98e47.b188c"
            ],
            [
                "4452e395.eca39c"
            ]
        ]
    },
    {
        "id": "903e22bf.49913",
        "type": "inject",
        "z": "e3c81493.d9d2f8",
        "name": "UNKNOWN2",
        "props": [
            {
                "p": "unknown",
                "v": "UNKNOWN2",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "x": 130,
        "y": 280,
        "wires": [
            [
                "302cfb99.eb6ad4"
            ]
        ]
    }
]
```

<a target="_blank" href="https://icons8.com/icons/set/future">Future icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
