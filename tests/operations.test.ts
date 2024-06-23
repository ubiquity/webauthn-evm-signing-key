import { HDNodeWallet, JsonRpcProvider, Mnemonic, Wallet } from "ethers";
import { createCredential } from "../static/src/credentials/create";
import { deriveEthereumPrivateKey } from "../static/src/ethereum/key-gen/derive";
import { createSalt } from "../static/src/ethereum/key-gen/salts";
import { generateMnemonic } from "../static/src/ethereum/key-gen/words";
import { ethereumOperations } from "../static/src/ethereum/operations";
import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it } from "@jest/globals";
import { createSafe } from "../static/src/ethereum/safe/create";
import { strToUint8Array } from "../static/src/utils/shared";

describe("ethereumOperations", () => {
    const mockUser = { name: "the intern", id: "long live the DAO, long live the DAO.", displayName: "UbiquityDAO" }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should derive an ethereum private key", async () => {
        const creds = await ethereumOperations(mockUser);
        expect(creds).toHaveProperty("privateKey");
        expect(creds).toHaveProperty("credential");
        if (!creds) return;
        const { privateKey } = creds;

        expect(typeof privateKey).toBe("string");
        expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    });

    it("Should derive the same private key using the same inputs", async () => {
        const creds1 = await ethereumOperations(mockUser);
        const creds2 = await ethereumOperations(mockUser);
        if (!creds1 || !creds2) return;

        const { privateKey: privateKey1 } = creds1;
        const { privateKey: privateKey2 } = creds2;

        expect(privateKey1).toBe(privateKey2);
    })

    it("Should derive different private keys using different inputs", async () => {
        const creds1 = await ethereumOperations(mockUser);
        const creds2 = await ethereumOperations({ displayName: "Ubiquitious", id: "Puttng the 'A' in DAO", name: "UBQ Intern" });
        if (!creds1 || !creds2) return;

        const { privateKey: privateKey1 } = creds1;
        const { privateKey: privateKey2 } = creds2;

        expect(privateKey1).not.toBe(privateKey2);
    })

    it("Should recover to the same private key with a given mnemonic", async () => {
        const creds = await ethereumOperations(mockUser);
        if (!creds) return;
        const { privateKey } = creds;
        const wallet = new Wallet(privateKey);

        const mnemonic = generateMnemonic(privateKey);
        const mnemonic_ = Mnemonic.fromPhrase(mnemonic);
        const wallet_ = new Wallet(mnemonic_.entropy);

        expect(wallet.privateKey).toBe(privateKey);
        expect(wallet_.privateKey).toBe(privateKey);
        expect(mnemonic_.entropy).toBe(privateKey);
        expect(mnemonic_.phrase).toBe(mnemonic);
    });
});