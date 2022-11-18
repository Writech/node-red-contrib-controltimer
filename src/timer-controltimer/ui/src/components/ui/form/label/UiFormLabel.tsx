import React from 'preact/compat';

import { formLabelClassName, formLabelIconClassName } from './uiFormLabelStyles';

interface Props {
    label: string;
    labelFor: string;
}

export default function UiFormLabel({ label, labelFor }: Props) {
    return (
        <label htmlFor={labelFor} className={formLabelClassName()}>
            <i className={`fa fa-tag ${formLabelIconClassName()}`}></i> ${label}
        </label>
    );
}
