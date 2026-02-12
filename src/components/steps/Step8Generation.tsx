'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTransformerStore } from '@/store/transformerStore';

const STAGES = [
  { label: '分词', icon: '📝', duration: 700, desc: '识别输入序列中的每个 token' },
  { label: '嵌入', icon: '🔢', duration: 500, desc: '将 token 转化为向量' },
  { label: '位置编码', icon: '📍', duration: 500, desc: '加入位置信息' },
  { label: '自注意力', icon: '🔍', duration: 2200, desc: '计算词与词之间的关注度' },
  { label: '多头注意力', icon: '🧠', duration: 700, desc: '多视角并行分析' },
  { label: '前馈网络', icon: '⚡', duration: 700, desc: '深度特征变换' },
  { label: '残差归一化', icon: '🔄', duration: 500, desc: '稳定信号传递' },
  { label: '输出预测', icon: '🎯', duration: 2200, desc: '计算下一个词的概率' },
];

interface RoundData {
  tokens: string[];
  attention: { token: string; weight: number }[];
  predictions: { word: string; prob: number }[];
  selected: string;
  why: string;
}

const ROUNDS: RoundData[] = [
  {
    tokens: ['今天', '天气', '真好', '，', '我', '想', '去'],
    attention: [
      { token: '今天', weight: 0.05 },
      { token: '天气', weight: 0.12 },
      { token: '真好', weight: 0.08 },
      { token: '，', weight: 0.02 },
      { token: '我', weight: 0.18 },
      { token: '想', weight: 0.25 },
      { token: '去', weight: 0.30 },
    ],
    predictions: [
      { word: '公园', prob: 0.23 },
      { word: '散步', prob: 0.15 },
      { word: '外面', prob: 0.12 },
      { word: '爬山', prob: 0.09 },
      { word: '旅游', prob: 0.07 },
    ],
    selected: '公园',
    why: '"想"和"去"获得高注意力 → 结合"天气好"的上下文 → 预测一个适合好天气的户外地点',
  },
  {
    tokens: ['今天', '天气', '真好', '，', '我', '想', '去', '公园'],
    attention: [
      { token: '今天', weight: 0.03 },
      { token: '天气', weight: 0.18 },
      { token: '真好', weight: 0.22 },
      { token: '，', weight: 0.01 },
      { token: '我', weight: 0.06 },
      { token: '想', weight: 0.10 },
      { token: '去', weight: 0.13 },
      { token: '公园', weight: 0.27 },
    ],
    predictions: [
      { word: '散', prob: 0.28 },
      { word: '玩', prob: 0.18 },
      { word: '走', prob: 0.14 },
      { word: '跑', prob: 0.08 },
      { word: '里', prob: 0.06 },
    ],
    selected: '散',
    why: '"真好"+"公园"获得高注意力 → 好天气+公园 → 适合轻松的户外活动 → "散(步)"概率最高',
  },
  {
    tokens: ['今天', '天气', '真好', '，', '我', '想', '去', '公园', '散'],
    attention: [
      { token: '今天', weight: 0.02 },
      { token: '天气', weight: 0.04 },
      { token: '真好', weight: 0.03 },
      { token: '，', weight: 0.01 },
      { token: '我', weight: 0.04 },
      { token: '想', weight: 0.06 },
      { token: '去', weight: 0.08 },
      { token: '公园', weight: 0.16 },
      { token: '散', weight: 0.56 },
    ],
    predictions: [
      { word: '步', prob: 0.82 },
      { word: '心', prob: 0.05 },
      { word: '了', prob: 0.03 },
      { word: '开', prob: 0.03 },
      { word: '漫', prob: 0.02 },
    ],
    selected: '步',
    why: '"散"自身获得 56% 注意力 → "散步"是极强的词语搭配 → "步"概率高达 82%',
  },
  {
    tokens: ['今天', '天气', '真好', '，', '我', '想', '去', '公园', '散', '步'],
    attention: [
      { token: '今天', weight: 0.04 },
      { token: '天气', weight: 0.05 },
      { token: '真好', weight: 0.06 },
      { token: '，', weight: 0.12 },
      { token: '我', weight: 0.05 },
      { token: '想', weight: 0.08 },
      { token: '去', weight: 0.08 },
      { token: '公园', weight: 0.13 },
      { token: '散', weight: 0.17 },
      { token: '步', weight: 0.22 },
    ],
    predictions: [
      { word: '。', prob: 0.45 },
      { word: '，', prob: 0.18 },
      { word: '了', prob: 0.12 },
      { word: '吧', prob: 0.09 },
      { word: '呢', prob: 0.05 },
    ],
    selected: '。',
    why: '"，"获得较高注意力（已有逗号分句） → 句子语义已完整 → 模型选择句号结束生成',
  },
];

