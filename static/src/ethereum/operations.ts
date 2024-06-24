import { createCredential } from "../credentials/create";
import { strToUint8Array } from "../utils/shared";
import { deriveEthereumPrivateKey } from "./key-gen/derive";
import { createSalt } from "./key-gen/salts";

export type User = {
    displayName: string;
    name: string;
    id: string | BufferSource;
}

// Main function to create a credential and derive the private key
export async function ethereumOperations(user: User) {
    const credential = await createCredential(user) ?? { id: strToUint8Array("some-id") };
    if (credential) {
        const { id } = credential;
        user.id = id as BufferSource;
        const userId = `${user.name}-${user.id}-${id}`;
        /**
         * This string needs to be securely generated because the public ID of the
         * credential is leakable as is GitHub associated info such as 
         * username, email, id, etc.
         * 
         * "in another future SAFE management UI that we build, we can:
         * ...
         * 2. we can have a "sign in with github" button which will automatically
         * deploy a SAFE if there is none associated, or identify the SAFE if there is one associated."
         * 
         * With the above in mind, we can extrapolate unique identifiers from three sources:
         * 1. GitHub
         * 2. Auth Provider (OAuth, etc.)
         * 3. Supabase
         * 
         * This string should not be easily brute-forced and should have a
         * high degree of entropy and fault tolerance.
         */

        const challenge = createSalt(user);
        const privateKey = deriveEthereumPrivateKey(userId, challenge);
        console.log("Derived Ethereum Private Key:", privateKey);
        return {
            privateKey,
            credential
        }
    }
}