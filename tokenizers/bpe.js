// import { BPETokenizer } from "tokenizers";

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
