import * as tf from "@tensorflow/tfjs";
import { logSigmoid } from "@tensorflow/tfjs";

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
trainInputs = tf.tensor2d(trainInputs, [2, 4]);
//train label 학습용 정답을 2D 텐서로 변환
trainLabels = tf.tensor1d(trainLabels);

// Modelling

//입력 단어를 vector로 변환
const embedding = tf.layers.embedding({
  inputDim: Object.keys(wordToId).length,
  outputDim: 8,
});
const hidden = embedding.apply(trainInputs);
hidden.print();
//각 단어 벡터의 최대값 기준으로 벡터를 더해서 차원을 줄여줌 (문장 vector 생성)
const pool = tf.layers.globalMaxPool1d();
const hiddenPool = pool.apply(hidden);
hiddenPool.print();
//문장 vector를 이용해서 긍정(1), 부정(0) 확률값 예측
const linear = tf.layers.dense({ units: 2, activation: "softmax" });
const outputs = linear.apply(hiddenPool);
outputs.print();
//모델 만들기
const buildModel = (numVocab, denseModel, numSeq, numOutput) => {
  /* 
  numVocab : vocabulary 단어 수
  denseModel : 단어 의미하는 벡터 차원 수
  numSeq : 문장길이
  numOutput : 예측할 class 개수
  */
  const inputs = tf.input({ shape: [numSeq] });

  const embedding = tf.layers.embedding({
    inputDim: numVocab,
    outputDim: denseModel,
  });
  const hidden = embedding.apply(inputs);
  const pool = tf.layers.globalMaxPool1d();
  const hiddenPool = pool.apply(hidden);
  const linear = tf.layers.dense({ units: numOutput, activation: "softmax" });
  const outputs = linear.apply(hiddenPool);

  const model = tf.model({ inputs, outputs });
  return model;
};
//모델 생성
const model = buildModel(Object.keys(wordToId).length, 8, 4, 2);

//학습
//모델 loss, optimizer, metric 정의
model.compile({
  optimizer: "adam",
  loss: "sparseCategoricalCrossentropy",
  metrics: ["acc"],
});
//모델 학습
const history = await model.fit(trainInputs, trainLabels, {
  batchSize: 16,
  epochs: 20,
  callbacks: {
    onEpochEnd: (epoch, logs) =>
      console.log(
        "Loss after Epoch " +
          epoch +
          " loss : " +
          logs.loss +
          " accuracy : " +
          logs.acc
      ),
  },
});

// 평가

//모델 평가
// model.evaluate(trainInputs, trainLabels).print();

// 예측

//추론입력
const input = "나는 너무 슬퍼";
//입력을 숫자로 변경
let inferInput = input.split(" ").map((word) => {
  return parseInt(getKeyByValue(idToWord, word));
});
//문장의 길이를 모두 동일하게 변경 (최대길이 4)
const inputLength = inferInput.length;
inferInput.length = 4;
inferInput.fill(0, inputLength);
//2D 텐서로 변환 (batch size 1 추가)
inferInput = tf.tensor2d(inferInput, [1, 4]);
//긍정,부정 추론
const prediction = model.predict(inferInput);
//확률의 max 값을 추론 값으로 결정
const lastPrediction = prediction.argMax(1);
//각 예측 값에 대한 label string
const val = lastPrediction.arraySync()[0];
console.log(`${val} : ${idToLabels[val]}`);
