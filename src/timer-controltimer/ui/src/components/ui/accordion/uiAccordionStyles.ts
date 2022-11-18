import { css } from 'goober';

export const accordionClassName = ({ isOpen, maxHeight }: { isOpen: boolean; maxHeight: number | null }) =>
    css({
        backgroundColor: isOpen ? '#ccc' : '#eee',
        color: '#444',
        cursor: 'pointer',
        padding: '5px',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        outline: 'none',
        transition: '0.4s',
        ...(maxHeight !== undefined ? { maxHeight: isOpen ? `${maxHeight}px` : `0px` } : {}),
        '&:hover': {
            backgroundColor: '#ccc',
        },
    });

export const accordionPanelClassName = () =>
    css({
        padding: '5px 5px 0 5px',
        backgroundColor: 'white',
        maxHeight: 0,
        overflow: 'hidden',
        transition: 'max-height 0.2s ease-out',
    });
