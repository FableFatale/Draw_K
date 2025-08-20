# K线图绘制工具

一个交互式K线图生成工具，允许用户通过输入想法和需求来动态创建和定制K线图（蜡烛图）。

## 功能特点

- 通过自然语言描述生成专业K线图
- 支持多种趋势类型：上涨、下跌、震荡、横盘
- 可定制K线数量、价格区间和成交量
- 自动计算并显示技术指标（MA5、MA10、MA20、MA250）
- 支持图表交互：缩放、平移、全屏显示
- 响应式设计，适配各种屏幕尺寸

## 技术栈

- HTML5/CSS3/JavaScript
- ECharts - K线图渲染引擎
- Vite - 构建工具
- Vitest - 单元测试框架
- Playwright - 端到端测试框架

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/k-line-chart-tool.git
cd k-line-chart-tool
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

5. 运行单元测试
```bash
npm test
```

6. 运行端到端测试
```bash
npm run test:e2e
```

7. 使用UI模式运行端到端测试
```bash
npm run test:e2e:ui
```

## 使用方法

1. 在输入框中描述你想要的K线图，例如：
   - "上涨趋势，30天，开盘价100，收盘价120"
   - "下跌趋势，15天，不要成交量"
   - "震荡行情，20天，价格在90-110之间"

2. 点击"生成K线图"按钮

3. 查看生成的K线图，可以使用图表工具栏进行交互

## 输入示例

- **趋势类型**：上涨、下跌、震荡、横盘
- **周期**：如"30天"、"20个交易日"
- **价格**：如"开盘价100"、"收盘价120"、"最高价125"、"最低价95"
- **成交量**：如"带成交量"、"不要成交量"、"放量上涨"、"缩量下跌"

## 项目结构

```
/
├── src/                    # 源代码目录
│   ├── components/         # 可复用组件
│   │   └── Chart/          # 图表相关组件
│   ├── utils/              # 工具函数
│   │   ├── chartConfig.js  # 图表配置
│   │   ├── dataProcessor.js # 数据处理
│   │   └── patternRecognizer.js # 形态识别
│   ├── styles/             # 样式文件
│   │   └── global.css      # 全局样式
│   └── main.js            # 应用入口
├── tests/                 # 测试目录
│   └── unit/              # 单元测试
├── index.html             # HTML入口
├── vite.config.js         # Vite配置
└── vitest.config.js       # Vitest配置
```

## 许可证

MIT

# Draw_K
