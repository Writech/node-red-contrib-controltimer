# node-red-contrib-controltimer

## **NEW Feature**

Change the type, duration and duration unit of controltimer by sending it a START message with additional data. See the example flow below for examples. All the other functionality (pausing, continuing, resetting) works as well for this.

**FYI:** The override options remain active until controltimer is manually stopped or it finishes itself. If it's later manually started without overriding the options again it will take the type, duration and duration unit from controltimer configuration.

```javascript
{
    payload: 'START',
    timerType: 'delay', // 'delay', 'loop'
    timerDuration: 3000,
    timerDurationUnit: 'millisecond', // 'millisecond', 'second', 'minute', 'hour'
}
```

## Overview

A customizable Node-RED timer node which offers both looping and delay behaviour. The timer can be interacted with by action messages. Timer can be started, reset, stopped, paused and continued. The timer has two outputs - the first one outputs the message when timer is triggered (delay expires or interval is triggered) and the second one outputs the message when the running timer is stopped or paused.

Timer can be reset (timer will restart countdown from beginning) explicitly by the `Reset action` or when `Is consecutive start action timer reset allowed` option is enabled in addition to received `Reset actions` timer will be reset also every time a `Start action` is received. When `Reset timer on receival of unknown message` option is enabled the timer will be reset when it recieves an unknown\* message.

Timer can be paused and later continued. This applies to both looping and delay behaviour. Upon continuing it will count down the remaining duration.

For debugging or just to get an overview of timer progress you can enable `Is running timer progress visible` option. This will show timer progress in percentage of the total duration in the nodes status area.

