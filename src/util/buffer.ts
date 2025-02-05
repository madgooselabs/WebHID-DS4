export function buf2hex(buffer:ArrayBuffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => '0x'+x.toString(16).padStart(2, '0'))
        .join(', ');
}

export function buf2str(buffer:ArrayBuffer) {
    return [...new Uint8Array(buffer)]
        .map(x => (x < 20 ? '.' : String.fromCharCode(x)))
        .join(' ');
}

export function buf2view(buffer:ArrayBuffer,size:number=16) {
    const bytes = new Uint8Array(buffer);
    const groups: string[] = [];

    for (let i = 0; i < bytes.length; i += size) {
        const chunkBytes = bytes.subarray(i, i + size);

        const hexPart = Array.from(chunkBytes)
            .map(x => '0x' + x.toString(16).padStart(2, '0'))
            .join(' ');

        const asciiPart = Array.from(chunkBytes)
            .map(x => (x >= 32 && x <= 126) ? String.fromCharCode(x) : '.')
            .join('');

        groups.push(`${i.toString(16).padStart(4, '0')}: ${hexPart} - ${asciiPart}`);
    }

    return groups.join('\n');
}