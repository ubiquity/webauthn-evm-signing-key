import { randomBytes } from "ethers";
import { PUBLIC_KEY } from "../utils/strings";

// Function to create a new credential using WebAuthn API
export async function createCredential(
    name = "github-email",
    displayName = "Github Email",
    id = "some-unique-id"
): Promise<Credential | null> {
    const user = createCredentialUser(displayName, name, id)
    const publicKeyCredentialCreationOptions = createCredentialOptions(user);

    try {
        const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
        console.log("Credential created:", credential);
        return credential;
    } catch (err) {
        console.error("Error creating credential:", err);
        return null;
    }
}

function createCredentialOptions(user: PublicKeyCredentialUserEntity, url = "pay.ubq.fi"): CredentialCreationOptions {
    const hostname = new URL(window.location.origin).hostname;
    const NODE_ENV = process.env.NODE_ENV;

    let isCorrectUrl = false;

    if (NODE_ENV === "development") {
        isCorrectUrl = hostname === "localhost";
    } else {
        isCorrectUrl = hostname === url;
    }

    return {
        signal: new AbortSignal(), // TODO: handle this better
        publicKey: {
            /**
             * 'The challenge is a buffer of cryptographically random bytes 
             * generated on the server, and is needed to prevent "replay attacks"'.
             */
            challenge: randomBytes(32),
            user,
            attestation: "none",
            excludeCredentials: [], // exclude previously registered credentials
            timeout: 60000,
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Windows Hello / Touch ID
                userVerification: "required", // Require user verification
            },
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
    };

}

function createCredentialUser(displayName: string, name: string, id: string): PublicKeyCredentialUserEntity {
    return {
        /**
         * 'The authenticator uses the id to associate a credential with the user.
         * It is suggested to not use personally identifying information as the id,
         * as it may be stored in an authenticator'.
        */
        id: strToUint8Array(id),
        name, // github email?
        displayName, // how the key is displayed on the user's device
    }
}
