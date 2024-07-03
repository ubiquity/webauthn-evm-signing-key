import { keccak256 } from "ethers";
import { strToUint8Array } from "../../utils/shared";

// Function to derive a deterministic Ethereum private key
export function deriveEthereumPrivateKey(challenge: string): string {
    const dataToHash = strToUint8Array(challenge);
    const pad32 = new Uint8Array(32);
    dataToHash.set(pad32, dataToHash.length - pad32.length);
    return keccak256(dataToHash);
}
