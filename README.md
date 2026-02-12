# Agent 演示系统

可视化展示 AI Agent 工作原理的教学系统，帮助深入理解 Agent 的完整执行流程。

## ✨ 功能特性

### 🤖 完整的 Agent 工作流程（8 个步骤）

1. **任务输入** - 接收用户任务
2. **任务分析** - 🧠 LLM 分析任务意图和复杂度
3. **计划制定** - 🧠 LLM 制定详细执行计划
4. **工具准备** - 展示可用工具列表
5. **ReAct 循环** - 🧠 LLM 驱动的思考-行动-观察循环
6. **工具调用** - 实时展示工具调用过程
7. **结果评估** - 展示执行结果
8. **任务完成** - 🧠 LLM 生成最终答案

### 🔍 核心教学特性

- **LLM 交互可视化** - 展示每个步骤中 Agent 和 LLM 的完整对话
  - 📤 发送给 LLM 的完整 Prompt
  - 📥 LLM 返回的原始响应
  - ⚙️ 解析后的结构化结果
- **ReAct 模式演示** - 可视化思考（Thought）→ 行动（Action）→ 观察（Observation）循环
- **工具调用跟踪** - 实时显示工具调用决策和结果
- **完整执行轨迹** - 记录 Agent 的每一步决策过程

### 🛠️ 可用工具

系统内置 6 个模拟工具：
- 🔍 **web_search** - 网络搜索
- 🧮 **calculator** - 计算器
- 🌤️ **get_weather** - 天气查询
- 📧 **send_email** - 发送邮件
- 📖 **read_file** - 读取文件
- ✍️ **write_file** - 写入文件

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Qwen API Key（从[阿里云 DashScope](https://dashscope.aliyun.com/)获取）

### 安装

```bash
# 克隆仓库
git clone https://github.com/taoyun1980-lgtm/agent-demo.git
cd agent-demo

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 Qwen API Key
```

### 运行

```bash
npm run dev
```

打开 http://localhost:3001 查看演示。

## 🎓 学习目标

通过这个系统，你将理解：

1. **Agent 架构** - LLM 如何成为 Agent 的"大脑"
2. **ReAct 模式** - 推理和行动的结合
3. **工具使用** - Agent 如何自主决定调用工具
4. **Prompt 工程** - 如何构建有效的 Agent Prompt
5. **任务规划** - LLM 如何分解和规划任务

## 📚 技术栈

- **框架**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **LLM**: Qwen API (qwen-plus)
- **部署**: Vercel

## 🔐 环境变量

```bash
QWEN_API_KEY=your_api_key_here          # 必需：Qwen API 密钥
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1  # 可选
QWEN_MODEL=qwen-plus                     # 可选
```

## 📖 使用示例

### 示例任务 1：天气查询
```
输入：帮我查询北京今天的天气
```
- Agent 会分析任务类型（信息查询）
- 制定计划（调用天气 API）
- 执行 ReAct 循环（思考 → 调用 get_weather 工具 → 观察结果）
- 生成最终答案

### 示例任务 2：数学计算
```
输入：计算 (123 + 456) * 2
```
- Agent 识别为计算任务
- 决定使用 calculator 工具
- 返回计算结果

### 示例任务 3：信息搜索
```
输入：搜索 AI Agent 的工作原理
```
- Agent 使用 web_search 工具
- 综合搜索结果生成答案

## 🎯 核心价值

这个系统不仅仅是"回答问题"的聊天机器人，而是展示了：

- ✅ **自主决策** - LLM 自己决定何时调用什么工具
- ✅ **任务规划** - 复杂任务分解为多个步骤
- ✅ **工具组合** - 多个工具协同完成任务
- ✅ **透明性** - 完整的决策过程可视化

## 📝 License

MIT

## 🙏 致谢

本项目使用 Claude Opus 4.6 协助开发。
