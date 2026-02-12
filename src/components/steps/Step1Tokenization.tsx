'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  EXAMPLE_SENTENCE, TOKENS, TOKEN_IDS, VOCAB_SIZE, D_MODEL,
  TOKEN_EMBEDDINGS,
} from '@/lib/transformer';

export function Step1Tokenization() {
  const { setCurrentStep } = useTransformerStore();

  return (
    <div className="space-y-6">
      <Card title="第一步：分词与嵌入（Tokenization & Embedding）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              Transformer 不能直接理解文字。我们需要先把句子<strong>切分成词（token）</strong>，
              然后把每个词转换成一个<strong>数字向量</strong>（embedding），这样模型才能进行数学运算。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 原始输入</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <span className="text-2xl font-mono font-bold text-primary">
                &quot;{EXAMPLE_SENTENCE}&quot;
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 分词结果</h4>
            <p className="text-sm text-muted-foreground mb-3">
              将句子拆分为 {TOKENS.length} 个 token，每个 token 对应词表中的一个 ID（词表大小 = {VOCAB_SIZE.toLocaleString()}）
            </p>
            <div className="flex gap-4 justify-center">
              {TOKENS.map((token, i) => (
                <div key={i} className="bg-white border-2 border-primary/30 rounded-lg p-4 text-center min-w-[100px] shadow-sm">
                  <div className="text-2xl mb-2">{token}</div>
                  <div className="text-xs text-muted-foreground">Token {i}</div>
                  <div className="text-sm font-mono mt-1 bg-primary/10 rounded px-2 py-1">
                    ID: {TOKEN_IDS[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. 嵌入向量（Embedding）</h4>
            <p className="text-sm text-muted-foreground mb-3">
              用 Token ID 在嵌入矩阵中查找对应的 {D_MODEL} 维向量。每个 token 变成一行数字。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800">
                💡 嵌入矩阵的大小是 {VOCAB_SIZE.toLocaleString()} × {D_MODEL}（词表大小 × 向量维度）。
                每个词在训练过程中学到的向量，能捕捉语义关系——意思相近的词，向量也相近。
              </p>
            </div>
            <MatrixTable
              data={TOKEN_EMBEDDINGS}
              rowLabels={TOKENS.map((t, i) => `${t} (${TOKEN_IDS[i]})`)}
              colLabels={Array.from({ length: D_MODEL }, (_, i) => `d${i}`)}
              title={`嵌入矩阵查找结果（${TOKENS.length} × ${D_MODEL}）`}
              colorScale
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              输入：一句话 → 输出：{TOKENS.length} 个 {D_MODEL} 维向量（{TOKENS.length}×{D_MODEL} 矩阵）。
              接下来，我们需要加上位置信息，让模型知道每个词在句子中的位置。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep(2)}>
          下一步：位置编码 →
        </Button>
      </div>
    </div>
  );
}
