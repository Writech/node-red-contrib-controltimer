# node-red-contrib-controltimer

## Overview

The `node-red-contrib-controltimer` is a versatile Node-RED timer node that supports both looping and delay behavior. It allows interaction through action messages, enabling actions such as starting, resetting, stopping, pausing, and continuing the timer. This node has two outputs: the first one emits a message when the timer is triggered (either the delay expires or the interval is reached), while the second one emits a message when the running timer is stopped or paused.

The timer can be explicitly reset by using the `RESET` action, causing it to restart the countdown from the beginning. Alternatively, if the `Reset timer on reception of START action` option is enabled, sending a `START` action will also reset the timer. Moreover, when the `Reset timer on reception of unknown message` option is enabled, the timer will be reset upon receiving an unknown message.

Both looping and delay behavior timers can be paused and later resumed. When resumed, they will continue counting down from the remaining duration.

To aid in debugging or gain an overview of the timer's progress, you can enable the `Is running timer progress visible` option. This will display the timer's progress as a percentage of the total duration in the node's status area.

Additionally, you have the flexibility to disable specific actions for the node. For example, you can disable the `RESET`, `PAUSE`, and `CONTINUE` actions. In such cases, when the node receives any of the aforementioned actions, it will treat them as unknown messages.

## Override configuration

Initiate the timer with overridden configuration by using the `START` command. Include the properties `timerType`, `timerDuration`, and `timerDurationUnit` in the message to override them. The timer's control functionalities (pausing, continuing, resetting) also work while in override mode.

Note that the reconfigured values are ephemeral and not saved to the node's configuration. They remain active until the timer is manually stopped or completes its cycle. Once the timer is stopped or completes, it will revert back to the values specified in the node's configuration.

When you override the configuration of a node, the information displayed on the node itself will not be updated. However, the Controltimer will run based on the configuration you have provided. To confirm that the controltimer is running according to your sent configuration, check the timer progress status below the node.

```javascript
{
    payload: 'START',
    timerType: 'delay', // 'delay', 'loop'
    timerDuration: 3000,
    timerDurationUnit: 'millisecond', // 'millisecond', 'second', 'minute', 'hour'
}
```

## Example flow diagram

<details>  
  <summary>Copy-Paste this flow to Node-RED to test it out yourself.</summary>

```json
[
    {
        "id": "afd749500f2d393d",
        "type": "tab",
        "label": "ControlTimer Example",
        "disabled": false,
        "info": ""
    },
    {
        "id": "79276f6f06e96f24",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "1ae1e3ee2f5250a6",
        "type": "debug",
        "z": "afd749500f2d393d",
        "name": "TIMER TRIGGERED",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 680,
        "y": 140,
        "wires": []
    },
    {
        "id": "9711419041494ee9",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "2db5a47c85a55778",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "52882ab466bde0a2",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "5acb4a13897dfe33",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "5c9aea117d0cb988",
        "type": "debug",
        "z": "afd749500f2d393d",
        "name": "TIMER HALTED",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 660,
        "y": 180,
        "wires": []
    },
    {
        "id": "bbd756d4850041fa",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "76203a31872dca18",
        "type": "inject",
        "z": "afd749500f2d393d",
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
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "01f89a1a0cfa1eb2",
        "type": "inject",
        "z": "afd749500f2d393d",
        "name": "START (3000ms delay)",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "timerType",
                "v": "delay",
                "vt": "str"
            },
            {
                "p": "timerDuration",
                "v": "3000",
                "vt": "num"
            },
            {
                "p": "timerDurationUnit",
                "v": "millisecond",
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
        "x": 160,
        "y": 320,
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "c96f33f73a45a2a0",
        "type": "inject",
        "z": "afd749500f2d393d",
        "name": "START (3000ms loop)",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "timerType",
                "v": "loop",
                "vt": "str"
            },
            {
                "p": "timerDuration",
                "v": "3000",
                "vt": "num"
            },
            {
                "p": "timerDurationUnit",
                "v": "millisecond",
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
        "x": 160,
        "y": 360,
        "wires": [["44e6d3eefa84eb4d"]]
    },
    {
        "id": "44e6d3eefa84eb4d",
        "type": "controltimer",
        "z": "afd749500f2d393d",
        "name": "",
        "timerType": "delay",
        "timerDurationUnit": "minute",
        "timerDurationType": "num",
        "timerDuration": 1,
        "timerLoopTimeoutUnit": "second",
        "timerLoopTimeoutType": "num",
        "timerLoopTimeout": 0,
        "loopTimeoutMessageType": "str",
        "loopTimeoutMessage": "LOOP_TIMEOUT",
        "timerMaxLoopIterationsType": "num",
        "timerMaxLoopIterations": 0,
        "loopMaxIterationsMessageType": "str",
        "loopMaxIterationsMessage": "MAX_LOOP_ITERATIONS",
        "isRunningTimerProgressVisible": true,
        "outputReceivedMessageOnTimerTrigger": true,
        "outputReceivedMessageOnTimerHalt": false,
        "startTimerOnReceivalOfUnknownMessage": false,
        "resetTimerOnReceivalOfUnknownMessage": false,
        "resetTimerOnReceivalOfStartAction": false,
        "continueTimerOnReceivalOfStartAction": false,
        "isDebugModeEnabled": false,
        "timerTriggeredMessageType": "str",
        "timerTriggeredMessage": "TIMER_TRIGGERED",
        "timerHaltedMessageType": "str",
        "timerHaltedMessage": "TIMER_HALTED",
        "isStartActionEnabled": true,
        "isStopActionEnabled": true,
        "isResetActionEnabled": true,
        "isPauseActionEnabled": true,
        "isContinueActionEnabled": true,
        "actionPropertyNameType": "str",
        "actionPropertyName": "payload",
        "startActionNameType": "str",
        "startActionName": "START",
        "stopActionNameType": "str",
        "stopActionName": "STOP",
        "resetActionNameType": "str",
        "resetActionName": "RESET",
        "pauseActionNameType": "str",
        "pauseActionName": "PAUSE",
        "continueActionNameType": "str",
        "continueActionName": "CONTINUE",
        "x": 440,
        "y": 200,
        "wires": [["1ae1e3ee2f5250a6"], ["5c9aea117d0cb988"]]
    }
]
```

