// import { BPETokenizer } from "tokenizers";

// defaultdic in js(참고 : https://aaronmoat.com/implementing-pythons-defaultdict-in-javascript/)
class DefaultMap extends Map {
  constructor(getDefaultValue, ...mapConstructorArgs) {
    super(mapConstructorArgs);

    if (typeof getDefaultValue !== "number") {
      console.log(typeof getDefaultValue);
      throw new Error("getDefaultValue must be a Number");
    }

    this.getDefaultValue = getDefaultValue;
  }

  get = (key) => {
    if (!this.has(key)) {
      this.set(key, this.getDefaultValue);
    }

    return super.get(key);
  };
}

const bpeCounter = {
  "_ l o w": 5,
  "_ l o w e r": 2,
  "_ n e w e s t": 6,
  "_ w i d e s t": 3,
};

let bpeToId = { "[PAD]": 0, "[UNK]": 1 };

function getVocab(counter, vocab) {
  for (const word in counter) {
    const tokens = word.split(" ");
    tokens.forEach((token) => {
      if (!vocab.hasOwnProperty(token)) {
        vocab[token] = Object.keys(bpeToId).length;
      }
    });
  }
  return vocab;
}

bpeToId = getVocab(bpeCounter, bpeToId);
console.log(Object.keys(bpeToId).length, bpeToId);

function getBiGram(counter) {
  /*
    bi-gram 횟수를 구하는 함수
    Param counter : bpe counter
    return : bi-gram 빈도수 map객체
    */
  const pairs = new DefaultMap(0);
  for (const word in counter) {
    const tokens = word.split(" ");
    tokens.every((token, index) => {
      const key = `${token}, ${tokens[index + 1]}`;
      pairs.set(key, pairs.get(key) + counter[word]);
      if (index + 1 == tokens.length - 1) return false;
      else return true;
    });
  }
  return pairs;
}

const pairs = getBiGram(bpeCounter);
console.log(pairs);

// const best = Math.max(pairs, pairs.)
