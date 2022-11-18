import { Node } from 'node-red';
import React, { useEffect, useRef } from 'preact/compat';
import { useState } from 'preact/hooks';

import { NodeProps } from '../../../../../config.mjs';
import { isNil } from '../../../utils/utils.mjs';
import UiFormLabel from '../form/label/UiFormLabel';
import UiFormRow from '../form/row/UiFormRow';

interface Props {
    label: string;
    value: string | number;
    key: string;
    node: Node & NodeProps;
    defaults: NodeProps;
    types: string[];
}

export default function UiInput({ label, value, key, node, defaults, types }: Props) {
    const id = `input-${label.toLowerCase()}`;
    const typeKey = `${key}Type`;

    const [currentTypeValue, setCurrentTypeValue] = useState(value);
    const [currentValue, setCurrentValue] = useState(value);

    const inputTypeRef = useRef<HTMLInputElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node[typeKey] = currentTypeValue;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node[key] = currentValue;
    }, [currentTypeValue, currentValue]);

    useEffect(() => {
        if (!inputTypeRef.current || !inputRef.current) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node[typeKey] = isNil(node[typeKey]) ? defaults[typeKey] : node[typeKey];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        node[key] = isNil(node[key]) ? defaults[key] : node[key];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputRef.current.typedInput({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type: defaults[typeKey],
            typeField: inputTypeRef.current,
            types,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputRef.current.typedInput('type', node[typeKey]);
    }, [inputTypeRef, inputRef]);

    return (
        <UiFormRow>
            <UiFormLabel label={label} labelFor={id} />

            <input
                type="hidden"
                ref={inputTypeRef}
                value={currentTypeValue}
                onChange={(event) => setCurrentTypeValue(event.currentTarget.value)}
            />

            <input
                id={id}
                type="text"
                placeholder={label}
                style={types ? {} : { width: '300px' }}
                ref={inputRef}
                value={currentValue}
                onChange={(event) => setCurrentValue(event.currentTarget.value)}
            />
        </UiFormRow>
    );
}
