import { SafeAccountConfig, SafeDeploymentConfig, SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { ethers } from "ethers";
import { createSalt } from "../key-gen/salts";
import { deriveEthereumPrivateKey } from "../key-gen/derive";
import { createCredential } from "../../credentials/create";
import { strToUint8Array } from "../../utils/shared";

const safeDeploymentConfig: SafeDeploymentConfig = {
    // @ts-expect-error - safeVersion does not exist in SafeDeploymentConfig
    safeVersion: "1.4.1", // Updated to the latest version
    saltNonce: "0", // Change if necessary
};

async function getProvider() {
    // TODO: use rpc-handler
    const provider = new ethers.JsonRpcProvider("https://rpc.gnosischain.com");
    return provider;
}

async function createSafeSetup(user: PublicKeyCredentialUserEntity) {
    const provider = await getProvider();
    const challenge = createSalt(user);
    const creds = await createCredential();
    const privateKey = deriveEthereumPrivateKey(`${user.name}-${user.id}-${creds?.id}`, challenge)
    const signer = new ethers.Wallet(privateKey, provider);

    // Initialize EthersAdapter
    const ethAdapter = new EthersAdapter({
        // @ts-expect-error - This wants ethers V5
        ethers,
        signer,
    });

    // Define the owners and threshold for the Safe
    const safeAccountConfig: SafeAccountConfig = {
        owners: [signer.address],
        threshold: 1,
    };

    return { ethAdapter, safeAccountConfig };
}

export async function createSafe(user = {
    name: "github-email",
    displayName: "Github Email",
    id: strToUint8Array("some-unique-id")
}) {
    const { ethAdapter, safeAccountConfig } = await createSafeSetup(user);

    // Create a SafeFactory instance
    const safeFactory = await SafeFactory.create({ ethAdapter });
    const safeAddr = safeFactory.predictSafeAddress({ safeAccountConfig, safeDeploymentConfig });
    console.log("Predicted Safe address:", safeAddr);
    return {
        safeFactory,
        safeAccountConfig,
    }
}

export async function deploySafe(
    user = {
        name: "github-email",
        displayName: "Github Email",
        id: strToUint8Array("some-unique-id")
    }
) {
    const { safeFactory, safeAccountConfig } = await createSafe(user);
    const safe = await safeFactory.deploySafe({ safeAccountConfig, safeDeploymentConfig });
    console.log("Safe deployed at:", safe.getAddress());
    return safe;
}

createSafe().catch((error) => {
    console.error("Error deploying Safe:", error);
});
