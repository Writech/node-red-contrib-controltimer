import { setup } from 'goober';
import { Node } from 'node-red';
import { render } from 'preact';
import { h } from 'preact';
import React from 'preact/compat';

import { NodeProps } from '../../config.mjs';
import { App } from './components/app/App';

const appRootElement = document.getElementById('controltimer');

if (appRootElement) {
    setup(h);

    window.controltimer = {
        initialize: (node: Node & NodeProps, defaults: NodeProps) => render(<App node={node} defaults={defaults} />, appRootElement),
    };
}
