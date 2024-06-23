// Helper function to convert a string to Uint8Array
function strToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}