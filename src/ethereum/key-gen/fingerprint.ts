import * as FingerprintJS from "@fingerprintjs/fingerprintjs";

// Function to get the device fingerprint
export async function getDeviceFingerprint(): Promise<string> {
    try {
        // Initialize an agent at application startup.
        const fpPromise = FingerprintJS.load();

        // Get the visitor identifier when you need it.
        const fp = await fpPromise;
        const result = await fp.get();

        // The visitor identifier:
        return result.visitorId;
    } catch (error) {
        console.error("Error getting device fingerprint:", error);
        throw new Error("Failed to get device fingerprint.");
    }
}