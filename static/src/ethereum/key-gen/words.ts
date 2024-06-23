import { BytesLike, Wordlist, wordlists } from "ethers";
import { entropyToMnemonic, isValidMnemonic } from "@ethersproject/hdnode";

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
export function generateMnemonic(pk: BytesLike, wordlist?: Wordlist) {
    const mnemonic = entropyToMnemonic(pk, wordlist || getUserLocaleWordlist());

    if (isValidMnemonic(mnemonic)) {
        return mnemonic;
    } else {
        throw new Error("Invalid mnemonic generated");
    }
}