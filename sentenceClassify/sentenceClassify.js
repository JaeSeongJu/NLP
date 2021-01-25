import * as tf from "@tensorflow/tfjs";

// Data

//입력 문장
const sentences = ["나는 오늘 너무 행복해", "나는 오늘 슬퍼"];
//출력 정답
const labels = [1, 0];
//정답 obj
const idToLabels = { 0: "부정", 1: "긍정" };

// Vocabulary

//각 문장 띄어쓰기 단위로 분할
let words = [];
sentences.forEach((x) => {
  words.push(...x.split(" "));
});
//중복 단어 제거
words = [...new Set(words)];
//각 단어별 고유한 번호 부여
let wordToId = { "<PAD>": 0, "<UNK>": 1 }; // 특별 토큰 : PAD는 길이 조정, UNK는 vocab에 없는 단어
wordToId = words.reduce((acc, cur, i) => {
  acc[cur] = i + 2;
  return acc;
}, wordToId);
// 각 숫자별 단어 부여
wordToId = Object.fromEntries(Object.entries(wordToId).map((x) => x.reverse()));
