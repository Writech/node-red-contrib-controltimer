import React from 'preact/compat';
import { useState } from 'preact/hooks';

export default function Counter() {
    const [value, setValue] = useState(0);

    return (
        <>
            <div>Counter: {value}</div>
            <button onClick={() => setValue(value + 1)}>Increment</button>
            <button onClick={() => setValue(value - 1)}>Decrement</button>
        </>
    );
}
