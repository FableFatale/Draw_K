# 项目结构

## 目录组织

```
/
├── src/                    # 源代码目录
│   ├── components/         # 可复用组件
│   │   ├── Chart/         # 图表相关组件
│   │   ├── Input/         # 输入组件
│   │   └── UI/            # 通用UI组件
│   ├── utils/             # 工具函数
│   │   ├── chartConfig.js # 图表配置
│   │   ├── dataProcessor.js # 数据处理
│   │   └── helpers.js     # 辅助函数
│   ├── styles/            # 样式文件
│   │   ├── global.css     # 全局样式
│   │   └── components/    # 组件样式
│   ├── assets/            # 静态资源
│   ├── main.js           # 应用入口
│   └── index.html        # HTML模板
├── public/                # 公共资源
├── dist/                 # 构建输出目录
├── .kiro/                # Kiro配置
├── package.json          # 项目配置
├── vite.config.js        # 构建配置
└── README.md            # 项目说明
```

## 文件命名约定
- 组件文件使用PascalCase: `ChartRenderer.js`
- 工具函数使用camelCase: `dataProcessor.js`
- 样式文件使用kebab-case: `chart-styles.css`
- 常量文件使用UPPER_CASE: `CHART_CONSTANTS.js`

## 代码组织原则
- 按功能模块组织代码
- 保持组件的单一职责
- 工具函数独立可测试
- 样式与逻辑分离
- 配置文件集中管理
- 进行测试无误后在更改代码

## 关键文件说明
- `src/main.js` - 应用程序入口点
- `src/components/Chart/` - K线图渲染核心组件
- `src/utils/dataProcessor.js` - 处理用户输入转换为图表数据
- `src/utils/chartConfig.js` - 图表配置和样式定义