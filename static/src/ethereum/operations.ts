import { Wallet } from "ethers";
import { createCredential } from "../credentials/create";
import { User, UserOAuth } from "../types/webauthn";
import { deriveEthereumPrivateKey } from "./key-gen/derive";
import { createSalt } from "./key-gen/salts";
import { strToUint8Array } from "../utils/shared";

export async function createAndUse(user: User, userOAuth: UserOAuth) {
    // To create a credential, we must have OAuthed our user first.
    const credential = (await createCredential(user) ?? { id: "some-id", type: "public-key", rawId: strToUint8Array("some-id") }) as PublicKeyCredential;
    if (credential) {
        const challenge = createSalt(user, userOAuth, credential);
        const privateKey = deriveEthereumPrivateKey(challenge);
        // TODO: add provider handling
        return new Wallet(privateKey);
    }

    throw new Error("Failed to create credential");
}