import { Node } from 'node-red';
import React, { useEffect } from 'preact/compat';
import { useState } from 'preact/hooks';

import { NodeProps } from '../../../../../config.mjs';
import UiFormLabel from '../form/label/UiFormLabel';
import UiFormRow from '../form/row/UiFormRow';

interface Props {
    label: string;
    value: string | number;
    key: string;
    node: Node & NodeProps;
    defaults: NodeProps;
    options: string[];
}

export default function UiSelect({ label, value, key, node, defaults, options }: Props) {
    const [currentValue, setCurrentValue] = useState(value);
    const id = `input-${label.toLowerCase()}`;

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node[key] = currentValue;
    }, [currentValue]);

    return (
        <UiFormRow>
            <UiFormLabel label={label} labelFor={id} />

            <select id={id} onChange={(event) => setCurrentValue(event.currentTarget.value)}>
                {options.map((option, index) => (
                    <option key={index} value={option} selected={currentValue === option}>
                        {option}
                    </option>
                ))}
            </select>
        </UiFormRow>
    );
}
