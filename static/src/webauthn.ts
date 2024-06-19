// Import necessary types from WebAuthn API
export type MyPublicKeyCredentialCreationOptions = CredentialCreationOptions & {
  publicKey: {
    challenge: Uint8Array;
    rp: {
      name: string;
    };
    user: {
      id: Uint8Array;
      name: string;
      displayName: string;
    };
    pubKeyCredParams: PublicKeyCredentialParameters[];
    authenticatorSelection: {
      authenticatorAttachment: string;
      userVerification: string;
    };
    timeout: number;
    attestation: string;
  };
};

// Helper function to convert a string to Uint8Array
function strToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Function to create a new credential using WebAuthn API
export async function createCredential() {
  // Define the PublicKeyCredentialCreationOptions
  const publicKeyCredentialCreationOptions: MyPublicKeyCredentialCreationOptions = {
    publicKey: {
      challenge: strToUint8Array("random-challenge-string"),
      rp: {
        name: "Example RP",
      },
      user: {
        id: strToUint8Array("unique-user-id"),
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
      attestation: "direct",
    },
  };

  try {
    const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
    console.log("Credential created:", credential);
  } catch (err) {
    console.error("Error creating credential:", err);
  }
}
