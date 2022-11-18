import { Node } from 'node-red';

import { NodeProps } from '../../config.mjs';

export {};

declare global {
    interface Window {
        controltimer: {
            initialize: (node: Node & NodeProps, defaults: NodeProps) => void;
        };
    }
}
