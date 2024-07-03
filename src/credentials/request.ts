import { User } from "../types/webauthn";
import { createCredentialOptions, createCredentialUser } from "./create"

/**
 * Request credentials from the authenticator, returning the credential if successful.
 */
export async function requestCredentials(user: User, controller: AbortController): Promise<Credential | null> {
    const creds = createCredentialOptions(createCredentialUser(user));
    return await navigator.credentials.get({
        mediation: "conditional",
        publicKey: creds.publicKey,
        signal: controller.signal,
    });

}