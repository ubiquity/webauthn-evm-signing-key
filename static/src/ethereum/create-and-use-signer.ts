import { JsonRpcProvider, JsonRpcSigner, Wallet } from "ethers";
import { createCredential } from "../credentials/create";
import { User, UserOAuth } from "../types/webauthn";
import { deriveEthereumPrivateKey } from "./key-gen/derive";
import { createSalt } from "./key-gen/salts";
import { requestCredentials } from "../credentials/request";

export async function createAndUseWallet(user: User, userOAuth: UserOAuth) {
    const controller = new AbortController();

    // backout after 20 seconds
    const timeout = setTimeout(() => {
        controller.abort();
        console.log(`Passkey request timed out after 20 seconds.`)
    }, 20000);

    let credential: PublicKeyCredential | null = null;

    try {
        console.log("Requesting WebAuthn passkey...")
        credential = await requestCredentials(user, controller) as PublicKeyCredential;
    } catch (err) {
        console.error("Error requesting passkey:", err);
    } finally {
        clearTimeout(timeout);
    }

    // if we don't have a cred by this point we should create one
    if (!credential) {
        credential = await createCredential(user) as PublicKeyCredential;
    }

    // this should never be null
    if (credential) {
        // create a deterministic private key from the user's data
        const entropy = createSalt(user, userOAuth, credential);
        const privateKey = deriveEthereumPrivateKey(entropy);
        const provider = new JsonRpcProvider("http://localhost:8545")
        return new Wallet(privateKey, provider);
        // const wallet = new Wallet(privateKey, provider);
        // TODO: see if this works without exposing a full wallet
        // return new JsonRpcSigner(provider, wallet.address); 

    }

    throw new Error("Failed to create credential");
}

/**
 * Nodes have their own private keys, but are derived from the parent wallet.
 * 
 * These could be useful but not fully thought out
async function getWalletChildNode(wallet: Wallet, index: number) {
    if (wallet instanceof HDNodeWallet) {
        return wallet.derivePath(`m/44'/60'/0'/0/${index}`);
    }

    throw new Error("Wallet is not an HDNodeWallet");
}
async function getChildNodeParent(wallet: Wallet) {
    if (wallet instanceof HDNodeWallet) {
        return wallet.parentFingerprint;
    }

    throw new Error("Wallet is not an HDNodeWallet");
}
*/
