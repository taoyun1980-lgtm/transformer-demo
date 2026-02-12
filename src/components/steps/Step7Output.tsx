'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatrixTable } from '@/components/ui/MatrixTable';
import { useTransformerStore } from '@/store/transformerStore';
import {
  TOKENS, NORM_2, OUTPUT_VOCAB, OUTPUT_LOGITS, OUTPUT_PROBS, D_MODEL,
} from '@/lib/transformer';

export function Step7Output() {
  const { setCurrentStep } = useTransformerStore();

  const dimLabels = Array.from({ length: D_MODEL }, (_, i) => `d${i}`);

  // 找到每行概率最大的词
  const predictions = OUTPUT_PROBS.map((row, i) => {
    const maxIdx = row.indexOf(Math.max(...row));
    return {
      token: TOKENS[i],
      predicted: OUTPUT_VOCAB[maxIdx],
      prob: row[maxIdx],
      allProbs: row,
    };
  });

  return (
    <div className="space-y-6">
      <Card title="第七步：输出预测（Output Projection）">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">这一步在做什么？</p>
            <p className="text-sm text-blue-800">
              将最终的隐藏表示映射到词表上，得到每个位置对每个词的<strong>概率分布</strong>。
              概率最高的词就是模型的预测结果。这是 Transformer 产出答案的最后一步。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. 最终隐藏表示</h4>
            <p className="text-sm text-muted-foreground mb-3">
              经过注意力、前馈、残差归一化后的输出（Layer Norm 2 的结果）
            </p>
            <MatrixTable
              data={NORM_2}
              rowLabels={TOKENS}
              colLabels={dimLabels}
              title={`最终隐藏表示（${TOKENS.length} × ${D_MODEL}）`}
              colorScale compact
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. 线性投影 → Logits</h4>
            <p className="text-sm text-muted-foreground mb-3">
              将 {D_MODEL} 维向量投影到词表大小（{OUTPUT_VOCAB.length} 个词），得到原始分数（logits）。
              分数越高，模型越"认为"这个词可能是答案。
            </p>
            <MatrixTable
              data={OUTPUT_LOGITS}
              rowLabels={TOKENS.map(t => `位置: ${t}`)}
              colLabels={OUTPUT_VOCAB}
              title={`Logits（${TOKENS.length} × ${OUTPUT_VOCAB.length}）`}
              colorScale
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Softmax → 概率分布</h4>
            <p className="text-sm text-muted-foreground mb-3">
              对 logits 做 softmax，转化为概率（每行和为 1）。
            </p>
            <MatrixTable
              data={OUTPUT_PROBS}
              rowLabels={TOKENS.map(t => `位置: ${t}`)}
              colLabels={OUTPUT_VOCAB}
              title="输出概率分布"
              highlightMax
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. 最终预测结果</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.map((pred, i) => (
                <div key={i} className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">位置 {i}（当前词：{pred.token}）</div>
                  <div className="text-3xl font-bold text-primary mb-2">{pred.predicted}</div>
                  <div className="text-sm">
                    置信度：<span className="font-mono font-bold">{(pred.prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Top-3：
                    {pred.allProbs
                      .map((p, j) => ({ word: OUTPUT_VOCAB[j], prob: p }))
                      .sort((a, b) => b.prob - a.prob)
                      .slice(0, 3)
                      .map((item, k) => (
                        <span key={k} className="inline-block mx-1">
                          {item.word}({(item.prob * 100).toFixed(1)}%)
                        </span>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-900 mb-1">💡 关于预测结果</p>
            <p className="text-xs text-amber-800">
              这里使用的是随机初始化的权重，所以预测结果没有实际语义。
              真实的 Transformer 经过大量数据训练后，权重会被调整到能准确预测下一个词的状态。
              比如在 GPT 中，输入"我爱"后模型可能高概率预测"你"或"学习"。
            </p>
          </div>

          <Card title="💬 完整实例：GPT 是如何一步步生成句子的？">
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  用户输入：<strong>&quot;今天天气真好，我想去&quot;</strong>
                </p>
                <p className="text-sm text-indigo-700 mt-1">
                  GPT 需要预测下一个词。整个过程经过了我们学的全部 7 步：
                </p>
              </div>

              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="divide-y divide-border">
                  {[
                    { step: '1. 分词', icon: '📝', desc: '"今天/天气/真好/，/我/想/去" → 7个token → 7个向量', color: 'bg-blue-50' },
                    { step: '2. 位置编码', icon: '📍', desc: '给每个词标记位置（第0位、第1位...），模型知道词序', color: 'bg-cyan-50' },
                    { step: '3. 自注意力', icon: '🔍', desc: '"去"关注"我"(谁去)和"想"(什么意愿)，收集上下文', color: 'bg-purple-50' },
                    { step: '4. 多头注意力', icon: '🧠', desc: 'Head1关注"想→去"(动作链) Head2关注"天气好→去"(因果)', color: 'bg-pink-50' },
                    { step: '5. 前馈网络', icon: '⚡', desc: '综合信息深入推理：好天气+想去 → 可能是户外活动', color: 'bg-yellow-50' },
                    { step: '6. 残差归一化', icon: '🔄', desc: '稳定数值，保留原始信息不丢失', color: 'bg-green-50' },
                    { step: '7. 输出预测', icon: '🎯', desc: '映射到词表 → softmax → 选概率最高的词', color: 'bg-orange-50' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.color} px-4 py-3 flex items-start gap-3`}>
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <span className="text-sm font-bold">{item.step}</span>
                        <p className="text-xs text-gray-700 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">最终预测结果：</p>
                <div className="bg-white border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center mb-3">
                    <span className="text-sm text-gray-500">今天天气真好，我想去</span>
                    <span className="text-primary font-bold">→</span>
                    <span className="bg-green-100 px-3 py-1 rounded-lg text-sm font-bold border-2 border-green-400">公园 (23%)</span>
                    <span className="bg-green-50 px-2 py-1 rounded text-sm">散步 (15%)</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">外面 (12%)</span>
                    <span className="bg-gray-50 px-2 py-1 rounded text-sm">爬山 (9%)</span>
                  </div>
                  <p className="text-xs text-center text-gray-600">模型选择概率最高的 &quot;公园&quot;，然后把 &quot;公园&quot; 加入输入，继续预测下一个词...</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">自回归生成：一个词一个词地写</p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-xs w-12">第1轮</span>
                    <span className="text-gray-800">今天天气真好，我想去</span>
                    <span className="text-primary">→</span>
                    <span className="bg-primary/10 px-1 rounded font-bold">公园</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-xs w-12">第2轮</span>
                    <span className="text-gray-800">今天天气真好，我想去公园</span>
                    <span className="text-primary">→</span>
                    <span className="bg-primary/10 px-1 rounded font-bold">散</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-xs w-12">第3轮</span>
                    <span className="text-gray-800">今天天气真好，我想去公园散</span>
                    <span className="text-primary">→</span>
                    <span className="bg-primary/10 px-1 rounded font-bold">步</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-xs w-12">第4轮</span>
                    <span className="text-gray-800">今天天气真好，我想去公园散步</span>
                    <span className="text-primary">→</span>
                    <span className="bg-primary/10 px-1 rounded font-bold">。[结束]</span>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-3">
                  每一轮都经过完整的 7 步流程。GPT 生成一段 100 字的回答，就要跑约 100 次这个流程。
                  这就是为什么 AI 回复时是一个字一个字"打出来"的——它真的在一个一个预测！
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">完整流程回顾</p>
            <div className="text-sm text-green-800 space-y-1">
              <p>1. <strong>分词与嵌入</strong>：文字 → 数字向量</p>
              <p>2. <strong>位置编码</strong>：加入位置信息</p>
              <p>3. <strong>自注意力</strong>：每个词关注所有词（Q×K→权重→加权V）</p>
              <p>4. <strong>多头注意力</strong>：多个视角同时关注</p>
              <p>5. <strong>前馈网络</strong>：独立的非线性变换</p>
              <p>6. <strong>残差 & 归一化</strong>：稳定训练的关键技巧</p>
              <p>7. <strong>输出预测</strong>：映射到词表，得到概率</p>
            </div>
            <p className="text-sm text-green-700 mt-3 font-semibold">
              这就是 Transformer 的完整工作流程！GPT、BERT、LLaMA 等大语言模型的核心都是这个架构。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={() => setCurrentStep(6)}>
          ← 上一步
        </Button>
        <Button variant="secondary" className="ml-3" onClick={() => setCurrentStep(1)}>
          从头开始
        </Button>
      </div>
    </div>
  );
}
