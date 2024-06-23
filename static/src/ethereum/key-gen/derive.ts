import { ethers, keccak256 } from "ethers";

// Function to derive a deterministic Ethereum private key
export function deriveEthereumPrivateKey(userId: string, challenge: string): string {
    const dataToHash = userId + challenge;
    const hash = keccak256(dataToHash);
    return ethers.zeroPadBytes(`0x${hash}`, 32);
}
