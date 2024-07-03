import { Mnemonic, Wallet } from "ethers";
import { generateMnemonic } from "../static/src/ethereum/key-gen/words";
import { createAndUse } from "../static/src/ethereum/operations";
import { expect, describe, beforeAll, beforeEach, afterAll, afterEach, it } from "@jest/globals";

const TEST_STR1 = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
const TEST_STR2 = "4c4b4c4b-4c4b-4c4b-4c4b-4c4b4c4b4c4b"

describe("ethereumOperations", () => {
    const mockUser = { name: "the intern", id: "long live the DAO, long live the DAO.", displayName: "UbiquityDAO" }
    const mockUserOAuth = { id: TEST_STR1, ca: new Date().toISOString(), iid: TEST_STR2 }

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.SALT = "south-tube-human-wise-fashion-village-human-wise-fashion-south-tube-human"
    });

    it("Should derive an ethereum private key", async () => {
        const wallet = await createAndUse(mockUser, mockUserOAuth);
        expect(wallet).toHaveProperty("privateKey");
        if (!wallet) return;
        const { privateKey } = wallet;

        expect(typeof privateKey).toBe("string");
        expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    });

    it("Should derive the same private key using the same inputs", async () => {
        const wallet1 = await createAndUse(mockUser, mockUserOAuth);
        const wallet2 = await createAndUse(mockUser, mockUserOAuth);
        if (!wallet1 || !wallet2) return;

        const { privateKey: privateKey1 } = wallet1;
        const { privateKey: privateKey2 } = wallet2;

        expect(privateKey1).toBe(privateKey2);
    })

    it("Should derive different private keys using different inputs", async () => {
        const wallet1 = await createAndUse(mockUser, mockUserOAuth);
        const wallet2 = await createAndUse({ displayName: "Ubiquitious", id: "Puttng the 'A' in DAO", name: "UBQ Intern" }, mockUserOAuth);
        if (!wallet1 || !wallet2) return;

        const { privateKey: privateKey1 } = wallet1;
        const { privateKey: privateKey2 } = wallet2;

        expect(privateKey1).not.toBe(privateKey2);
    })

    it("Should recover to the same private key with a given mnemonic", async () => {
        const wallet = await createAndUse(mockUser, mockUserOAuth);
        if (!wallet) return;
        const { privateKey } = wallet;

        const mnemonic = generateMnemonic(privateKey);
        if (!mnemonic) return;
        const mnemonic_ = Mnemonic.fromPhrase(mnemonic.phrase);
        const wallet_ = new Wallet(mnemonic_.entropy);

        expect(wallet.privateKey).toBe(privateKey);
        expect(wallet_.privateKey).toBe(privateKey);
        expect(mnemonic_.entropy).toBe(privateKey);
        expect(mnemonic_.phrase).toBe(mnemonic.phrase);
    });
});