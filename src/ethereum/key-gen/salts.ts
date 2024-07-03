import { keccak256 } from "ethers";
import { getUserLocaleWordlist } from "./words";
import { strToUint8Array } from "../../utils/shared";
import { User, UserOAuth } from "../../types/webauthn";

/**
 * Inspired by BIP39, we create a salt that is a combination of an org defined
 * salt and a user specific salt. This salt is used to derive a deterministic
 * Ethereum private key.
 * 
 * Creates a salt for a user based on the org salt and user specific data.
 * Requires the user has been OAuthed, and the user has a PublicKeyCredential.
 */

export function createSalt(user: User, userOauth: UserOAuth, cred: PublicKeyCredential) {
    const wordlist = getUserLocaleWordlist()
    const wordCount = 12;

    const saltParts: string[] = [];
    const { displayName, id, name } = user

    const orgSaltIndexes = idToIndexes(userOauth.id);

    const authEntropies = [
        `${displayName}-${id.toString()}-${name}`,
        `${userOauth.id}-${userOauth.ca}-${userOauth.iid}`,
        `${cred.id}-${cred.type}-${cred.rawId}`,
        `${wordlist.getWord(orgSaltIndexes[0])}-${wordlist.getWord(orgSaltIndexes[1])}-${wordlist.getWord(orgSaltIndexes[2])}`
    ]

    const userSalt = authEntropies.join("-");
    const userSaltArray = userSalt.split("-");

    for (let i = 0; i < wordCount; i++) {
        const index = getWordIndex(userSaltArray[i]);
        const word = wordlist.getWord(index);
        saltParts.push(word);
    }

    /**
     * We have a 12-word salt that is made up of 3 words from our org data
     * and 9 from our user specific data
     */
    return saltParts.join(" ")
}

// Maps a word to its corresponding 11-bit value.
function getWordIndex(word: string) {
    // try to obtain a wordlist based on the user's locale
    const wordlist = getUserLocaleWordlist();
    let index = wordlist.getWordIndex(word);
    if (index === -1) {
        // If the word is not in the wordlist, we hash it to get a number
        // between 0 and 2047.
        const bytes = strToUint8Array(word)
        const hash = keccak256(bytes);
        index = parseInt(hash.slice(2, 5), 16);
    }

    if (index > 2047) {
        index = index % 2047;
    }

    return index;
}

// takes a UUID and converts it to deterministic index range
function idToIndexes(id: string): number[] {
    const partsToReturn = [];
    const idParts = id.split("-");
    const hardcodedSalt = process.env.SALT;
    if (!hardcodedSalt) throw new Error("Hardcoded salt is required to create a salt");
    const orgSalts = hardcodedSalt.split("-");

    // returns three words from the org mnemonic and will be appended to the user salt
    for (let i = 0; i < 3; i++) {
        const index = parseInt(keccak256(strToUint8Array(idParts[i])).slice(2, 5), 16); // convert the UUID part to a number
        const mod = getWordIndex(orgSalts[i]); // get a word index from the org salt
        const newIndex = index % mod; // get a new index from the UUID part and the org salt
        partsToReturn.push(newIndex); // add the new index to the parts to return
    }

    return partsToReturn;
}