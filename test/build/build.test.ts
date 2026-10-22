import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { after, afterEach, before, describe, it } from 'node:test';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const helper = require('node-red-node-test-helper');

const dist = resolve(__dirname, '../../dist');

// Run `npm run compile` first: these tests exercise the built package, not src.
describe('build output (dist/)', () => {
    it('contains every file the Node-RED package.json entry needs', () => {
        for (const file of ['controltimer.js', 'controltimer.html', 'icons/controltimer.png']) {
            assert.ok(existsSync(resolve(dist, file)), `dist/${file} is missing`);
        }
    });

    describe('dist/controltimer.js', () => {
        before(async () => {
            await helper.startServer();
        });
        afterEach(async () => {
            await helper.unload();
        });
        after(async () => {
            await helper.stopServer();
        });

        it('registers a controltimer node that loads without errors', async () => {
            const flow = [{ id: 'n1', type: 'controltimer', z: 'tab', name: 'timer', wires: [[], []] }];
            await helper.load(require(resolve(dist, 'controltimer.js')), flow);

            assert.ok(helper.getNode('n1'));
        });
    });
});
