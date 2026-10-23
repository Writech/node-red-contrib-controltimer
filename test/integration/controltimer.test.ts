import assert from 'node:assert/strict';
import type { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import type { Node } from 'node-red';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const helper = require('node-red-node-test-helper');

import { type ControlTimerNodeDef, defaults } from '../../src/node-config';
import { DurationUnit, TIMER_TYPE } from '../../src/timer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const controlTimerNode = require('../../src/controltimer');

describe('src/controltimer.ts', () => {
    beforeEach(async () => {
        await helper.startServer();
    });

    afterEach(async () => {
        mock.timers.reset();
        await helper.unload();
        await helper.stopServer();
    });

    describe('delay', () => {
        it('outputs the received message on output 1 when the timer triggers', async () => {
            const { send, tick, triggered, halted } = await createFlow();

            await send({ payload: 'START', topic: 'greeting' });
            await tick(999);
            assert.equal(triggered.length, 0);

            await tick(1);
            assert.equal(triggered.length, 1);
            assert.equal(triggered[0]?.payload, 'START');
            assert.equal(triggered[0]?.topic, 'greeting');
            assert.equal(halted.length, 0);
        });

        it('outputs the most recently received message, even if it did not change the timer', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START', topic: 'first' });
            await send({ payload: 'ignored', topic: 'second' });
            await tick(1000);

            assert.equal(triggered[0]?.topic, 'second');
        });

        it('outputs a clone, not the same message object, to each trigger', async () => {
            const { send, tick, triggered } = await createFlow({ timerType: TIMER_TYPE.LOOP });

            await send({ payload: 'START' });
            await tick(2000);

            assert.equal(triggered.length, 2);
            assert.notEqual(triggered[0], triggered[1]);
        });

        it('outputs the configured trigger message when not outputting the received message', async () => {
            const { send, tick, triggered } = await createFlow({ outputReceivedMessageOnTimerTrigger: false, timerTriggeredMessage: 'DONE' });

            await send({ payload: 'START', topic: 'ignored' });
            await tick(1000);

            assert.deepEqual(payloads(triggered), ['DONE']);
        });

        it('triggers only once', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 1);
        });
    });

    describe('actions', () => {
        it('STOP cancels the timer and outputs the halted message on output 2', async () => {
            const { send, tick, triggered, halted } = await createFlow();

            await send({ payload: 'START' });
            await tick(500);
            await send({ payload: 'STOP' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
            assert.deepEqual(payloads(halted), ['TIMER_HALTED']);
        });

        it('outputs the received message on halt when configured to', async () => {
            const { send, halted } = await createFlow({ outputReceivedMessageOnTimerHalt: true });

            await send({ payload: 'START' });
            await send({ payload: 'STOP', topic: 'stopping' });

            assert.equal(halted.length, 1);
            assert.equal(halted[0]?.payload, 'STOP');
            assert.equal(halted[0]?.topic, 'stopping');
        });

        it('PAUSE outputs the halted message and CONTINUE resumes with the remaining time', async () => {
            const { send, tick, triggered, halted } = await createFlow();

            await send({ payload: 'START' });
            await tick(400);
            await send({ payload: 'PAUSE' });
            assert.deepEqual(payloads(halted), ['TIMER_HALTED']);

            await tick(10_000);
            assert.equal(triggered.length, 0);

            await send({ payload: 'CONTINUE' });
            await tick(599);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('RESET restarts the full duration of a running timer', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await tick(800);
            await send({ payload: 'RESET' });

            await tick(999);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('RESET on a stopped timer does not start it', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await send({ payload: 'STOP' });
            await send({ payload: 'RESET' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });

        it('START while running is ignored by default', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await tick(500);
            await send({ payload: 'START' });
            await tick(500);

            assert.equal(triggered.length, 1);
        });

        it('START while running resets the timer when configured to', async () => {
            const { send, tick, triggered } = await createFlow({ resetTimerOnReceivalOfStartAction: true });

            await send({ payload: 'START' });
            await tick(500);
            await send({ payload: 'START' });
            await tick(999);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('START while paused continues the timer when configured to', async () => {
            const { send, tick, triggered } = await createFlow({ continueTimerOnReceivalOfStartAction: true });

            await send({ payload: 'START' });
            await tick(400);
            await send({ payload: 'PAUSE' });
            await send({ payload: 'START' });
            await tick(600);

            assert.equal(triggered.length, 1);
        });

        it('START while paused is ignored by default', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await tick(400);
            await send({ payload: 'PAUSE' });
            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });
    });

    describe('disabled actions', () => {
        const cases: [string, Partial<ControlTimerNodeDef>][] = [
            ['STOP', { isStopActionEnabled: false }],
            ['PAUSE', { isPauseActionEnabled: false }],
            ['RESET', { isResetActionEnabled: false }],
        ];

        for (const [action, config] of cases) {
            it(`ignores ${action} when that action is disabled`, async () => {
                const { send, tick, triggered, halted } = await createFlow(config);

                await send({ payload: 'START' });
                await tick(500);
                await send({ payload: action });

                assert.equal(halted.length, 0);
                await tick(500);
                assert.equal(triggered.length, 1);
            });
        }

        it('ignores START when it is disabled', async () => {
            const { send, tick, triggered } = await createFlow({ isStartActionEnabled: false });

            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });

        it('ignores CONTINUE when it is disabled', async () => {
            const { send, tick, triggered } = await createFlow({ isContinueActionEnabled: false });

            await send({ payload: 'START' });
            await send({ payload: 'PAUSE' });
            await send({ payload: 'CONTINUE' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });
    });

    describe('action matching', () => {
        it('reads the action from a custom property', async () => {
            const { send, tick, triggered } = await createFlow({ actionPropertyName: 'command' });

            await send({ command: 'START' });
            await tick(1000);

            assert.equal(triggered.length, 1);
        });

        it('does not read the action from the default property when a custom one is set', async () => {
            const { send, tick, triggered } = await createFlow({ actionPropertyName: 'command' });

            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });

        it('uses custom action names', async () => {
            const { send, tick, triggered, halted } = await createFlow({ startActionName: 'go', stopActionName: 'halt' });

            await send({ payload: 'START' });
            await tick(10_000);
            assert.equal(triggered.length, 0);

            await send({ payload: 'go' });
            await send({ payload: 'halt' });
            assert.equal(halted.length, 1);
        });

        it('matches action names case-sensitively', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'start' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
        });
    });

    describe('unknown messages', () => {
        it('are ignored by default', async () => {
            const { send, tick, triggered, halted } = await createFlow();

            await send({ payload: 'hello' });
            await tick(10_000);

            assert.equal(triggered.length, 0);
            assert.equal(halted.length, 0);
        });

        it('start the timer when configured to', async () => {
            const { send, tick, triggered } = await createFlow({ startTimerOnReceivalOfUnknownMessage: true });

            await send({ payload: 'hello' });
            await tick(1000);

            assert.equal(triggered.length, 1);
            assert.equal(triggered[0]?.payload, 'hello');
        });

        it('reset a running timer when configured to', async () => {
            const { send, tick, triggered } = await createFlow({ resetTimerOnReceivalOfUnknownMessage: true });

            await send({ payload: 'START' });
            await tick(800);
            await send({ payload: 'hello' });

            await tick(999);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('count as unknown when the action is disabled', async () => {
            const { send, tick, triggered } = await createFlow({ isStopActionEnabled: false, startTimerOnReceivalOfUnknownMessage: true });

            await send({ payload: 'STOP' });
            await tick(1000);

            assert.equal(triggered.length, 1);
        });
    });

    describe('overrides', () => {
        it('START with a full override uses the overridden duration and unit', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START', timerType: TIMER_TYPE.DELAY, timerDuration: 3, timerDurationUnit: DurationUnit.SECOND });
            await tick(2999);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('START with a full override can turn a delay into a loop', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START', timerType: TIMER_TYPE.LOOP, timerDuration: 100, timerDurationUnit: DurationUnit.MILLISECOND });
            await tick(350);

            assert.equal(triggered.length, 3);
        });

        it('ignores an incomplete override', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START', timerDuration: 3 });
            await tick(1000);

            assert.equal(triggered.length, 1);
        });

        it('ignores overrides on messages that are not START', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await send({ payload: 'PAUSE', timerType: TIMER_TYPE.DELAY, timerDuration: 3, timerDurationUnit: DurationUnit.SECOND });
            await send({ payload: 'CONTINUE' });
            await tick(1000);

            assert.equal(triggered.length, 1);
        });

        it('START with an override while running restarts the timer with the new duration', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START' });
            await tick(500);
            await send({ payload: 'START', timerType: TIMER_TYPE.DELAY, timerDuration: 3, timerDurationUnit: DurationUnit.SECOND });

            await tick(2999);
            assert.equal(triggered.length, 0);
            await tick(1);
            assert.equal(triggered.length, 1);
        });

        it('rejects START with an invalid override: reports an error and does not start', async () => {
            const { send, tick, triggered, errors } = await createFlow();

            await send({ payload: 'START', timerType: TIMER_TYPE.DELAY, timerDuration: -5, timerDurationUnit: DurationUnit.SECOND });
            await tick(10_000);

            assert.equal(triggered.length, 0);
            assert.equal(errors.length, 1);
            assert.match(errors[0] ?? '', /Invalid timerDuration "-5"/);
        });

        it('keeps a running timer untouched when a later START has an invalid override', async () => {
            const { send, tick, triggered, errors } = await createFlow();

            await send({ payload: 'START' });
            await tick(500);
            await send({ payload: 'START', timerType: 'repeat', timerDuration: 3, timerDurationUnit: DurationUnit.SECOND });
            await tick(500);

            assert.equal(errors.length, 1);
            assert.match(errors[0] ?? '', /Invalid timerType "repeat"/);
            assert.equal(triggered.length, 1);
        });

        it('does not carry an override over to the next run', async () => {
            const { send, tick, triggered } = await createFlow();

            await send({ payload: 'START', timerType: TIMER_TYPE.DELAY, timerDuration: 3, timerDurationUnit: DurationUnit.SECOND });
            await tick(3000);
            await send({ payload: 'START' });
            await tick(1000);

            assert.equal(triggered.length, 2);
        });
    });

    describe('loop', () => {
        it('outputs on every interval', async () => {
            const { send, tick, triggered } = await createFlow({ timerType: TIMER_TYPE.LOOP });

            await send({ payload: 'START' });
            await tick(3000);

            assert.equal(triggered.length, 3);
        });

        it('outputs the max iterations message on output 2 and stops', async () => {
            const { send, tick, triggered, halted } = await createFlow({ timerType: TIMER_TYPE.LOOP, timerMaxLoopIterations: 2 });

            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 2);
            assert.deepEqual(payloads(halted), ['TIMER_HALTED', 'MAX_LOOP_ITERATIONS']);
        });

        it('outputs the loop timeout message on output 2 and stops', async () => {
            const { send, tick, triggered, halted } = await createFlow({
                timerType: TIMER_TYPE.LOOP,
                timerLoopTimeout: 2500,
                timerLoopTimeoutUnit: DurationUnit.MILLISECOND,
            });

            await send({ payload: 'START' });
            await tick(10_000);

            assert.equal(triggered.length, 2);
            assert.deepEqual(payloads(halted), ['TIMER_HALTED', 'LOOP_TIMEOUT']);
        });

        it('uses custom loop messages', async () => {
            const { send, tick, halted } = await createFlow({
                timerType: TIMER_TYPE.LOOP,
                timerMaxLoopIterations: 1,
                loopMaxIterationsMessage: 'ENOUGH',
            });

            await send({ payload: 'START' });
            await tick(1000);

            assert.equal(halted.at(-1)?.payload, 'ENOUGH');
        });

        it('STOP ends the loop', async () => {
            const { send, tick, triggered } = await createFlow({ timerType: TIMER_TYPE.LOOP });

            await send({ payload: 'START' });
            await tick(2000);
            await send({ payload: 'STOP' });
            await tick(10_000);

            assert.equal(triggered.length, 2);
        });
    });

    describe('status', () => {
        it('shows Idle initially and Running while counting down', async () => {
            const { send, statuses } = await createFlow({ isRunningTimerProgressVisible: false });

            await send({ payload: 'START' });

            assert.deepEqual(
                statuses.map((status) => status.text),
                ['Running'],
            );
        });

        it('shows Stopped after STOP, Paused after PAUSE and Idle after finishing', async () => {
            const { send, tick, statuses } = await createFlow({ isRunningTimerProgressVisible: false });

            await send({ payload: 'START' });
            await send({ payload: 'PAUSE' });
            await send({ payload: 'STOP' });
            await tick(10_000);

            assert.deepEqual(
                statuses.map((status) => status.text),
                ['Running', 'Paused', 'Stopped', 'Idle'],
            );
        });

        it('includes the progress while running when enabled', async () => {
            const { send, tick, statuses } = await createFlow({ isRunningTimerProgressVisible: true });

            await send({ payload: 'START' });
            await tick(500);

            assert.equal(statuses.at(-1)?.text, 'Running 50.0% of 1 second(s)');
        });
    });

    describe('close', () => {
        it('cancels the running timer when the node is closed', async () => {
            const { send, tick, triggered, node } = await createFlow({ timerType: TIMER_TYPE.LOOP });

            await send({ payload: 'START' });
            await tick(1000);
            await node.close(false);
            await tick(10_000);

            assert.equal(triggered.length, 1);
        });
    });
});

type Message = Record<string, unknown>;

// The runtime adds a _msgid to every message, so compare payloads rather than whole messages.
const payloads = (messages: Message[]) => messages.map((message) => message.payload);

// Loads the node with a helper node on each output, then fakes timers so tests control time.
// Timers are only faked after the runtime has loaded, because the runtime itself uses them.
async function createFlow(config: Partial<ControlTimerNodeDef> = {}) {
    const flow = [
        { id: 'tab', type: 'tab' },
        {
            ...defaults,
            timerDuration: 1,
            timerDurationUnit: DurationUnit.SECOND,
            isRunningTimerProgressVisible: false,
            ...config,
            id: 'timer',
            z: 'tab',
            type: 'controltimer',
            wires: [['triggered'], ['halted']],
        },
        { id: 'triggered', z: 'tab', type: 'helper' },
        { id: 'halted', z: 'tab', type: 'helper' },
    ];
    await helper.load(controlTimerNode, flow);

    const node: Node = helper.getNode('timer');
    const triggered: Message[] = [];
    const halted: Message[] = [];
    const statuses: { text: string }[] = [];
    const errors: string[] = [];

    (node as unknown as EventEmitter).on('call:error', (call: { args: unknown[] }) => errors.push(String(call.args[0])));

    helper.getNode('triggered').on('input', (message: Message) => triggered.push(message));
    helper.getNode('halted').on('input', (message: Message) => halted.push(message));

    const status = node.status.bind(node);
    node.status = (value) => {
        statuses.push(value as { text: string });
        status(value);
    };
    statuses.length = 0;

    mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });

    // Messages travel between nodes via setImmediate, so let them settle after each step.
    const flush = async () => {
        for (let i = 0; i < 3; i++) {
            await new Promise((resolve) => setImmediate(resolve));
        }
    };

    return {
        node,
        triggered,
        halted,
        statuses,
        errors,
        send: async (message: Message) => {
            node.receive(message);
            await flush();
        },
        tick: async (milliseconds: number) => {
            mock.timers.tick(milliseconds);
            await flush();
        },
    };
}