const TOTAL_STEPS = STAGES.length * ROUNDS.length;

export function Step8Generation() {
  const { setCurrentStep } = useTransformerStore();
  const [step, setStep] = useState(-1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const isDone = step >= TOTAL_STEPS;
  const isStarted = step >= 0;
  const roundIdx = isStarted && !isDone ? Math.floor(step / STAGES.length) : 0;
  const stageIdx = isStarted && !isDone ? step % STAGES.length : -1;
  const round = ROUNDS[Math.min(roundIdx, ROUNDS.length - 1)];
  const maxWeight = Math.max(...round.attention.map(a => a.weight));

  // auto-play timer
  useEffect(() => {
    if (!isPlaying || isDone || step < 0) return;
    const si = step % STAGES.length;
    const timer = setTimeout(() => doAdvance(), STAGES[si].duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, step, isDone]);

  function doAdvance() {
    if (isDone) return;

    const nextStep = step < 0 ? 0 : step + 1;

    // crossing round boundary → add token from completed round
    if (nextStep > 0 && nextStep % STAGES.length === 0) {
      const doneRound = Math.floor((nextStep - 1) / STAGES.length);
      if (doneRound < ROUNDS.length) {
        setGenerated(prev =>
          prev.length <= doneRound ? [...prev, ROUNDS[doneRound].selected] : prev
        );
      }
    }

    // finishing the very last step
    if (nextStep >= TOTAL_STEPS) {
      const last = ROUNDS.length - 1;
      setGenerated(prev =>
        prev.length <= last ? [...prev, ROUNDS[last].selected] : prev
      );
      setStep(TOTAL_STEPS);
      setIsPlaying(false);
      return;
    }

    setStep(nextStep);
  }

  function handlePlayPause() {
    if (isDone) return;
    if (!isStarted) {
      setStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(p => !p);
    }
  }

  function handleStep() {
    if (isDone) return;
    setIsPlaying(false);
    doAdvance();
  }

  function handleReset() {
    setStep(-1);
    setIsPlaying(false);
    setGenerated([]);
  }

  return (
    <div className="space-y-6">
      <Card title="动态模拟：Transformer 如何一步步写出一句话">
        <div className="space-y-5">

          {/* ---- sentence display ---- */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {isDone ? '生成完成 ✅' : isStarted ? `正在生成（第 ${roundIdx + 1}/${ROUNDS.length} 轮）...` : '点击"开始生成"观看完整过程'}
            </p>
            <div className="flex flex-wrap items-center gap-1 min-h-[44px]">
              {ROUNDS[0].tokens.map((t, i) => (
                <span key={`p-${i}`} className="px-2 py-1 rounded text-sm bg-gray-200 text-gray-700">{t}</span>
              ))}
              {generated.map((t, i) => (
                <span
                  key={`g-${i}`}
                  className="px-2 py-1 rounded text-sm bg-primary/20 text-primary font-bold"
                  style={{ animation: 'tokenAppear .35s ease-out' }}
                >{t}</span>
              ))}
              {isStarted && !isDone && (
                <span className="px-2 py-1 rounded text-sm bg-primary text-white animate-pulse font-bold">?</span>
              )}
            </div>
          </div>

          {/* ---- controls ---- */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={handlePlayPause} disabled={isDone}>
              {!isStarted ? '▶ 开始生成' : isPlaying ? '⏸ 暂停' : '▶ 继续'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleStep} disabled={isDone || isPlaying}>
              ⏭ 单步
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              🔄 重来
            </Button>
            {isStarted && !isDone && (
              <span className="text-xs text-muted-foreground ml-auto">
                第 {roundIdx + 1} 轮 · {STAGES[stageIdx]?.icon} {STAGES[stageIdx]?.label}
              </span>
            )}
          </div>

          {/* ---- pipeline ---- */}
          {isStarted && !isDone && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                预测「{round.tokens[round.tokens.length - 1]}」之后的下一个词 → 经过 8 个阶段：
              </p>
              <div className="flex flex-wrap gap-1">
                {STAGES.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      i === stageIdx
                        ? 'bg-primary text-white shadow-md ring-2 ring-primary/30 scale-105'
                        : i < stageIdx
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                    {i < stageIdx && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- detail panel ---- */}
          {isStarted && !isDone && (
            <div className="border border-border rounded-lg p-4 min-h-[140px] transition-all">
              <StageDetail stageIdx={stageIdx} round={round} maxWeight={maxWeight} />
            </div>
          )}

          {/* ---- done ---- */}
          {isDone && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-green-900 mb-2">生成完成！</p>
              <p className="text-xl font-bold text-green-800 mb-3">今天天气真好，我想去公园散步。</p>
              <p className="text-sm text-green-700 mb-3">
                4 轮预测，每轮经过完整 8 个阶段 = <strong>32 次计算</strong>。
              </p>
              <div className="bg-white rounded-lg p-3 text-sm text-gray-700 space-y-1">
                <p><strong>这就是 ChatGPT 回复你时"逐字打出"的原理：</strong></p>
                <p>· 每个字/词都是一次完整的 Transformer 前向传播</p>
                <p>· 生成 100 字的回答 ≈ 跑 100 次这个流程</p>
                <p>· 注意力机制让模型能"回看"前文，保持上下文连贯</p>
                <p>· 这就是为什么 AI 回复不是一次蹦出来，而是一个字一个字出现的</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-start gap-3">
        <Button variant="outline" onClick={() => setCurrentStep(7)}>
          ← 回到第七步
        </Button>
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          从头学起
        </Button>
      </div>
    </div>
  );
}

/* ---- sub-component: stage detail ---- */

function StageDetail({ stageIdx, round, maxWeight }: { stageIdx: number; round: RoundData; maxWeight: number }) {
  const lastToken = round.tokens[round.tokens.length - 1];

  switch (stageIdx) {
    case 0: // tokenize
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">📝 分词：当前输入序列</h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {round.tokens.map((t, i) => (
              <span key={i} className={`px-2 py-1 rounded text-sm font-mono ${
                i === round.tokens.length - 1 ? 'bg-primary/20 text-primary font-bold ring-2 ring-primary/30' : 'bg-gray-100'
              }`}>{t}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            共 {round.tokens.length} 个 token。模型将基于所有这些词的信息，预测下一个词。
            最后一个词「{lastToken}」的位置是预测的关键上下文。
          </p>
        </div>
      );

    case 1: // embed
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">🔢 嵌入查找：每个 token → 向量</h4>
          <div className="bg-gray-50 rounded p-3 font-mono text-xs space-y-1">
            {round.tokens.slice(-3).map((t, i) => (
              <p key={i}>
                <span className="text-primary font-bold">{t}</span>
                {' → ['}
                {Array.from({ length: 6 }, (_, j) => (
                  <span key={j} className="text-gray-600">
                    {(Math.sin((t.charCodeAt(0) + j) * 0.7) * 0.5).toFixed(2)}
                    {j < 5 ? ', ' : ''}
                  </span>
                ))}
                {', ...]'}
              </p>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">每个词查表得到一个高维向量（GPT 用 768~12288 维）</p>
        </div>
      );

    case 2: // position
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">📍 位置编码：让模型知道词序</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {round.tokens.map((t, i) => (
              <div key={i} className="text-center">
                <div className="text-[10px] text-muted-foreground">pos {i}</div>
                <div className={`px-2 py-1 rounded text-sm ${
                  i === round.tokens.length - 1 ? 'bg-primary/20 font-bold' : 'bg-gray-100'
                }`}>{t}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            sin/cos 编码加入向量 → 模型知道「{lastToken}」在第 {round.tokens.length - 1} 位
          </p>
        </div>
      );

    case 3: // attention - KEY STAGE
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">🔍 自注意力：预测位置关注每个前文词的权重</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {round.attention.map((a, i) => {
              const intensity = a.weight / maxWeight;
              return (
                <div key={i} className="text-center">
                  <div
                    className="px-3 py-2 rounded-lg text-sm font-mono border-2 transition-all duration-700"
                    style={{
                      backgroundColor: `rgba(59,130,246,${intensity * 0.55})`,
                      borderColor: `rgba(59,130,246,${intensity * 0.8})`,
                      color: intensity > 0.6 ? 'white' : 'inherit',
                      transform: `scale(${0.85 + intensity * 0.25})`,
                    }}
                  >{a.token}</div>
                  <div className="text-xs mt-1 font-mono font-bold" style={{ color: `rgba(59,130,246,${0.4 + intensity * 0.6})` }}>
                    {(a.weight * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-2">
            <p className="text-xs text-amber-800">💡 {round.why}</p>
          </div>
        </div>
      );

    case 4: // multihead
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">🧠 多头注意力：多角度同时分析</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-xs font-bold text-orange-900 mb-1">Head 1: 语法结构</p>
              <p className="text-xs text-orange-700">关注主谓宾、动词搭配</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded p-3">
              <p className="text-xs font-bold text-teal-900 mb-1">Head 2: 语义场景</p>
              <p className="text-xs text-teal-700">关注情境联想、常识推理</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            实际 GPT-4 有 120+ 个头，这里简化为 2 个。多个视角拼接后信息更丰富。
          </p>
        </div>
      );

    case 5: // ffn
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">⚡ 前馈网络：深度推理</h4>
          <div className="bg-gray-50 rounded p-3">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="bg-blue-100 px-2 py-1 rounded">输入 768维</span>
              <span className="text-gray-400">→</span>
              <span className="bg-purple-100 px-2 py-1 rounded">升维 3072维 + ReLU</span>
              <span className="text-gray-400">→</span>
              <span className="bg-blue-100 px-2 py-1 rounded">降维 768维</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            对注意力收集的信息做深度加工。FFN 存储了大量世界知识（如"公园可以散步"等事实）。
          </p>
        </div>
      );

    case 6: // residual + norm
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">🔄 残差连接 & 归一化</h4>
          <div className="bg-gray-50 rounded p-3 font-mono text-xs space-y-1">
            <p>output = LayerNorm(x + Attention(x))</p>
            <p>output = LayerNorm(output + FFN(output))</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            把每层的输入直接加到输出上（残差）→ 即使某层"学崩了"，信息也能通过捷径传下去。
            然后做归一化保持数值稳定。GPT-3 有 96 层，全靠残差连接才能训练。
          </p>
        </div>
      );

    case 7: // output prediction
      return (
        <div>
          <h4 className="text-sm font-semibold mb-2">🎯 输出预测：选择下一个词</h4>
          <div className="space-y-1.5 mb-2">
            {round.predictions.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-10 text-sm text-right font-mono ${i === 0 ? 'font-bold text-primary' : 'text-gray-600'}`}>
                  {p.word}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      i === 0 ? 'bg-primary' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(p.prob * 300, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono w-12 text-right ${i === 0 ? 'font-bold text-primary' : 'text-gray-500'}`}>
                  {(p.prob * 100).toFixed(0)}%
                </span>
                {i === 0 && <span className="text-xs text-primary font-bold">← 选中</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            softmax 将分数转为概率 → 选择概率最高的「{round.selected}」→ 加入序列，开始下一轮
          </p>
        </div>
      );

    default:
      return null;
  }
}
