export const PUBLIC_KEY = "public-key"

// Helper function to convert a string to Uint8Array
export function strToUint8Array(str: string | ArrayBuffer | BufferSource): Uint8Array {
    if (typeof str === "string") {
        return new TextEncoder().encode(str)
    } else {
        throw new Error(`A new credential ID must be a string - received ${typeof str} instead: ${str}`)
    }
}