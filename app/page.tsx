'use client';

import React from 'react';
import { useTransformerStore } from '@/store/transformerStore';
import { Step1Tokenization } from '@/components/steps/Step1Tokenization';
import { Step2PositionalEncoding } from '@/components/steps/Step2PositionalEncoding';
import { Step3SelfAttention } from '@/components/steps/Step3SelfAttention';
import { Step4MultiHead } from '@/components/steps/Step4MultiHead';
import { Step5FeedForward } from '@/components/steps/Step5FeedForward';
import { Step6ResidualNorm } from '@/components/steps/Step6ResidualNorm';
import { Step7Output } from '@/components/steps/Step7Output';

const STEPS = [
  { num: 1, label: '分词与嵌入', icon: '📝' },
  { num: 2, label: '位置编码', icon: '📍' },
  { num: 3, label: '自注意力', icon: '🔍' },
  { num: 4, label: '多头注意力', icon: '🧠' },
  { num: 5, label: '前馈网络', icon: '⚡' },
  { num: 6, label: '残差 & 归一化', icon: '🔄' },
  { num: 7, label: '输出预测', icon: '🎯' },
];

export default function Home() {
  const { currentStep, setCurrentStep } = useTransformerStore();

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-card border-r border-border p-6 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Transformer</h2>
        <p className="text-xs text-muted-foreground mb-6">逐步理解架构原理</p>
        <ul className="space-y-2">
          {STEPS.map((step) => (
            <li key={step.num}>
              <button
                onClick={() => setCurrentStep(step.num)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  currentStep === step.num
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : currentStep > step.num
                    ? 'bg-secondary'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep === step.num
                      ? 'bg-primary-foreground text-primary'
                      : currentStep > step.num
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </span>
                  <span className="text-sm">{step.icon} {step.label}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-1">📖 示例输入</p>
          <p className="text-xs text-blue-700 font-mono">&quot;我 爱 人工智能&quot;</p>
          <p className="text-xs text-blue-600 mt-1">维度 d=8，2 个注意力头</p>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-amber-900 mb-1">💡 说明</p>
          <p className="text-xs text-amber-700">
            实际 Transformer 使用 512+ 维度和 8+ 头。这里缩小到 8 维、2 头，方便观察每一步的数据变化。
          </p>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <h1 className="text-2xl font-bold mb-1">Transformer 架构原理演示</h1>
            <p className="text-muted-foreground text-sm mb-3">
              当前：{STEPS[currentStep - 1].icon} {STEPS[currentStep - 1].label}
            </p>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {currentStep === 1 && <Step1Tokenization />}
          {currentStep === 2 && <Step2PositionalEncoding />}
          {currentStep === 3 && <Step3SelfAttention />}
          {currentStep === 4 && <Step4MultiHead />}
          {currentStep === 5 && <Step5FeedForward />}
          {currentStep === 6 && <Step6ResidualNorm />}
          {currentStep === 7 && <Step7Output />}
        </div>
      </main>
    </div>
  );
}