</details>

![controltimer example flow](img/example-flow.png?raw=true)  
![controltimer example progress](img/example-progress.png?raw=true)

## Installation

Change directory to your node red installation:

$ npm install --save node-red-contrib-controltimer

## Configuration

| Option                                       | Description                                                                                                                                            | DEFAULT               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `Timer type`                                 | Defines the timer behaviour. Available options are `Delay` and `Loop`.                                                                                 | `Delay`               |
| `Timer duration unit`                        | Defines the timer duration unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`.                                               | `Seconds`             |
| `Timer duration`                             | Defines the timer duration in specified (`Timer duration unit`) units.                                                                                 | `5`                   |
| `Loop timeout unit`                          | Defines timer loop timeout unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`.                                               | `Seconds`             |
| `Loop timeout`                               | Defines the timer loop timeout in specified (`Loop timeout unit`) units. `0` means no timeout.                                                         | `0`                   |
| `Loop timeout message`                       | Defines message that is emitted via `timer-halted` output upon timeout.                                                                                | `LOOP_TIMEOUT`        |
| `Loop max iterations`                        | Defines timer loop max iterations limit. `0` means no limit.                                                                                           | `0`                   |
| `Loop max iterations message`                | Defines message that is emitted via `timer-halted` output upon max iterations are reached.                                                             | `MAX_LOOP_ITERATIONS` |
| `Is running timer progress visible`          | If `true` it will display the timer's progress in node's status area as percentages. A good option for debugging long running tasks.                   | `false`               |
| `Output received message on timer trigger`   | If `true` it will emit the message the node received when timer triggers. If `false` it will emit an empty message.                                    | `true`                |
| `Output received message on timer halt`      | If `true` it will emit the message the node received when timer is halted. If `false` it will emit an empty message.                                   | `true`                |
| `Start timer on receival of unknown message` | If `true` the timer is started upon receival of unknown\* message                                                                                      | `false`               |
| `Reset timer on receival of unknown message` | If `true` the timer is reset upon receival of unknown\* message                                                                                        | `false`               |
| `Reset timer on receival of START action`    | If `true` the timer is reset upon receival of `START` action.                                                                                          | `false`               |
| `Continue timer on receival of START action` | If `true` the timer is continued upon receival of `START` action.                                                                                      | `false`               |
| `Is debug mode enabled`                      | If `true` node will log errors into debug console                                                                                                      | `false`               |
| `Timer triggered message`                    | Defines message that is emitted via `timer-triggered` output when timer is triggered and if `Output received message on timer trigger` is not enabled. | `TIMER_TRIGGERED`     |
| `Timer triggered message`                    | Defines message that is emitted via `timer-halted` output when timer is halted and if `Output received message on timer halt` is not enabled.          | `TIMER_HALTED`        |
| `Is start action enabled`                    | If `true` node is permitted to receive Start actions                                                                                                   | `true`                |
| `Is stop action enabled`                     | If `true` node is permitted to receive Stop actions                                                                                                    | `true`                |
| `Is reset action enabled`                    | If `true` node is permitted to receive Reset actions                                                                                                   | `true`                |
| `Is pause action enabled`                    | If `true` node is permitted to receive Pause actions                                                                                                   | `true`                |
| `Is continue action enabled`                 | If `true` node is permitted to receive Continue actions                                                                                                | `true`                |
| `Action property name`                       | Defines the property on a received message on which the action string to interact with timer can be found.                                             | `payload`             |
| `Start action name`                          | Defines the action string that will `START` the timer.                                                                                                 | `START`               |
| `Stop action name`                           | Defines the action string that will `STOP` the timer.                                                                                                  | `STOP`                |
| `Reset action name`                          | Defines the action string that will `RESET` the timer.                                                                                                 | `RESET`               |
| `Pause action name`                          | Defines the action string that will `PAUSE` the timer.                                                                                                 | `PAUSE`               |
| `Continue action name`                       | Defines the action string that will `CONTINUE` the paused timer.                                                                                       | `CONTINUE`            |

_\* An unknown message refers to a message with a payload that is not part of the defined and enabled set of action strings. For example, it could be a message without a defined `Action property name` or a message with a `Action property name` value that does not match any of the enabled action names. If a disabled action, such as the `PAUSE` action, is received, it is considered an unknown message according to the settings._

<a target="_blank" href="https://icons8.com/icons/set/future">Future icon</a> by <a target="_blank" href="https://icons8.com">Icons8</a>
