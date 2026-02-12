'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, D_MODEL, D_K, N_HEADS,
  Q_HEADS, K_HEADS, V_HEADS, HEAD_RESULTS, CONCAT_HEADS,
} from '@/lib/transformer';

export function Step4MultiHead() {
  const { setCurrentStep } = useTransformerStore();

  const headDimLabels = Array.from({ length: D_K }, (_, i) => `d${i}`);
  const fullDimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);

  return (
    <div className="space-y-6">
      <Card title="第四步：多头注意力（Multi-Head Attention）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              单个注意力头只能从一个角度看关系。<strong>多头注意力</strong>将 Q、K、V 切分成 {N_HEADS} 个头，
              让模型从不同子空间同时捕捉不同类型的关系（如语法关系、语义关系等），最后拼接起来。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 拆分成 {N_HEADS} 个头</h4>
            <p className="text-sm text-muted-foreground mb-3">
              将 {D_MODEL} 维的 Q、K、V 各拆分成 {N_HEADS} 个 {D_K} 维的子矩阵（{D_MODEL} ÷ {N_HEADS} = {D_K}）
            </p>

            {[0, 1].map((h) => (
              <div key={h} className="border border-border rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-primary mb-3">Head {h + 1}（维度 d{h * D_K}-d{(h + 1) * D_K - 1}）</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <MatrixTable
                    data={Q_HEADS[h]}
                    rowLabels={TOKENS}
                    colLabels={headDimLabels}
                    title={`Q_head${h + 1}`}
                    colorScale compact
                  />
                  <MatrixTable
                    data={K_HEADS[h]}
                    rowLabels={TOKENS}
                    colLabels={headDimLabels}
                    title={`K_head${h + 1}`}
                    colorScale compact
                  />
                  <MatrixTable
                    data={V_HEADS[h]}
                    rowLabels={TOKENS}
                    colLabels={headDimLabels}
                    title={`V_head${h + 1}`}
                    colorScale compact
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 每个头独立计算注意力</h4>

            {HEAD_RESULTS.map((head, h) => (
              <div key={h} className="border border-border rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-primary mb-3">Head {h + 1} 的注意力计算</h5>
                <div className="space-y-3">
                  <MatrixTable
                    data={head.weights}
                    rowLabels={TOKENS}
                    colLabels={TOKENS}
                    title={`Head ${h + 1} 注意力权重（softmax 后）`}
                    highlightMax
                  />
                  <MatrixTable
                    data={head.output}
                    rowLabels={TOKENS}
                    colLabels={headDimLabels}
                    title={`Head ${h + 1} 输出（${TOKENS.length} × ${D_K}）`}
                    colorScale compact
                  />
                </div>
              </div>
            ))}

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-800">
                🔍 对比两个头的注意力权重：它们关注的重点不同！这就是多头注意力的价值——
                不同的头学到了不同的关注模式。
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. 拼接所有头的输出</h4>
            <p className="text-sm text-muted-foreground mb-3">
              将 {N_HEADS} 个头的输出（各 {TOKENS.length}×{D_K}）横向拼接，恢复为 {TOKENS.length}×{D_MODEL} 的矩阵。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800">
                💡 Concat(head1, head2) = [{D_K} 维] + [{D_K} 维] = [{D_MODEL} 维]。
                实际 Transformer 还会乘一个投影矩阵 W<sub>O</sub>，这里为简化省略。
              </p>
            </div>
            <MatrixTable
              data={CONCAT_HEADS}
              rowLabels={TOKENS}
              colLabels={fullDimLabels}
              title={`拼接后的多头输出（${TOKENS.length} × ${D_MODEL}）`}
              colorScale
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">小结</p>
            <p className="text-sm text-green-800">
              多头注意力从 {N_HEADS} 个不同视角捕捉词与词的关系，拼接后得到融合了多角度信息的表示。
              接下来进入前馈神经网络，进一步变换每个位置的表示。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          ← 上一步
        </Button>
        <Button onClick={() => setCurrentStep(5)}>
          下一步：前馈网络 →
        </Button>
      </div>
    </div>
  );
}
