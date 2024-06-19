import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

// Helper function to convert a string to Uint8Array
function strToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Function to create a new credential using WebAuthn API
async function createCredential(): Promise<PublicKeyCredential | null> {
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    publicKey: {
      challenge: strToUint8Array("deterministic-challenge-string"), // Use a deterministic challenge
      rp: {
        name: "Example RP",
      },
      user: {
        id: strToUint8Array("deterministic-user-id"), // Use a deterministic user ID
        name: "username",
        displayName: "User Name",
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7, // ES256 algorithm
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "none", // Attestation is not needed for this use case
    },
  };

  try {
    const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
    console.log("Credential created:", credential);
    return credential;
  } catch (err) {
    console.error("Error creating credential:", err);
    return null;
  }
}

// Function to derive a deterministic Ethereum private key
function deriveEthereumPrivateKey(userId: string, challenge: string): string {
  const dataToHash = userId + challenge;
  const hash = keccak256(dataToHash);
  return ethers.utils.hexZeroPad(`0x${hash}`, 32);
}

// Main function to create a credential and derive the private key
export async function ethereumOperations() {
  const credential = await createCredential();
  if (credential) {
    const userId = "deterministic-user-id";
    const challenge = "deterministic-challenge-string";
    const privateKey = deriveEthereumPrivateKey(userId, challenge);
    console.log("Derived Ethereum Private Key:", privateKey);
    return credential;
  }
}
