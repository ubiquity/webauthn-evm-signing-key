import * as FingerprintJS from "@fingerprintjs/fingerprintjs";
import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

// Function to get the device fingerprint
async function getDeviceFingerprint(): Promise<string> {
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

// Function to derive a deterministic Ethereum private key
function deriveEthereumPrivateKey(fingerprint: string, userId: string, challenge: string): string {
  const dataToHash = fingerprint + userId + challenge;
  const hash = keccak256(dataToHash);
  // Ensure the hash is 64 characters long for hexZeroPad to pad it correctly
  // @ts-expect-error utils is not recognized by TS
  return ethers.utils.hexZeroPad(`0x${hash}`, 32);
}

// Main function to get the fingerprint and derive the private key
export async function fingerPrinting() {
  try {
    const fingerprint = await getDeviceFingerprint();
    const userId = "deterministic-user-id";
    const challenge = "deterministic-challenge-string";
    const privateKey = deriveEthereumPrivateKey(fingerprint, userId, challenge);
    console.log("Derived Ethereum Private Key:", privateKey);
    document.body.innerHTML = `<h1>Derived Ethereum Private Key: ${privateKey}</h1>`;
  } catch (error) {
    console.error("Error in fingerprinting process:", error);
    document.body.innerHTML = `<h1>Error deriving Ethereum Private Key</h1>`;
  }
}
