import React, { PropsWithChildren, useRef } from 'preact/compat';
import { useState } from 'preact/hooks';

import { accordionClassName, accordionPanelClassName } from './uiAccordionStyles';

interface Props extends PropsWithChildren {
    name: string;
}

export default function UiAccordion(props: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const accordionPanelRef = useRef<HTMLDivElement | null>(null);

    return (
        <>
            <button
                className={accordionClassName({ isOpen, maxHeight: accordionPanelRef.current?.scrollHeight ?? null })}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="fa fa-cog"></i> {props.name} <span className="status">{isOpen ? '(Click to hide)' : '(Click to show)'}</span>
            </button>

            <div className={accordionPanelClassName()} ref={accordionPanelRef}>
                {props.children}
            </div>
        </>
    );
}
