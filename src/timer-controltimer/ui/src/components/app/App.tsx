import { extractCss } from 'goober';
import { Node } from 'node-red';
import React from 'preact/compat';

import { NodeProps } from '../../../../config.mjs';
import Editor from '../editor/Editor';

interface Props {
    node: Node & NodeProps;
    defaults: NodeProps;
}

export function App({ node, defaults }: Props) {
    return (
        <>
            <Editor node={node} defaults={defaults} />
            <style id="_goober">{extractCss()}</style>
        </>
    );
}
