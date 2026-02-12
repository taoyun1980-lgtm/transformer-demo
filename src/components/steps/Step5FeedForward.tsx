'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, D_MODEL, CONCAT_HEADS, FFN_HIDDEN, FFN_OUTPUT,
} from '@/lib/transformer';

export function Step5FeedForward() {
  const { setCurrentStep } = useTransformerStore();

  const dimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);
  const hiddenLabels = Array.from({ length: D_MODEL * 2 }, (_, i) => `h${i}`);

  return (
    <div className="space-y-6">
      <Card title="第五步：前馈神经网络（Feed-Forward Network）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              注意力层处理了词与词之间的关系，前馈网络则对<strong>每个位置独立</strong>地做非线性变换，
              增强模型的表达能力。它是一个简单的两层全连接网络：先升维再降维。
            </p>
            <div className="bg-white rounded p-2 mt-2 font-mono text-sm text-center">
              FFN(x) = ReLU(x × W<sub>1</sub>) × W<sub>2</sub>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 输入（多头注意力输出）</h4>
            <MatrixTable
              data={CONCAT_HEADS}
              rowLabels={TOKENS}
              colLabels={dimLabels}
              title={`FFN 输入（${TOKENS.length} × ${D_MODEL}）`}
              colorScale compact
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 第一层：升维 + ReLU</h4>
            <p className="text-sm text-muted-foreground mb-3">
              x × W<sub>1</sub>：从 {D_MODEL} 维升到 {D_MODEL * 2} 维（实际 Transformer 升到 4 倍），
              然后用 ReLU 激活函数将负值置为 0。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800">
                💡 ReLU(x) = max(0, x)。把所有负数变成 0，只保留正的信号。
                这种非线性变换是神经网络能力的来源。
              </p>
            </div>
            <MatrixTable
              data={FFN_HIDDEN}
              rowLabels={TOKENS}
              colLabels={hiddenLabels}
              title={`隐藏层 = ReLU(输入 × W₁)（${TOKENS.length} × ${D_MODEL * 2}）`}
              colorScale compact
            />
            <p className="text-xs text-muted-foreground mt-1">
              注意：很多值为 0.00（被 ReLU "关掉"了），只有部分神经元被激活。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. 第二层：降维回原始维度</h4>
            <p className="text-sm text-muted-foreground mb-3">
              隐藏层 × W<sub>2</sub>：从 {D_MODEL * 2} 维降回 {D_MODEL} 维，保持与输入相同的维度。
            </p>
            <MatrixTable
              data={FFN_OUTPUT}
              rowLabels={TOKENS}
              colLabels={dimLabels}
              title={`FFN 输出（${TOKENS.length} × ${D_MODEL}）`}
              colorScale
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              FFN 对每个位置做了独立的"思考"：升维（{D_MODEL}→{D_MODEL * 2}） → 激活 → 降维（{D_MODEL * 2}→{D_MODEL}）。
              输出和输入维度相同，接下来用残差连接和归一化来稳定训练。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(4)}>
          ← 上一步
        </Button>
        <Button onClick={() => setCurrentStep(6)}>
          下一步：残差 & 归一化 →
        </Button>
      </div>
    </div>
  );
}
