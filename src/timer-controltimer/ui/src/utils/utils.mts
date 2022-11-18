export function c(...args: (string | undefined | false)[]) {
    let out = '';
    for (let i = 0; i < args.length; i++) {
        const x = args[i];
        if (x) {
            if (out) out += ' ';
            out += x;
        }
    }
    return out;
}

export function isNil(value: unknown) {
    return value === null || value === undefined;
}
