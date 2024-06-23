import { createCredentialOptions } from "./create"

/**
 * Request credentials from the authenticator, returning the credential if successful.
 */
export async function requestCredentials(user: PublicKeyCredentialUserEntity): Promise<Credential | null> {
    const creds = createCredentialOptions(user)
    const credentials = await navigator.credentials.get({
        mediation: "conditional",
        publicKey: creds.publicKey,
        signal: new AbortSignal(), // TODO: handle this better
    });

    // TODO: remove logs
    console.log("Credentials received:", credentials);

    return credentials;
}