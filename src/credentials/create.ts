import { randomBytes } from "ethers";
import { PUBLIC_KEY, strToUint8Array } from "../utils/shared";
import { User } from "../types/webauthn";

// Function to create a new credential using WebAuthn API
export async function createCredential(user_: User): Promise<Credential | null> {
    const publicKeyCredentialCreationOptions =
        createCredentialOptions(createCredentialUser(user_));

    try {
        if (typeof navigator === "undefined") {
            return null;
        }
        return await navigator.credentials.create(publicKeyCredentialCreationOptions);
    } catch (err) {
        console.error("Error creating credential:", err);
        return null;
    }
}
/**
 * Creates the options for the credential creation.
 * Expects a PublicKeyCredentialUserEntity and the hostname of the RP.
 */
export function createCredentialOptions(user: PublicKeyCredentialUserEntity, url = "pay.ubq.fi"): CredentialCreationOptions {
    let hostname;

    if (typeof window !== "undefined") {
        hostname = new URL(window.location.origin).hostname;
    }

    const isCorrectUrl = hostname === "localhost" || hostname === url;

    if (!isCorrectUrl) {
        throw new Error("Passkey RP Invalid URL");
    }

    const abortController = new AbortController();

    return {
        signal: abortController.signal, // TODO: handle this better
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

// Returns a typed PublicKeyCredentialUserEntity
export function createCredentialUser(user: User): PublicKeyCredentialUserEntity {
    return {
        /**
         * 'The authenticator uses the id to associate a credential with the user.
         * It is suggested to not use personally identifying information as the id,
         * as it may be stored in an authenticator'.
        */
        id: strToUint8Array(user.id),
        name: user.name, // github email?
        displayName: user.displayName, // how the key is displayed on the user's device
    }
}