You can disable specific actions for node. For example disable Reset, Pause and Continue actions. Now when a node recieves any of the aforementioned actions it will treat them as unknown\* messages.

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
        "wires": [["9736dc5641a70ae8"]]
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
        "x": 800,
        "y": 200,
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
        "wires": [["9736dc5641a70ae8"]]
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
        "wires": [["9736dc5641a70ae8"]]
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
        "wires": [["9736dc5641a70ae8"]]
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
        "wires": [["9736dc5641a70ae8"]]
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
        "x": 780,
        "y": 240,
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
        "wires": [["9736dc5641a70ae8"]]
    },
    {
        "id": "9736dc5641a70ae8",
        "type": "controltimer",
        "z": "afd749500f2d393d",
        "name": "",
        "timerType": "loop",
        "timerDurationUnit": "second",
        "timerDurationType": "num",
        "timerDuration": 10,
        "timerLoopTimeoutUnit": "second",
        "timerLoopTimeoutType": "num",
        "timerLoopTimeout": 0,
        "loopTimeoutMessageType": "str",
        "loopTimeoutMessage": "LOOP_TIMEOUT",
        "timerMaxLoopIterationsType": "num",
        "timerMaxLoopIterations": 0,
        "loopMaxIterationsMessageType": "str",
        "loopMaxIterationsMessage": "MAX_LOOP_ITERATIONS",
        "isConsecutiveStartActionTimerResetAllowed": false,
        "isRunningTimerProgressVisible": true,
        "outputReceivedMessageOnTimerTrigger": true,
        "outputReceivedMessageOnTimerHalt": true,
        "startTimerOnReceivalOfUnknownMessage": false,
        "resetTimerOnReceivalOfUnknownMessage": false,
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
        "actionPropertyNameType": "msg",
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
        "x": 560,
        "y": 260,
        "wires": [["1ae1e3ee2f5250a6"], ["5c9aea117d0cb988"]]
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
        "wires": [["9736dc5641a70ae8"]]
    },
    {
        "id": "01f89a1a0cfa1eb2",
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
        "y": 320,
        "wires": [["5468dc68ac582a66"]]
    },
    {
        "id": "5468dc68ac582a66",
        "type": "function",
        "z": "afd749500f2d393d",
        "name": "3000 milliseconds delay",
        "func": "msg.timerType = 'delay';\nmsg.timerDuration = 3000;\nmsg.timerDurationUnit = 'millisecond';\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 290,
        "y": 320,
        "wires": [["9736dc5641a70ae8"]]
    },
    {
        "id": "344b21399d729752",
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
        "y": 360,
        "wires": [["16de63fc875b63b1"]]
    },
    {
        "id": "16de63fc875b63b1",
        "type": "function",
        "z": "afd749500f2d393d",
        "name": "3000 milliseconds loop",
        "func": "msg.timerType = 'loop';\nmsg.timerDuration = '3000';\nmsg.timerDurationUnit = 'millisecond';\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 290,
        "y": 360,
        "wires": [["9736dc5641a70ae8"]]
    }
]
```

</details>

![controltimer example flow](img/example-flow.png?raw=true)

## Installation

Change directory to your node red installation:

    $ npm install --save node-red-contrib-controltimer

## Configuration

| Option                                            | Description                                                                                                                                            | DEFAULT               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `Timer type`                                      | Defines the timer behaviour. Available options are `Delay` and `Loop`.                                                                                 | `Delay`               |
| `Timer duration unit`                             | Defines the timer duration unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`.                                               | `Seconds`             |
| `Timer duration`                                  | Defines the timer duration in specified (`Timer duration unit`) units.                                                                                 | `5`                   |
| `Loop timeout unit`                               | Defines timer loop timeout unit. Available options are `Milliseconds`, `Seconds`, `Minutes` and `Hours`.                                               | `Seconds`             |
| `Loop timeout`                                    | Defines the timer loop timeout in specified (`Loop timeout unit`) units. `0` means no timeout.                                                         | `0`                   |
| `Loop timeout message`                            | Defines message that is emitted via `timer-halted` output upon timeout.                                                                                | `LOOP_TIMEOUT`        |
| `Loop max iterations`                             | Defines timer loop max iterations limit. `0` means no limit.                                                                                           | `0`                   |
| `Loop max iterations message`                     | Defines message that is emitted via `timer-halted` output upon max iterations are reached.                                                             | `MAX_LOOP_ITERATIONS` |
| `Is consecutive start action timer reset allowed` | If `true` it will reset the timer when it receives a `Start action`.                                                                                   | `false`               |
| `Is running timer progress visible`               | If `true` it will display the timer's progress in node's status area as percentages. A good option for debugging long running tasks.                   | `false`               |
| `Output received message on timer trigger`        | If `true` it will emit the message the node received when timer triggers. If `false` it will emit an empty message.                                    | `true`                |
| `Output received message on timer halt`           | If `true` it will emit the message the node received when timer is halted. If `false` it will emit an empty message.                                   | `true`                |
| `Start timer on receival of unknown message`      | If `true` node will start the timer upon receival of unknown\* message                                                                                 | `false`               |
| `Reset timer on receival of unknown message`      | If `true` node will reset the timer upon receival of unknown\* message                                                                                 | `false`               |
| `Is debug mode enabled`                           | If `true` node will log errors into debug console                                                                                                      | `false`               |
| `Timer triggered message`                         | Defines message that is emitted via `timer-triggered` output when timer is triggered and if `Output received message on timer trigger` is not enabled. | `TIMER_TRIGGERED`     |
| `Timer triggered message`                         | Defines message that is emitted via `timer-halted` output when timer is halted and if `Output received message on timer halt` is not enabled.          | `TIMER_HALTED`        |
| `Is start action enabled`                         | If `true` node is permitted to receive Start actions                                                                                                   | `true`                |
| `Is stop action enabled`                          | If `true` node is permitted to receive Stop actions                                                                                                    | `true`                |
| `Is reset action enabled`                         | If `true` node is permitted to receive Reset actions                                                                                                   | `true`                |
| `Is pause action enabled`                         | If `true` node is permitted to receive Pause actions                                                                                                   | `true`                |
| `Is continue action enabled`                      | If `true` node is permitted to receive Continue actions                                                                                                | `true`                |
| `Action property name`                            | Defines the property on a received message on which the action string to interact with timer can be found.                                             | `payload`             |
| `Start action name`                               | Defines the action string that will START the timer.                                                                                                   | `START`               |
| `Stop action name`                                | Defines the action string that will STOP the timer.                                                                                                    | `STOP`                |
| `Reset action name`                               | Defines the action string that will RESET the timer.                                                                                                   | `RESET`               |
| `Pause action name`                               | Defines the action string that will PAUSE the timer.                                                                                                   | `PAUSE`               |
| `Continue action name`                            | Defines the action string that will CONTINUE the paused timer.                                                                                         | `CONTINUE`            |

\*_Unknown message is a message with a payload that's not in the set of defined and enabled action strings. Ex. message with no defined `Action property name` or a message with `Action property name` contents which doesn't match any of the enabled action names. Ex. if Pause action is received but it's disabled in the settings it's regarded as unknown message._

## State diagram

![controltimer state diagram](img/state-diagram.png?raw=true)

<a target="_blank" href="https://icons8.com/icons/set/future">Future icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
