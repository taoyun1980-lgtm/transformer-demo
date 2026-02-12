// Transformer 核心计算引擎 - 用真实数据演示每一步

// 示例输入："我 爱 人工智能"（3个token）
export const EXAMPLE_SENTENCE = '我 爱 人工智能';
export const TOKENS = ['我', '爱', '人工智能'];
export const TOKEN_IDS = [2769, 4263, 8901]; // 模拟 token ID
export const VOCAB_SIZE = 10000;
export const D_MODEL = 8; // 缩小维度便于展示（实际是 512/768）
export const N_HEADS = 2;
export const D_K = D_MODEL / N_HEADS; // 每个头的维度 = 4
export const SEQ_LEN = TOKENS.length;

// ========== 1. Token Embedding ==========
// 模拟的嵌入矩阵（3 × 8）
export const TOKEN_EMBEDDINGS: number[][] = [
  [0.12, -0.34, 0.56, 0.78, -0.23, 0.45, -0.67, 0.89],  // "我"
  [0.45, 0.23, -0.12, 0.67, 0.34, -0.56, 0.78, -0.45],   // "爱"
  [-0.23, 0.78, 0.34, -0.56, 0.89, 0.12, -0.45, 0.67],   // "人工智能"
];

// ========== 2. Positional Encoding ==========
export function computePositionalEncoding(seqLen: number, dModel: number): number[][] {
  const pe: number[][] = [];
  for (let pos = 0; pos < seqLen; pos++) {
    const row: number[] = [];
    for (let i = 0; i < dModel; i++) {
      if (i % 2 === 0) {
        row.push(parseFloat(Math.sin(pos / Math.pow(10000, i / dModel)).toFixed(4)));
      } else {
        row.push(parseFloat(Math.cos(pos / Math.pow(10000, (i - 1) / dModel)).toFixed(4)));
      }
    }
    pe.push(row);
  }
  return pe;
}

export const POSITIONAL_ENCODING = computePositionalEncoding(SEQ_LEN, D_MODEL);

// 嵌入 + 位置编码
export function addMatrices(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((v, j) => parseFloat((v + b[i][j]).toFixed(4))));
}

export const EMBEDDED_INPUT = addMatrices(TOKEN_EMBEDDINGS, POSITIONAL_ENCODING);

// ========== 3. Self-Attention ==========
// Q, K, V 权重矩阵（8 × 8）
export const W_Q: number[][] = [
  [0.1, 0.2, -0.1, 0.3, 0.0, 0.1, -0.2, 0.1],
  [-0.2, 0.1, 0.3, -0.1, 0.2, 0.0, 0.1, -0.1],
  [0.3, -0.1, 0.2, 0.1, -0.1, 0.3, 0.0, 0.2],
  [0.0, 0.3, -0.2, 0.2, 0.1, -0.1, 0.3, 0.0],
  [-0.1, 0.0, 0.1, -0.2, 0.3, 0.2, -0.1, 0.3],
  [0.2, -0.2, 0.0, 0.1, -0.1, 0.1, 0.2, -0.2],
  [0.1, 0.1, -0.3, 0.0, 0.2, -0.2, 0.1, 0.1],
  [-0.1, 0.2, 0.1, -0.1, 0.0, 0.3, -0.1, 0.2],
];

export const W_K: number[][] = [
  [0.2, -0.1, 0.1, 0.0, 0.3, -0.2, 0.1, 0.2],
  [0.0, 0.3, -0.2, 0.2, -0.1, 0.1, 0.0, -0.1],
  [-0.1, 0.1, 0.3, -0.1, 0.2, 0.0, 0.3, 0.1],
  [0.3, 0.0, -0.1, 0.3, 0.0, 0.2, -0.2, 0.3],
  [0.1, -0.2, 0.2, 0.1, -0.1, 0.3, 0.1, 0.0],
  [-0.2, 0.2, 0.0, -0.2, 0.1, -0.1, 0.2, -0.2],
  [0.0, 0.1, -0.1, 0.2, 0.2, 0.0, -0.1, 0.1],
  [0.1, -0.1, 0.2, 0.0, -0.2, 0.1, 0.0, 0.2],
];

export const W_V: number[][] = [
  [-0.1, 0.2, 0.0, 0.1, -0.2, 0.3, 0.1, 0.0],
  [0.2, 0.0, -0.1, 0.3, 0.1, -0.1, 0.0, 0.2],
  [0.1, -0.2, 0.3, 0.0, 0.2, 0.1, -0.1, 0.3],
  [0.0, 0.1, -0.2, 0.2, 0.3, 0.0, 0.2, -0.1],
  [0.3, 0.0, 0.1, -0.1, 0.0, 0.2, -0.2, 0.1],
  [-0.1, 0.3, 0.2, 0.0, -0.1, 0.1, 0.3, 0.0],
  [0.2, -0.1, 0.0, 0.1, 0.1, -0.2, 0.0, 0.3],
  [0.0, 0.2, -0.1, 0.2, -0.1, 0.0, 0.1, -0.2],
];

