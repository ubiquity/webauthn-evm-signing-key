import { SafeAccountConfig, SafeDeploymentConfig, SafeFactory } from "@gnosis.pm/safe-core-sdk";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { ethers } from "ethers";

async function deploySafe() {
  // Initialize provider
  const provider = new ethers.JsonRpcProvider("https://rpc.gnosischain.com");

  // Replace with your derived private key
  const privateKey = "YOUR_DERIVED_PRIVATE_KEY";
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

  // Define deployment configuration
  const safeDeploymentConfig: SafeDeploymentConfig = {
    // @ts-expect-error - safeVersion does not exist in SafeDeploymentConfig
    safeVersion: "1.4.1", // Updated to the latest version
    saltNonce: "0", // Change if necessary
  };

  // Create a SafeFactory instance
  const safeFactory = await SafeFactory.create({ ethAdapter });

  // Deploy the Safe
  const safe = await safeFactory.deploySafe({ safeAccountConfig, safeDeploymentConfig });
  console.log("Safe deployed at:", safe.getAddress());
}

deploySafe().catch((error) => {
  console.error("Error deploying Safe:", error);
});
