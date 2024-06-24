import { keccak256 } from "ethers";
import { getUserLocaleWordlist } from "./words";
import dotenv from "dotenv";
import { strToUint8Array } from "../../utils/shared";
import { User } from "../operations";

dotenv.config();

/**
 * Inspired by BIP39, we create a salt that is a combination of an org defined
 * salt and a user specific salt. This salt is used to derive a deterministic
 * Ethereum private key.
 * 
 * This way our single org salt is not a single point of failure, and we can
 * still derive the same private key for a user across multiple devices.
 * 
 * These org salts could be put on rotation/expire, etc, but would require secure 
 * tracking in order to derive the same private key for a user after rotation, but
 * is still likely more secure than a single immutable org salt.
 */
export function createSalt(user: User) {
    const wordlist = getUserLocaleWordlist()
    const wordCount = 6;

    // org defined salt
    const hardcodedSalt = process.env.SALT;
    const saltParts: string[] = [];

    const { displayName, id, name } = user

    if (!hardcodedSalt) throw new Error("Hardcoded salt is required to create a salt");

    if (hardcodedSalt) {
        const saltParts = hardcodedSalt.split("-");
        for (let i = 0; i < wordCount; i++) {
            const index = getWordIndex(saltParts[i % saltParts.length]); // less deterministic but more secure
            const word = wordlist.getWord(index);
            saltParts.push(word);
        }
    }


    const authEntropies = [
        `${displayName}-${id.toString()}-${name}`,
        // ideally this would be something like:
        // `${OAuth.createdAt}-${GitHub.dateJoined}-${Supabase.UUID}}`
        `testing123-ubiquitydao-1234567890`
    ]

    const userSalt = authEntropies.join("-");
    const userSaltArray = trimIndex(userSalt.split("-"))

    for (let i = 0; i < wordCount; i++) {
        const index = getWordIndex(userSaltArray[i]);
        const word = wordlist.getWord(index);
        saltParts.push(word);
    }

    /**
     * We have a 12-word salt that is made up of 6 words from our org salt
     * and 6 from our user specific salt.
     */
    return saltParts.join(" ");
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

/**
 * The algorithm should be work as follows:
 * - If the bits of the user salt parts exceed the max bits, trim the excess bits
 * - It cannot use a pattern of, using the closest word to the max bits, as this
 *   would be easily brute-forced as would dropping the most significant bits.
 * - It should be somewhat random, but deterministic.
 */
function trimIndex(parts: string[]) {
    const hardcodedSalt = process.env.SALT;
    if (!hardcodedSalt) throw new Error("Hardcoded salt is required to trim excess bits");

    for (let i = 0; i < parts.length; i++) {
        // either it already has a word index or it is hashed
        const index = getWordIndex(parts[i])
        if (index > 2047) {
            const orgSalts = hardcodedSalt.split("-");
            // generate a word index from one of the org salts
            const mod = getWordIndex(orgSalts[i % orgSalts.length - 1]);
            let newIndex = index % mod;

            // if the new index is greater than the max bits, trim it
            if (newIndex > 2047) {
                newIndex = newIndex % 2047;
            }

            // trim the word to the new index
            parts[i] = parts[i].slice(0, newIndex);
        }
    }

    return parts;
}