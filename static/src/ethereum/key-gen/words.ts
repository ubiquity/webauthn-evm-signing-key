import { BytesLike, Wordlist, wordlists, Mnemonic } from "ethers";

export function getUserLocaleWordlist(): Wordlist {
    /**
   * The available Wordlists by their ISO 639-1 Language Code.
   * (i.e. cz, en, es, fr, ja, ko, it, pt, zh_cn, zh_tw)
   */
    if (typeof navigator === "undefined") {
        return wordlists.en;
    }

    const closestLang = navigator.languages.find((language) => language in wordlists || language.split("-")[0] in wordlists);

    let words;
    if (closestLang) {
        words = wordlists[closestLang] || wordlists[closestLang.split("-")[0]];
    } else {
        words = wordlists.en;
    }

    return words;
}

// Creates a recovery phrase from a private key
export function generateMnemonic(pk: BytesLike) {
    try {
        return Mnemonic.fromEntropy(pk, null, getUserLocaleWordlist());

    } catch (er) {
        console.error(er);
        return null;
    }
}