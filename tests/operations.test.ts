import { JsonRpcProvider, Mnemonic, Wallet } from "ethers";
import { expect, describe, it } from "@jest/globals";
import { generateMnemonic } from "../src/ethereum/key-gen/words";
import { User, UserOAuth } from "../src/types/webauthn";
import { createSalt } from "../src/ethereum/key-gen/salts";
import { deriveEthereumPrivateKey } from "../src/ethereum/key-gen/derive";
import { PUBLIC_KEY, strToUint8Array } from "../src/utils/shared";

const TEST_STR1 = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
const TEST_STR2 = "4c4b4c4b-4c4b-4c4b-4c4b-4c4b4c4b4c4b"
const ORG_MNEMONIC = "south-tube-human-wise-fashion-village-human-wise-fashion-south-tube-human"
const mockUser = { displayName: "Ubiquity", id: "Long live the DAO.", name: "UBQ Intern" }
const mockUserOAuth = { id: TEST_STR1, ca: new Date().toISOString(), iid: TEST_STR2 }

async function init(user: User, userOAuth: UserOAuth, orgSalts: string) {
    const credential = { id: btoa(TEST_STR1), type: PUBLIC_KEY, rawId: strToUint8Array(TEST_STR1) } as unknown as PublicKeyCredential;
    const entropy = createSalt(user, userOAuth, credential, orgSalts);
    const privateKey = deriveEthereumPrivateKey(entropy);
    const provider = new JsonRpcProvider("http://localhost:8545")
    return new Wallet(privateKey, provider);
}

describe("ethereumOperations", () => {
    beforeAll(() => {
        Object.defineProperty(global, "window", {
            value: {
                location: {
                    origin: "http://localhost:3000",
                    hostname: "localhost"
                }
            }
        });
    });

    it("Should derive an ethereum private key", async () => {
        const wallet = await init(mockUser, mockUserOAuth, ORG_MNEMONIC);
        expect(wallet).toHaveProperty("privateKey");
        if (!wallet) return;
        const { privateKey } = wallet;

        expect(typeof privateKey).toBe("string");
        expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    });

    it("Should derive the same private key using the same inputs", async () => {
        const wallet1 = await init(mockUser, mockUserOAuth, ORG_MNEMONIC);
        const wallet2 = await init(mockUser, mockUserOAuth, ORG_MNEMONIC);
        if (!wallet1 || !wallet2) return;

        const { privateKey: privateKey1 } = wallet1;
        const { privateKey: privateKey2 } = wallet2;

        expect(privateKey1).toBe(privateKey2);
    })

    it("Should derive different private keys using different inputs", async () => {
        const wallet1 = await init(mockUser, mockUserOAuth, ORG_MNEMONIC);
        const wallet2 = await init({ displayName: "Ubiquitious", id: "Puttng the 'A' in DAO", name: "UBQ Intern" }, mockUserOAuth, ORG_MNEMONIC);
        if (!wallet1 || !wallet2) return;

        const { privateKey: privateKey1 } = wallet1;
        const { privateKey: privateKey2 } = wallet2;

        expect(privateKey1).not.toBe(privateKey2);
    })

    it("Should recover to the same private key with a given mnemonic", async () => {
        const wallet = await init(mockUser, mockUserOAuth, ORG_MNEMONIC);
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