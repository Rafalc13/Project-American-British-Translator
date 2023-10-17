const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

const reverseDict = (obj) => {
  return Object.assign(
    {},
    ...Object.entries(obj).map(([k, v]) => ({ [v]: k }))
  );
};

class Translator {
  toBritish(text) {
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    const titles = americanToBritishTitles;
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]|([1-9]|1[012])\.[0-5]?[0-9]?|[1-9]:?[0-5]?[0-9]?|10/g;
    const translated = this.translate(text, dict, titles, timeRegex, "toBritish");
    if (!translated) {
      return text;
    }
    return translated;
  }

  toAmerican(text) {
    const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
    const titles = reverseDict(americanToBritishTitles);
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]|([1-9]|1[012])\.[0-5]?[0-9]?|[1-9]:?[0-5]?[0-9]?|10/g;
    const translated = this.translate(text, dict, titles, timeRegex, "toAmerican");
    if (!translated) {
      return text;
    }
    return translated;
  }

  translate(text, dict, titles, timeRegex, locale) {
    const lowerText = text.toLowerCase();
    const matchMap = {};
    Object.entries(titles).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matchMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
      }
    });
    const wordsWithSpace = Object.fromEntries(
      Object.entries(dict).filter(([k, v]) => k.includes(" "))
    );
    Object.entries(wordsWithSpace).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matchMap[k] = v;
      }
    });
    lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
      if (dict[word]) matchMap[word] = dict[word];
    });
    const matchedTimes = lowerText.match(timeRegex);
    if (matchedTimes) {
      matchedTimes.map((e) => {
        if (locale === "toBritish") {
          return matchMap[e] = e.replace(":", ".");
        }
        return matchMap[e] = e.replace(".", ":");
      });
    }
   
    if (Object.keys(matchMap).length === 0) return null;
    console.log("matchMap :>> ", matchMap);
    const translation = this.replaceAll(text, matchMap);
    const translationWithHighlight = this.replaceAllWithHighlight(text,      matchMap
    );

    return [translation, translationWithHighlight];
  }

  replaceAll(text, matchMap) {
    const newRegex = new RegExp(Object.keys(matchMap).join("|"), "gi");
    return text.replace(newRegex, (matched) => matchMap[matched.toLowerCase()]);
  }
  replaceAllWithHighlight(text, matchMap) {
    const newRegex = new RegExp(Object.keys(matchMap).join("|"), "gi");
    return text.replace(newRegex, (matched) => {
      return `<span class="highlight">${
        matchMap[matched.toLowerCase()]
      }</span>`;
    });
  }
}

module.exports = Translator;