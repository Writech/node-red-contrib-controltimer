# node-red-contrib-controltimer

A customizable Node-RED timer node which offers both looping and delay behaviour. The timer can be interacted with by action messages. Timer can be started, reset, stopped, paused and continued. The timer has two outputs - the first one outputs the message when timer is triggered (delay expires or interval is triggered) and the second one outputs the message when the running timer is stopped or paused.

Timer can be reset (timer will restart countdown from beginning) explicitly by the `Reset action` or when `Is consecutive start action timer reset allowed` option is enabled in addition to received `Reset actions` timer will be reset also every time a `Start action` is received. When `Reset timer on receival of unknown message` option is enabled the timer will be reset when it recieves an unknown* message.

Timer can be paused and later continued. This applies to both looping and delay behaviour. Upon continuing it will count down the remaining duration.

For debugging or just to get an overview of timer progress you can enable `Is running timer progress visible` option. This will show timer progress in percentage of the total duration in the nodes status area. 

You can disable specific actions for node. For example disable Reset, Pause and Continue actions. Now when a node recieves any of the aforementioned actions it will treat them as unknown* messages.


## Example flow diagram
See the flow JSON after Configuration section to test it out yourself.

![controltimer example flow](img/example-flow.png?raw=true)

## Installation
 
Change directory to your node red installation:

    $ npm install --save node-red-contrib-controltimer
 
## Configuration 

| Option        | Description                                                              | DEFAULT
| --------------- | ------------------------------------------------------------------------ | -----
| `Timer type` | Defines the timer behaviour. Available options are `Delay` and `Loop`. | `Delay`
| `Timer duration unit` | Defines the timer duration unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`. | `Seconds`
| `Timer duration` | Defines the timer duration in specified (`Timer duration unit`) units. | `5`
| `Loop timeout unit` | Defines timer loop timeout unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`. | `Seconds`
| `Loop timeout` | Defines the timer loop timeout in specified (`Loop timeout unit`) units. `0` means no timeout. | `0`
| `Loop timeout message` | Defines message that is emitted via `timer-halted` output upon timeout. | `LOOP_TIMEOUT`
| `Loop max iterations` | Defines timer loop max iterations limit. `0` means no limit. | `0`
| `Loop max iterations message` | Defines message that is emitted via `timer-halted` output upon max iterations are reached. | `MAX_LOOP_ITERATIONS`
| `Is consecutive start action timer reset allowed` | If `true` it will reset the timer when it receives a `Start action`. | `false`
| `Is running timer progress visible` | If `true` it will display the timer's progress in node's status area as percentages. A good option for debugging long running tasks. | `false`
| `Output received message on timer trigger` | If `true` it will emit the message the node received when timer triggers. If `false` it will emit an empty message. | `true`
| `Output received message on timer halt` | If `true` it will emit the message the node received when timer is halted. If `false` it will emit an empty message. | `true`
| `Start timer on receival of unknown message` | If `true` node will start the timer upon receival of unknown* message | `false`
| `Reset timer on receival of unknown message` | If `true` node will reset the timer upon receival of unknown* message | `false`
| `Is debug mode enabled` | If `true` node will log errors into debug console | `false`
| `Timer triggered message` | Defines message that is emitted via `timer-triggered` output when timer is triggered and if `Output received message on timer trigger` is not enabled. | `TIMER_TRIGGERED`
| `Timer triggered message` | Defines message that is emitted via `timer-halted` output when timer is halted and if `Output received message on timer halt` is not enabled. | `TIMER_HALTED`
| `Is start action enabled` | If `true` node is permitted to receive Start actions | `true`
| `Is stop action enabled` | If `true` node is permitted to receive Stop actions | `true`
| `Is reset action enabled` | If `true` node is permitted to receive Reset actions | `true`
| `Is pause action enabled` | If `true` node is permitted to receive Pause actions | `true`
| `Is continue action enabled` | If `true` node is permitted to receive Continue actions | `true`
| `Action property name` | Defines the property on a received message on which the action string to interact with timer can be found. | `payload`
| `Start action name` | Defines the action string that will START the timer. | `START`
| `Stop action name` | Defines the action string that will STOP the timer. | `STOP`
| `Reset action name`  | Defines the action string that will RESET the timer. | `RESET`
| `Pause action name` | Defines the action string that will PAUSE the timer. | `PAUSE`
| `Continue action name` | Defines the action string that will CONTINUE the paused timer. | `CONTINUE`

**Unknown message is a message with a payload that's not in the set of defined and enabled action strings. Ex. message with no defined `Action property name` or a message with `Action property name` contents which doesn't match any of the enabled action names. Ex. if Pause action is received but it's disabled in the settings it's regarded as unknown message.*

## State diagram

![controltimer state diagram](img/state-diagram.png?raw=true)

## Example flow

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

## TODO
* Allow configuring timer type (loop or delay) and duration (amount and unit) via received message.
* ...

<a target="_blank" href="https://icons8.com/icons/set/future">Future icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
