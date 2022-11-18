import { css } from 'goober';

export const formLabelClassName = () =>
    css({
        display: 'flex !important',
        width: 'auto !important',
        flexShrink: 0,
        flexGrow: 1,
        marginBottom: 0,
    });

export const formLabelIconClassName = () =>
    css({
        marginRight: '4px',
    });
