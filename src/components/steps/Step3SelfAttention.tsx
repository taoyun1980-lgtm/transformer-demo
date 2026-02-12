'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, D_MODEL, EMBEDDED_INPUT, W_Q, W_K, W_V,
  Q, K, V, QK_T, SCALE, SCALED_SCORES, ATTENTION_WEIGHTS, ATTENTION_OUTPUT,
  fmt,
} from '@/lib/transformer';

export function Step3SelfAttention() {
  const { setCurrentStep } = useTransformerStore();

  const dimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);

  return (
    <div className="space-y-6">
      <Card title="第三步：自注意力机制（Self-Attention）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              自注意力是 Transformer 的<strong>核心创新</strong>。它让每个词能"看到"句子中的所有其他词，
              并根据相关性来决定应该关注哪些词。公式：
            </p>
            <div className="bg-white rounded p-2 mt-2 font-mono text-sm text-center">
              Attention(Q, K, V) = softmax(Q × K<sup>T</sup> / √d<sub>k</sub>) × V
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 生成 Q、K、V 矩阵</h4>
            <p className="text-sm text-muted-foreground mb-3">
              输入矩阵 X 分别乘以三个权重矩阵 W<sub>Q</sub>、W<sub>K</sub>、W<sub>V</sub>，得到 Query（查询）、Key（键）、Value（值）。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800">
                💡 可以这样理解：<strong>Q</strong> 是"我在找什么"，<strong>K</strong> 是"我有什么可以被找到的"，
                <strong>V</strong> 是"我实际提供的内容"。Q 和 K 配对决定关注度，V 提供最终内容。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <MatrixTable
                data={Q}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title={`Q = X × W_Q（${TOKENS.length} × ${D_MODEL}）`}
                colorScale compact
              />
              <MatrixTable
                data={K}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title={`K = X × W_K（${TOKENS.length} × ${D_MODEL}）`}
                colorScale compact
              />
              <MatrixTable
                data={V}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title={`V = X × W_V（${TOKENS.length} × ${D_MODEL}）`}
                colorScale compact
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 计算注意力分数</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Q × K<sup>T</sup> 计算每对词之间的相关性分数，然后除以 √d = {fmt(SCALE)} 进行缩放（防止数值过大导致梯度消失）。
            </p>

            <div className="space-y-3">
              <MatrixTable
                data={QK_T}
                rowLabels={TOKENS}
                colLabels={TOKENS}
                title={`Q × K^T（原始分数）`}
                colorScale
              />
              <MatrixTable
                data={SCALED_SCORES}
                rowLabels={TOKENS}
                colLabels={TOKENS}
                title={`缩放后分数 = Q×K^T / √${D_MODEL}（÷ ${fmt(SCALE)}）`}
                colorScale
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Softmax → 注意力权重</h4>
            <p className="text-sm text-muted-foreground mb-3">
              对每一行做 softmax，将分数转化为概率分布（每行和为 1）。这就是注意力权重——数值越大，表示关注度越高。
            </p>
            <MatrixTable
              data={ATTENTION_WEIGHTS}
              rowLabels={TOKENS}
              colLabels={TOKENS}
              title="注意力权重矩阵（每行和 = 1）"
              highlightMax
            />
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
              <p className="text-xs text-purple-800">
                🔍 观察：每行中<strong>绿色高亮</strong>的是该词最关注的词。
                比如看"我"这一行，可以看出"我"最关注哪个词。
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. 加权求和 → 注意力输出</h4>
            <p className="text-sm text-muted-foreground mb-3">
              注意力权重 × V = 输出。每个词的新表示是所有词的 V 按注意力权重加权平均。
            </p>
            <MatrixTable
              data={ATTENTION_OUTPUT}
              rowLabels={TOKENS}
              colLabels={dimLabels}
              title={`注意力输出 = Weights × V（${TOKENS.length} × ${D_MODEL}）`}
              colorScale
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              通过自注意力，每个词的表示融合了句子中其他词的信息。
              但单一注意力视角有局限，接下来我们用"多头注意力"从多个角度捕捉关系。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          ← 上一步
        </Button>
        <Button onClick={() => setCurrentStep(4)}>
          下一步：多头注意力 →
        </Button>
      </div>
    </div>
  );
}
