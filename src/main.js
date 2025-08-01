/**
 * K线图绘制工具应用入口
 * 负责应用初始化、事件绑定和流程控制
 */
import { ChartRenderer } from '@components/Chart/ChartRenderer.js';
import { DataProcessor } from '@utils/dataProcessor.js';

class KLineApp {
    /**
     * 构造函数
     */
    constructor() {
        // 初始化组件
        this.chartRenderer = null;
        this.dataProcessor = new DataProcessor();
        
        // DOM元素引用
        this.userInput = null;
        this.generateBtn = null;
        this.chartContainer = null;
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', () => {
            // 获取DOM元素
            this.userInput = document.getElementById('userInput');
            this.generateBtn = document.getElementById('generateBtn');
            this.chartContainer = document.getElementById('chartContainer');
            
            // 确保所有必要的DOM元素都存在
            if (!this.userInput || !this.generateBtn || !this.chartContainer) {
                console.error('无法找到必要的DOM元素');
                return;
            }
            
            // 初始化图表渲染器
            this.chartRenderer = new ChartRenderer('chartContainer');
            
            // 绑定事件
            this.bindEvents();
            
            // 显示欢迎图表
            this.showWelcomeChart();
        });
    }

    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        // 生成按钮点击事件
        this.generateBtn.addEventListener('click', () => {
            this.handleGenerate();
        });
        
        // 输入框回车键事件
        this.userInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // 阻止默认的换行行为
                this.handleGenerate();
            }
        });
        
        // 示例芯片点击事件
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const exampleText = chip.getAttribute('data-example');
                if (exampleText) {
                    this.userInput.value = exampleText;
                    this.userInput.focus();
                }
            });
        });
    }

    /**
     * 处理生成图表事件
     */
    handleGenerate() {
        const userInputText = this.userInput.value.trim();
        
        // 检查输入是否为空
        if (!userInputText) {
            this.showNotification('请输入K线图描述', 'error');
            return;
        }
        
        // 输入验证
        if (userInputText.length < 5) {
            this.showNotification('描述太短，请提供更详细的信息', 'error');
            return;
        }
        
        // 检查是否包含关键信息
        const hasTrend = /上涨|下跌|震荡|横盘|涨|跌|牛市|熊市|盘整|反弹|回调/.test(userInputText);
        const hasPeriod = /\d+\s*(?:天|日|个交易日|交易日|周期|k线|K线|根|条)/.test(userInputText);
        
        if (!hasTrend && !hasPeriod) {
            this.showNotification('提示：添加趋势(如"上涨")和周期(如"30天")可获得更准确的结果', 'info');
        }
        
        try {
            // 显示加载状态
            this.chartContainer.classList.add('loading');
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = '生成中...';
            
            // 处理用户输入，生成图表数据
            setTimeout(() => {
                let chartData;
                
                // 检查是否是特定形态请求
                const isBreakoutPattern = userInputText.includes('阳线 + 阴线 + 大阳线') || 
                                         userInputText.includes('突破形态') ||
                                         userInputText.includes('凹形量能') ||
                                         userInputText.includes('5日线在250日线上方');
                
                if (isBreakoutPattern) {
                    // 生成特定的突破形态
                    chartData = this.generateBreakoutPattern();
                } else {
                    // 正常处理用户输入
                    chartData = this.dataProcessor.processUserInput(userInputText);
                }
                
                // 渲染图表
                this.chartRenderer.renderChart(chartData);
                
                // 移除加载状态
                this.chartContainer.classList.remove('loading');
                this.generateBtn.disabled = false;
                this.generateBtn.textContent = '生成K线图';
                
                // 显示成功提示
                this.showNotification('K线图生成成功！', 'success');
                
                // 检查用户输入中是否包含技术指标需求
                const technicalTerms = ['均线', 'MACD', 'CCI', 'KDJ', 'RSI', 'BOLL', '布林带'];
                const mentionedTerms = technicalTerms.filter(term => 
                    userInputText.toLowerCase().includes(term.toLowerCase())
                );
                
                if (mentionedTerms.length > 0) {
                    // 显示已添加的技术指标
                    const addedIndicators = [];
                    
                    if (chartData.technicalIndicators && chartData.technicalIndicators.length > 0) {
                        addedIndicators.push(...chartData.technicalIndicators);
                    }
                    
                    if (chartData.indicators && chartData.indicators.MA5) {
                        addedIndicators.push('均线');
                    }
                    
                    if (addedIndicators.length > 0) {
                        this.showNotification(`已添加${addedIndicators.join('、')}指标`, 'info');
                    }
                }
            }, 500); // 添加短暂延迟以显示加载效果
        } catch (error) {
            console.error('生成图表时出错:', error);
            this.showNotification('生成图表时出错，请尝试不同的描述', 'error');
            
            // 移除加载状态
            this.chartContainer.classList.remove('loading');
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = '生成K线图';
        }
    }
    
    /**
     * 显示通知消息
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, info)
     */
    showNotification(message, type = 'info') {
        // 检查是否已存在通知元素，如果有则移除
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * 显示欢迎图表
     */
    showWelcomeChart() {
        // 生成示例数据
        const sampleData = this.dataProcessor.generateSampleData();
        
        // 渲染欢迎图表
        setTimeout(() => {
            this.chartRenderer.renderChart(sampleData);
        }, 500);
    }
    
    /**
     * 生成特定的突破形态
     * 阳线 + 阴线 + 大阳线/涨停板，且第三根K线的收盘价突破第二根K线的最高点
     */
    generateBreakoutPattern() {
        // 基础价格
        const basePrice = 100;
        const period = 20;
        
        const data = [];
        const volumes = [];
        const dates = [];
        
        // 生成日期
        const endDate = new Date();
        for (let i = 0; i < period; i++) {
            const date = new Date();
            date.setDate(endDate.getDate() - (period - i));
            dates.push(date.toISOString().split('T')[0]);
        }
        
        // 生成前期走势
        for (let i = 0; i < period - 3; i++) {
            // 生成随机K线
            const isUp = Math.random() > 0.5;
            const open = basePrice * (0.95 + Math.random() * 0.1);
            const close = open * (isUp ? (1 + Math.random() * 0.02) : (1 - Math.random() * 0.02));
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);
            
            data.push([open, close, low, high]);
            
            // 生成随机成交量
            volumes.push(300000 + Math.random() * 400000);
        }
        
        // 生成特定形态：阳线 + 阴线 + 大阳线
        // 第一根：阳线
        const k1Open = basePrice * 0.98;
        const k1Close = k1Open * 1.02; // 2%上涨
        const k1High = k1Close * 1.01;
        const k1Low = k1Open * 0.99;
        data.push([k1Open, k1Close, k1Low, k1High]);
        volumes.push(800000); // 高成交量
        
        // 第二根：阴线
        const k2Open = k1Close * 1.01;
        const k2Close = k2Open * 0.98; // 2%下跌
        const k2High = k2Open * 1.01;
        const k2Low = k2Close * 0.99;
        data.push([k2Open, k2Close, k2Low, k2High]);
        volumes.push(300000); // 低成交量
        
        // 第三根：大阳线/涨停板，收盘价突破第二根K线的最高点
        const k3Open = k2Close * 0.99;
        const k3Close = Math.max(k2High * 1.02, k3Open * 1.05); // 确保突破第二根K线最高点
        const k3High = k3Close * 1.01;
        const k3Low = k3Open * 0.99;
        data.push([k3Open, k3Close, k3Low, k3High]);
        volumes.push(1000000); // 放量
        
        // 计算均线
        const closePrices = data.map(d => d[1]);
        const ma5 = this.calculateMA(closePrices, 5);
        const ma250 = [];
        
        // 生成MA250，确保在MA5下方
        for (let i = 0; i < closePrices.length; i++) {
            // 现在MA5在所有点都有值
            const ma5Value = ma5[i];
            ma250.push(ma5Value * 0.95); // MA250在MA5下方5%
        }
        
        return {
            dates,
            data,
            volumes,
            indicators: {
                MA5: ma5,
                MA10: this.calculateMA(closePrices, 10),
                MA20: this.calculateMA(closePrices, 20),
                MA250: ma250
            },
            title: '突破形态 - 阳线+阴线+大阳线 | 凹形量能'
        };
    }
    
    /**
     * 计算移动平均线
     * @param {Array} data - 数据数组
     * @param {Number} period - 周期
     * @returns {Array} - 移动平均线数据
     */
    calculateMA(data, period) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                // 第一个点直接使用当前值
                result.push(data[i]);
            } else if (i < period - 1) {
                // 数据点不足时，使用可用的数据点计算平均值
                let sum = 0;
                for (let j = 0; j <= i; j++) {
                    sum += data[j];
                }
                result.push(sum / (i + 1));
            } else {
                // 数据点足够时，使用完整周期计算
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j];
                }
                result.push(sum / period);
            }
        }
        return result;
    }
}

// 创建应用实例
const app = new KLineApp();

// 导出KLineApp类供测试使用
export { KLineApp };

// 导出应用实例（可选，用于调试）
export default app;