// 矩阵乘法
export function matmul(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const result: number[][] = [];
  for (let i = 0; i < rows; i++) {
    result[i] = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = parseFloat(sum.toFixed(4));
    }
  }
  return result;
}

// 计算 Q, K, V
export const Q = matmul(EMBEDDED_INPUT, W_Q);
export const K = matmul(EMBEDDED_INPUT, W_K);
export const V = matmul(EMBEDDED_INPUT, W_V);

// 转置
function transpose(m: number[][]): number[][] {
  return m[0].map((_, j) => m.map(row => row[j]));
}

// 注意力分数 = Q × K^T / sqrt(d_k)
export const QK_T = matmul(Q, transpose(K));
export const SCALE = Math.sqrt(D_MODEL);
export const SCALED_SCORES = QK_T.map(row => row.map(v => parseFloat((v / SCALE).toFixed(4))));

// Softmax
function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => parseFloat((v / sum).toFixed(4)));
}

export const ATTENTION_WEIGHTS = SCALED_SCORES.map(row => softmax(row));

// Attention Output = Weights × V
export const ATTENTION_OUTPUT = matmul(ATTENTION_WEIGHTS, V);

// ========== 4. Multi-Head Attention ==========
// 将 Q, K, V 分成 2 个头
export function splitHeads(matrix: number[][], nHeads: number): number[][][] {
  const dK = matrix[0].length / nHeads;
  return Array.from({ length: nHeads }, (_, h) =>
    matrix.map(row => row.slice(h * dK, (h + 1) * dK))
  );
}

export const Q_HEADS = splitHeads(Q, N_HEADS);
export const K_HEADS = splitHeads(K, N_HEADS);
export const V_HEADS = splitHeads(V, N_HEADS);

// 每个头的注意力计算
export function headAttention(q: number[][], k: number[][], v: number[][]) {
  const dK = k[0].length;
  const scores = matmul(q, transpose(k));
  const scaled = scores.map(row => row.map(val => parseFloat((val / Math.sqrt(dK)).toFixed(4))));
  const weights = scaled.map(row => softmax(row));
  const output = matmul(weights, v);
  return { scores, scaled, weights, output };
}

export const HEAD_RESULTS = Q_HEADS.map((q, i) => headAttention(q, K_HEADS[i], V_HEADS[i]));

// 拼接多头输出
export const CONCAT_HEADS = HEAD_RESULTS[0].output.map((row, i) => [
  ...row,
  ...HEAD_RESULTS[1].output[i],
]);

// ========== 5. Feed-Forward Network ==========
export const FFN_W1: number[][] = Array.from({ length: D_MODEL }, (_, i) =>
  Array.from({ length: D_MODEL * 2 }, (_, j) =>
    parseFloat((Math.sin(i * 7 + j * 3) * 0.3).toFixed(4))
  )
);

export function relu(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(v => Math.max(0, parseFloat(v.toFixed(4)))));
}

export const FFN_HIDDEN = relu(matmul(CONCAT_HEADS, FFN_W1));

export const FFN_W2: number[][] = Array.from({ length: D_MODEL * 2 }, (_, i) =>
  Array.from({ length: D_MODEL }, (_, j) =>
    parseFloat((Math.cos(i * 5 + j * 2) * 0.3).toFixed(4))
  )
);

export const FFN_OUTPUT = matmul(FFN_HIDDEN, FFN_W2);

// ========== 6. Layer Norm & Residual ==========
function layerNorm(matrix: number[][]): number[][] {
  return matrix.map(row => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length;
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length;
    const std = Math.sqrt(variance + 1e-6);
    return row.map(v => parseFloat(((v - mean) / std).toFixed(4)));
  });
}

// 残差连接 + Layer Norm
export const RESIDUAL_1 = addMatrices(EMBEDDED_INPUT, CONCAT_HEADS);
export const NORM_1 = layerNorm(RESIDUAL_1);
export const RESIDUAL_2 = addMatrices(NORM_1, FFN_OUTPUT);
export const NORM_2 = layerNorm(RESIDUAL_2);

// ========== 7. Output Projection ==========
// 简化的输出投影（映射到小词表）
export const OUTPUT_VOCAB = ['我', '爱', '人工智能', '你', '学习', '技术', '是', '的', '很', '好'];
export const OUTPUT_LOGITS = NORM_2.map(row => {
  // 每个 token 位置对词表中每个词的打分
  return OUTPUT_VOCAB.map((_, j) => {
    let score = 0;
    for (let k = 0; k < row.length; k++) {
      score += row[k] * Math.sin((j + 1) * (k + 1) * 0.5);
    }
    return parseFloat(score.toFixed(4));
  });
});

export function softmaxArr(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => parseFloat((v / sum).toFixed(4)));
}

export const OUTPUT_PROBS = OUTPUT_LOGITS.map(row => softmaxArr(row));

// 格式化数字
export function fmt(n: number): string {
  return n.toFixed(4);
}

export function fmtShort(n: number): string {
  return n.toFixed(2);
}
