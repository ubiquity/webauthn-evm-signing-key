import { getUserLocaleWordlist } from "./words";

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
export function createSalt(user: PublicKeyCredentialUserEntity) {
    const wordlist = getUserLocaleWordlist()
    const wordCount = 6;

    // org defined salt
    const hardcodedSalt = process.env.SALT;
    const saltParts = [];

    const { displayName, id, name } = user

    if (hardcodedSalt) {
        // assuming a mnemonic-like salt
        const saltParts = hardcodedSalt.split("-");
        for (let i = 0; i < wordCount; i++) {
            // transform our word into a number
            const index = parseInt(saltParts[i], 16);
            // get the word from the wordlist
            const word = wordlist.getWord(index);
            // add the word to our salt
            saltParts.push(word);
        }
    }

    // TODO: improve through multiple sources of entropy
    const userSalt = `${displayName}-${id}-${name}`;
    const userSaltArray = userSalt.split("-");

    for (let i = 0; i < wordCount; i++) {
        const index = parseInt(userSaltArray[i], 16);
        const word = wordlist.getWord(index);
        saltParts.push(word);
    }

    /**
     * We have a 12-word salt that is made up of 6 words from our org salt
     * and 6 from our user specific salt.
     */
    return saltParts.join(" ");
}