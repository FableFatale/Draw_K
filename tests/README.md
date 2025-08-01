# K线图绘制工具测试文档

本目录包含K线图绘制工具的测试用例，使用Vitest作为测试框架。

## 测试结构

测试目录结构如下：

```
tests/
├── unit/                    # 单元测试
│   ├── components/          # 组件测试
│   │   └── Chart/           # 图表相关组件测试
│   │       └── ChartRenderer.test.js
│   ├── utils/               # 工具函数测试
│   │   ├── chartConfig.test.js
│   │   ├── dataProcessor.test.js
│   │   └── patternRecognizer.test.js
│   └── main.test.js         # 主应用测试
└── README.md                # 本文档
```

## 运行测试

### 运行所有测试

```bash
npm test
```

### 以监视模式运行测试

```bash
npm run test:watch
```

### 生成测试覆盖率报告

```bash
npm test -- --coverage
```

覆盖率报告将生成在 `coverage` 目录下。

## 测试内容

### DataProcessor 测试

测试数据处理模块的功能，包括：

- 用户输入解析
- 趋势分析
- 价格提取
- 数据生成逻辑
- OHLC数据格式验证
- 成交量计算

### PatternRecognizer 测试

测试K线形态识别器的功能，包括：

- 突破形态识别
- 均线条件检查
- 成交量条件检查
- 综合形态识别

### ChartConfig 测试

测试图表配置生成功能，包括：

- 基本图表配置生成
- 成交量图表配置
- 均线指标配置
- 网格布局配置
- 数据缩放配置
- MACD指标配置
- 工具提示格式化

### ChartRenderer 测试

测试图表渲染器的功能，包括：

- 初始化和资源管理
- 图表渲染
- 响应式处理
- 错误处理
- 全屏切换
- 图表重置

### 主应用测试

测试主应用类的功能，包括：

- 初始化和DOM元素绑定
- 事件处理
- 用户输入处理
- 图表生成
- 通知显示
- 特殊形态生成

## 边界情况测试

测试用例包含对各种边界情况的处理，如：

- 空输入
- 格式错误的输入
- 缺失DOM元素
- 无效数据
- 异常处理