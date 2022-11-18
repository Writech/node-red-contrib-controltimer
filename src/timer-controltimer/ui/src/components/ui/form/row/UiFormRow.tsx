import { PropsWithChildren } from 'preact/compat';

import { formRowClassName } from './uiFormRowStyles';

export default function UiFormRow(props: PropsWithChildren) {
    return <div className={`form-row ${formRowClassName}`}>{props.children}</div>;
}
