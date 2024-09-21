export function buf2hex(buffer:ArrayBuffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => '0x'+x.toString(16).padStart(2, '0'))
        .join(', ');
}

export function buf2str(buffer:ArrayBuffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => (x < 20 ? '.' : String.fromCharCode(x)))
        .join(' ');
}