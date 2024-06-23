import { ethers, randomBytes } from "ethers";
// @ts-expect-error - type defs
import { keccak256 } from "js-sha3";

const PUBLIC_KEY = "public-key"

// Helper function to convert a string to Uint8Array
function strToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}


// Function to create a new credential using WebAuthn API
async function createCredential(): Promise<Credential | null> {
  const publicKeyCredentialCreationOptions = createCredentialOptions();

  try {
    const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
    console.log("Credential created:", credential);
    return credential;
  } catch (err) {
    console.error("Error creating credential:", err);
    return null;
  }
}

function createCredentialOptions(): CredentialCreationOptions {
  const hostname = new URL(window.location.origin).hostname;
  const NODE_ENV = process.env.NODE_ENV;

  let isCorrectUrl = false;

  if (NODE_ENV === "development") {
    isCorrectUrl = hostname === "localhost";
  } else {
    isCorrectUrl = hostname === "ubq.pay.fi";
  }

  return {
    publicKey: {
      /**
       * 'The challenge is a buffer of cryptographically random bytes 
       * generated on the server, and is needed to prevent "replay attacks"'.
       */
      challenge: randomBytes(32),
      user: {
        /**
         * 'The authenticator uses the id to associate a credential with the user.
         * It is suggested to not use personally identifying information as the id,
         * as it may be stored in an authenticator'.
         */
        id: strToUint8Array("some-unique-id"),
        name: "", // github email?
        displayName: "", // how the key is displayed on the user's device
      },
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Windows Hello / Touch ID
        userVerification: "required", // Require user verification
      },
      attestation: "none",
      excludeCredentials: [], // exclude previously registered credentials
      timeout: 60000,
      rp: {
        name: "Ubiquity Rewards",
        id: isCorrectUrl ? hostname : "localhost", // 'The id must be a subset of the domain currently in the browser'
      },
      pubKeyCredParams: [
        /**
         * 'The client and authenticator make a best-effort to create a credential
         * of the most preferred type possible. If none of the listed types can be created,
         * the create() operation fails'.
         * 
         * Listed in order of preference.
         */
        {
          type: PUBLIC_KEY,
          alg: -8, // ED25519
        },
        {
          type: PUBLIC_KEY,
          alg: -7, // ES256
        },
        {
          type: PUBLIC_KEY,
          alg: -257, // RS256
        },
      ],
    },
    signal: new AbortSignal(), // TODO: handle this better
  };

}

// Function to derive a deterministic Ethereum private key
function deriveEthereumPrivateKey(userId: string, challenge: string): string {
  const dataToHash = userId + challenge;
  const hash = keccak256(dataToHash);
  return ethers.zeroPadBytes(`0x${hash}`, 32);
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
