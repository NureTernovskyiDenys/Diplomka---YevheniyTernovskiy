// Tiny base64url JWT signer (HS256-shape, but we don't bother actually signing
// because the mock server never verifies the signature). Compatible with
// `jwt-decode` which only base64-decodes the payload.

const base64UrlEncode = (input: string): string => {
    const b64 = typeof globalThis.btoa === 'function'
        ? globalThis.btoa(input)
        : encodeUtf8ToBase64(input);
    return b64.replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const encodeUtf8ToBase64 = (str: string): string => {
    const bytes = utf8ToBytes(str);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const b1 = bytes[i];
        const b2 = bytes[i + 1] ?? 0;
        const b3 = bytes[i + 2] ?? 0;
        const triplet = (b1 << 16) | (b2 << 8) | b3;
        out += chars[(triplet >> 18) & 0x3f];
        out += chars[(triplet >> 12) & 0x3f];
        out += i + 1 < bytes.length ? chars[(triplet >> 6) & 0x3f] : '=';
        out += i + 2 < bytes.length ? chars[triplet & 0x3f] : '=';
    }
    return out;
};

const utf8ToBytes = (str: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code < 0x80) bytes.push(code);
        else if (code < 0x800) {
            bytes.push(0xc0 | (code >> 6));
            bytes.push(0x80 | (code & 0x3f));
        } else {
            bytes.push(0xe0 | (code >> 12));
            bytes.push(0x80 | ((code >> 6) & 0x3f));
            bytes.push(0x80 | (code & 0x3f));
        }
    }
    return bytes;
};

export interface MockJwtPayload {
    sub: string;
    email: string;
    role: 'user' | 'admin';
}

export const issueMockJwt = (payload: MockJwtPayload, ttlSeconds = 60 * 60 * 24 * 30): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const fullPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    };
    const headerPart = base64UrlEncode(JSON.stringify(header));
    const payloadPart = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = base64UrlEncode(`mock-${payload.sub}-${Date.now()}`);
    return `${headerPart}.${payloadPart}.${signature}`;
};
