import { User } from "../types/webauthn";
import { createCredentialOptions, createCredentialUser } from "./create"

/**
 * Request credentials from the authenticator, returning the credential if successful.
 */
export async function requestCredentials(user: User, controller: AbortController): Promise<Credential | null> {
    if (typeof navigator === "undefined") {
        return null;
    }

    const creds = createCredentialOptions(createCredentialUser(user));

    return await navigator.credentials.get({
        mediation: "silent",
        publicKey: creds.publicKey,
        signal: controller.signal,
    });
}