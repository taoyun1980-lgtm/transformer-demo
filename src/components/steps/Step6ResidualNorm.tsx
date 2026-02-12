'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, D_MODEL, EMBEDDED_INPUT, CONCAT_HEADS,
  RESIDUAL_1, NORM_1, FFN_OUTPUT, RESIDUAL_2, NORM_2,
} from '@/lib/transformer';

export function Step6ResidualNorm() {
  const { setCurrentStep } = useTransformerStore();

  const dimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);

  return (
    <div className="space-y-6">
      <Card title="第六步：残差连接 & 层归一化（Residual & Layer Norm）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              深度网络容易出现梯度消失。<strong>残差连接</strong>让信息可以"跳过"某些层直接传递，
              <strong>层归一化</strong>则把数值调整到稳定范围，两者配合使训练更稳定。
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-primary">阶段 A：注意力层后的残差 + 归一化</h4>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                残差连接：将注意力层的输入（原始嵌入 X）直接加到输出上
              </p>

              <MatrixTable
                data={EMBEDDED_INPUT}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="原始输入 X"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">+</p>
              <MatrixTable
                data={CONCAT_HEADS}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="多头注意力输出"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">=</p>
              <MatrixTable
                data={RESIDUAL_1}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="残差连接结果（X + Attention(X)）"
                colorScale
              />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  💡 残差连接的直觉：即使注意力层"学崩了"输出为 0，信息还能通过捷径（X 本身）传递下去。
                  这就像给网络加了一条"保底通道"。
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-3">
                层归一化：对每一行（每个 token）做标准化 → 均值=0，方差=1
              </p>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-center">
                LayerNorm(x) = (x - mean) / √(variance + ε)
              </div>

              <MatrixTable
                data={NORM_1}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="归一化后（Layer Norm 1）"
                colorScale
              />
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-primary">阶段 B：前馈层后的残差 + 归一化</h4>

            <div className="space-y-3">
              <MatrixTable
                data={NORM_1}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="Norm 1 输出（FFN 的输入）"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">+</p>
              <MatrixTable
                data={FFN_OUTPUT}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="FFN 输出"
                compact
              />
              <p className="text-center text-lg font-bold text-primary">=</p>
              <MatrixTable
                data={RESIDUAL_2}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="残差连接结果（Norm1 + FFN(Norm1)）"
                colorScale
              />

              <MatrixTable
                data={NORM_2}
                rowLabels={TOKENS}
                colLabels={dimLabels}
                title="最终归一化输出（Layer Norm 2）"
                colorScale
              />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-indigo-900 mb-2">💬 生成实例：为什么需要残差连接？</p>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-800 mb-2">
                GPT-3 有 <strong>96 层</strong> Transformer。想象信息要穿过 96 道门才能到达终点——
                如果任何一道门"卡住了"，信息就传不过去（梯度消失）。
              </p>
              <div className="bg-gray-50 rounded p-3 my-2">
                <p className="text-xs font-mono text-gray-700 mb-1">没有残差：信息 → 第1层 → 第2层 → ... → 第96层（信号越来越弱）</p>
                <p className="text-xs font-mono text-green-700">有残差：&nbsp;&nbsp;信息 → 第1层 → 第2层 → ... → 第96层（每层都有直通捷径）</p>
              </div>
              <p className="text-xs text-gray-600">
                残差连接就像每层旁边加了一个"旁路电梯"，即使某层学崩了，原始信号也能跳过继续往前传。
                这是深度学习的关键突破之一，最早在 ResNet（2015）中提出，Transformer 也采用了这个设计。
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              一个 Transformer 层的完整流程：输入 → 多头注意力 → 残差+归一化 → FFN → 残差+归一化 → 输出。
              实际模型会堆叠多层（如 12 层）。现在我们已经得到了最终的隐藏表示，下一步就是输出预测了！
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(5)}>
          ← 上一步
        </Button>
        <Button onClick={() => setCurrentStep(7)}>
          下一步：输出预测 →
        </Button>
      </div>
    </div>
  );
}
