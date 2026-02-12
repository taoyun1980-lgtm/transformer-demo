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

          <Card title="💬 核心实例：注意力如何帮助生成一句话？">
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-800">
                  假设 GPT 正在生成这句话：<strong>&quot;小明养了一只猫，他每天都会喂它吃猫粮&quot;</strong>
                </p>
                <p className="text-sm text-indigo-700 mt-1">
                  当模型处理到 <strong>&quot;它&quot;</strong> 这个词时，注意力机制是怎么工作的？
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">场景：处理"它"时的注意力分布</h4>
                <div className="bg-white border border-border rounded-lg p-4">
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {['小明','养了','一只','猫','，','他','每天','都会','喂','它'].map((w, i) => (
                      <span key={i} className={`px-2 py-1 rounded text-sm font-mono ${
                        w === '它' ? 'bg-primary text-white font-bold' :
                        w === '猫' ? 'bg-green-200 font-bold border-2 border-green-500' :
                        w === '喂' ? 'bg-yellow-200 border-2 border-yellow-500' :
                        w === '他' ? 'bg-blue-100 border border-blue-300' :
                        'bg-gray-100'
                      }`}>{w}</span>
                    ))}
                  </div>

                  <p className="text-sm text-center mb-3">&quot;它&quot;（Query）向所有词（Key）发出查询，得到注意力分数：</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { word: '小明', score: 0.04, bar: 'w-[4%]' },
                      { word: '猫', score: 0.52, bar: 'w-[52%]' },
                      { word: '他', score: 0.08, bar: 'w-[8%]' },
                      { word: '喂', score: 0.21, bar: 'w-[21%]' },
                      { word: '其他', score: 0.15, bar: 'w-[15%]' },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-sm font-bold">{item.word}</div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                          <div className={`bg-primary h-full rounded-full ${item.bar}`} />
                        </div>
                        <div className="text-xs font-mono mt-1">{(item.score * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">为什么"猫"得到最高注意力？</p>
                <div className="text-sm text-purple-800 space-y-2">
                  <p>1. <strong>"它"的 Query 向量</strong>编码了"我是一个代词，需要找到我指代的东西"</p>
                  <p>2. <strong>"猫"的 Key 向量</strong>编码了"我是一个可以被代词指代的名词（动物）"</p>
                  <p>3. Q × K 点积很大 → 注意力分数高 → <strong>"它"≈"猫"</strong></p>
                  <p>4. 最终"它"的 Value 输出会大量融合"猫"的信息，模型由此知道"它"就是那只猫</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">接下来生成"吃猫粮"</p>
                <p className="text-sm text-amber-800">
                  因为"它"的表示已经融合了"猫"的语义，当模型在"它"之后预测下一个词时：
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="bg-white px-2 py-1 rounded text-sm">...喂</span>
                  <span className="bg-primary/10 px-2 py-1 rounded text-sm font-bold border border-primary/30">它</span>
                  <span className="text-primary font-bold">→</span>
                  <span className="bg-green-100 px-2 py-1 rounded text-sm">吃 (35%)</span>
                  <span className="bg-green-50 px-2 py-1 rounded text-sm">猫粮 (28%)</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">东西 (12%)</span>
                  <span className="bg-gray-50 px-2 py-1 rounded text-sm">鱼 (8%)</span>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  模型知道"它"="猫"，所以预测"吃"和"猫粮"的概率很高。这就是注意力机制让语言生成连贯的关键！
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">注意力的更多用途</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>&#x2022; <strong>指代消解</strong>：&quot;它&quot; → &quot;猫&quot;，&quot;他&quot; → &quot;小明&quot;</p>
                  <p>&#x2022; <strong>长距离依赖</strong>：&quot;北京的烤鸭...那里的建筑也很美&quot;（&quot;那里&quot; → &quot;北京&quot;）</p>
                  <p>&#x2022; <strong>语义搭配</strong>：&quot;苹果发布了...&quot;（&quot;发布&quot;让模型知道这是公司不是水果）</p>
                  <p>&#x2022; <strong>句法结构</strong>：动词关注主语和宾语，形容词关注被修饰的名词</p>
                </div>
              </div>
            </div>
          </Card>

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
