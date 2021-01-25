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
sentences.forEach((sentence) => {
  words.push(...sentence.split(" "));
});

//중복 단어 제거
words = [...new Set(words)];
//각 단어별 고유한 번호 부여
let wordToId = { "<PAD>": 0, "<UNK>": 1 }; // 특별 토큰 : PAD는 길이 조정, UNK는 vocab에 없는 단어
wordToId = words.reduce((acc, cur, i) => {
  acc[cur] = i + 2;
  return acc;
}, wordToId);
//각 숫자별 단어 부여
const idToWord = Object.fromEntries(
  Object.entries(wordToId).map((x) => x.reverse())
);

// Data for model training

//학습용 입력 데이터 생성
let trainInputs = [];
const getKeyByValue = (obj, value) =>
  Object.keys(obj).find((key) => obj[key] === value);

sentences.forEach((sentence) => {
  const keys = [];
  [...sentence.split(" ")].forEach((word) => {
    keys.push(parseInt(getKeyByValue(idToWord, word)));
  });
  trainInputs.push(keys);
});
//문장의 길이를 모두 동일하게 변경 (최대길이 4)
trainInputs = trainInputs.map((array) => {
  const length = array.length;
  array.length = 4;
  return array.fill(0, length);
});
//train label은 label을 그대로 사용
let trainLabels = labels;
//train inputs을 2D 텐서로 변환
trainInputs = tf.tensor2d(trainInputs, [2, 4]).print();
//train label 학습용 정답을 2D 텐서로 변환
trainLabels = tf.tensor2d(trainLabels, [1, 2]).print();
