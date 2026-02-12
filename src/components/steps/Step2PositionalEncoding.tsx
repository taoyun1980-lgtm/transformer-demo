'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, D_MODEL, TOKEN_EMBEDDINGS, POSITIONAL_ENCODING, EMBEDDED_INPUT,
} from '@/lib/transformer';

export function Step2PositionalEncoding() {
  const { setCurrentStep } = useTransformerStore();

  const dimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);

  return (
    <div className="space-y-6">
      <Card title="第二步：位置编码（Positional Encoding）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              Transformer 没有循环结构（不像 RNN），它同时处理所有词。为了让模型知道
              <strong>"我"在第1位、"爱"在第2位</strong>，需要给每个位置加上一个独特的位置信号。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 位置编码公式</h4>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-1">
              <p>PE(pos, 2i) &nbsp;&nbsp;= sin(pos / 10000^(2i/d_model))</p>
              <p>PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              偶数维度用 sin，奇数维度用 cos。不同位置产生不同的波形组合，确保每个位置有唯一的编码。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 位置编码矩阵</h4>
            <MatrixTable
              data={POSITIONAL_ENCODING}
              rowLabels={TOKENS.map((t, i) => `pos ${i} (${t})`)}
              colLabels={dimLabels}
              title={`位置编码 PE（${TOKENS.length} × ${D_MODEL}）`}
              colorScale
            />
            <p className="text-xs text-muted-foreground mt-1">
              注意：pos=0（第一个词）的编码和 pos=1、pos=2 明显不同，这就是位置信息。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. 嵌入 + 位置编码 = 最终输入</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800">
                💡 直接将嵌入向量和位置编码<strong>逐元素相加</strong>，这样每个向量同时携带了"词义"和"位置"两种信息。
              </p>
            </div>

            <div className="space-y-3">
              <MatrixTable
                data={TOKEN_EMBEDDINGS}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="Token 嵌入"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">+</p>
              <MatrixTable
                data={POSITIONAL_ENCODING}
                rowLabels={TOKENS.map((_, i) => `PE[${i}]`)}
                colLabels={dimLabels}
                title="位置编码"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">=</p>
              <MatrixTable
                data={EMBEDDED_INPUT}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="最终输入矩阵 X（嵌入 + 位置编码）"
                colorScale
              />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-indigo-900 mb-2">💬 生成实例：位置为什么重要？</p>
            <div className="bg-white rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-800 mb-2">看这两句话，用的完全相同的词，但意思截然不同：</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-lg font-bold">&quot;狗 追 猫&quot;</p>
                  <p className="text-xs text-red-700 mt-1">狗是追的一方</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-lg font-bold">&quot;猫 追 狗&quot;</p>
                  <p className="text-xs text-blue-700 mt-1">猫是追的一方</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                如果没有位置编码，模型看到的只是 {'{'}猫, 追, 狗{'}'} 这个集合，分不清谁追谁。
                有了位置编码，模型知道"狗"在第 0 位是主语，"猫"在第 2 位是宾语。
              </p>
            </div>
            <p className="text-xs text-indigo-700">
              同理，GPT 在生成回答时，也需要知道前面已经生成的每个词的位置顺序，
              才能正确理解上下文接着往下写。
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              每个 token 的向量现在同时包含了语义和位置信息。这个 {TOKENS.length}×{D_MODEL} 的矩阵就是 Transformer 的输入，
              接下来将进入核心的注意力机制。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          ← 上一步
        </Button>
        <Button onClick={() => setCurrentStep(3)}>
          下一步：自注意力 →
        </Button>
      </div>
    </div>
  );
}
