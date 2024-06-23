import { createCredential } from "../credentials/create";
import { deriveEthereumPrivateKey } from "./key-gen/derive";
import { createSalt } from "./key-gen/salts";

// Main function to create a credential and derive the private key
export async function ethereumOperations(user: PublicKeyCredentialUserEntity) {
    const credential = await createCredential();
    if (credential) {
        const { id } = credential;
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

        // const challenge = "deterministic-challenge-string";

        const challenge = createSalt(user);
        const privateKey = deriveEthereumPrivateKey(userId, challenge);
        console.log("Derived Ethereum Private Key:", privateKey);
        return credential;
    }
}
