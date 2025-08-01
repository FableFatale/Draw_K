# K线图绘制工具端到端测试

本目录包含K线图绘制工具的端到端测试用例，使用Playwright作为测试框架。

## 测试结构

端到端测试目录结构如下：

```
tests/e2e/
├── basic.spec.js           # 基本功能测试
├── chart-interaction.spec.js # 图表交互功能测试
├── responsive.spec.js      # 响应式布局测试
├── error-handling.spec.js  # 错误处理和边界情况测试
├── natural-language.spec.js # 自然语言输入测试
└── README.md               # 本文档
```

## 运行测试

### 运行所有端到端测试

```bash
npm run test:e2e
```

### 使用UI模式运行测试

```bash
npm run test:e2e:ui
```

### 运行特定测试文件

```bash
npx playwright test tests/e2e/basic.spec.js
```

### 在特定浏览器中运行测试

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 在移动设备模拟器中运行测试

```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 测试内容

### 基本功能测试 (basic.spec.js)

测试应用的基本功能，包括：

- 页面加载和初始状态
- 生成K线图（上涨趋势、下跌趋势）
- 使用示例芯片
- 输入验证
- 按回车键生成图表

### 图表交互功能测试 (chart-interaction.spec.js)

测试图表的交互功能，包括：

- 图表工具栏按钮（重置、全屏）
- 图表缩放功能
- K线数据点击交互
- 数据缩放滑块交互

### 响应式布局测试 (responsive.spec.js)

测试应用在不同屏幕尺寸下的响应式布局，包括：

- 桌面布局
- 平板布局
- 移动设备布局
- 在不同屏幕尺寸下生成图表
- 通知系统在不同屏幕尺寸下的表现

### 错误处理和边界情况测试 (error-handling.spec.js)

测试应用对各种错误和边界情况的处理，包括：

- 处理无效输入
- 处理缺少关键信息的输入
- 处理极端输入值
- 处理特殊字符和长文本
- 连续多次生成图表
- 特殊形态请求

### 自然语言输入测试 (natural-language.spec.js)

测试应用对各种自然语言输入格式的处理，包括：

- 各种趋势描述
- 各种周期描述
- 价格描述
- 成交量描述
- 复杂自然语言描述

## 注意事项

1. 运行端到端测试前，确保已安装所有依赖：
   ```bash
   npm install
   ```

2. 首次运行测试时，Playwright会自动安装所需的浏览器。

3. 测试结果和报告将保存在 `playwright-report` 目录中。

4. 如果测试失败，可以在 `test-results` 目录中查看截图和视频。