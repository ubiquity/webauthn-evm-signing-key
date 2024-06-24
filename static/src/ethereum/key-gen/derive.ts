import { keccak256 } from "ethers";
import { strToUint8Array } from "../../utils/shared";

// Function to derive a deterministic Ethereum private key
export function deriveEthereumPrivateKey(userId: string, challenge: string): string {
    const dataToHash = strToUint8Array(userId + challenge);
    const pad32 = new Uint8Array(32);
    dataToHash.set(pad32, dataToHash.length - pad32.length);
    const pk = keccak256(dataToHash)
    console.log("Derived Ethereum Private Key:", pk)
    return pk;
}
