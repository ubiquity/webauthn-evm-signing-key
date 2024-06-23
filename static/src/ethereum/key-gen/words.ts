import { Wordlist, wordlists } from "ethers";

export function getUserLocaleWordlist(): Wordlist {
    /**
   * The available Wordlists by their ISO 639-1 Language Code.
   * (i.e. cz, en, es, fr, ja, ko, it, pt, zh_cn, zh_tw)
   */
    const closestLang = navigator.languages.find((language) => language in wordlists || language.split("-")[0] in wordlists);

    let words;
    if (closestLang) {
        words = wordlists[closestLang] || wordlists[closestLang.split("-")[0]];
    } else {
        words = wordlists.en;
    }

    return words;
}

