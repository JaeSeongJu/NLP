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

let bpeCounter = {
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

let pairs = getBiGram(bpeCounter);
console.log(pairs);

let best = [...pairs.entries()].reduce((a, c) => (c[1] > a[1] ? c : a))[0];
console.log(best);

console.log(best.replace(/, /g, ""));

function mergeCounter(pair, counterIn) {
  /*
    bi-gram을 합치는 함수
    Param pair : bi-gram pair
    Param counterIn : 현재 bpe counter
    return : bi-gram이 합쳐진 새로운 counter
   */
  const counterOut = {};
  const bigram = pair.replace(",", "");
  const unigram = pair.replace(/, /g, "");
  console.log(`bigram: ${bigram} => unigram: ${unigram}`);
  for (const word in counterIn) {
    const newWord = word.replace(bigram, unigram);
    console.log(newWord);
    counterOut[newWord] = counterIn[word];
  }
  return counterOut;
}

console.log(mergeCounter(best, bpeCounter));

pairs = getBiGram(bpeCounter);
console.log("pairs : ", pairs);
best = [...pairs.entries()].reduce((a, c) => (c[1] > a[1] ? c : a))[0];
console.log("best : ", best);
bpeCounter = mergeCounter(best, bpeCounter);
console.log("counter : ", bpeCounter);
bpeToId = getVocab(bpeCounter, bpeToId);
console.log("vocab : ", bpeToId);
// 반복시켜주면 된다.
