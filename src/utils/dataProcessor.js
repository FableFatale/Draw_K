// StockTermsData被TermMatcher类间接使用
import { TermMatcher, StockTerms } from './stockTerms.js';
import { TimeChartProcessor } from './timeChartProcessor.js';

export class DataProcessor {
    constructor() {
        this.patterns = {
            price: /(\d+(?:\.\d+)?)/g,
            trend: /(震荡上涨|震荡下跌|震荡上行|震荡下行|上涨|下跌|震荡|横盘|涨|跌|牛市|熊市)/,
            period: /(\d+)\s*(?:天|日|个交易日|交易日)/,
            volume: /成交量|交易量|量/,
            openPrice: /开盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            closePrice: /收盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            highPrice: /最高价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            lowPrice: /最低价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            technicalIndicators: /(MACD|CCI|KDJ|RSI|BOLL|布林带)/gi
        };
    }

    processUserInput(input, forceRefresh = false) {
        try {
            console.log('Processing user input:', input);
            
            // 使用改进的术语识别
            const complexPattern = TermMatcher.extractComplexPattern(input);
            console.log('Complex pattern extracted:', complexPattern);
            
            // 如果识别到分时图需求
            if (complexPattern.chartType === 'intraday') {
                console.log('Generating intraday chart...');
                return this.generateIntradayChart(input, complexPattern);
            }
            
            // 如果识别到技术指标需求
            if (Object.keys(complexPattern.technicalIndicators).length > 0) {
                console.log('Generating chart with technical indicators...');
                return this.generateChartWithIndicators(input, complexPattern);
            }
            
            // 检查是否是分时图请求（兼容旧逻辑）
            if (TimeChartProcessor.isTimeChartRequest(input)) {
                console.log('Processing time series request:', input);
                
                let chartData = TimeChartProcessor.processTimeChart(input);
                if (!chartData) {
                    // 如果没有明确的时间范围，使用默认时间范围
                    chartData = TimeChartProcessor.processTimeChart('09:30-15:00 ' + input);
                }
                
                if (chartData) {
                    return chartData;
                }
            }

            // 如果不是分时图请求，按照常规K线处理
            const terms = StockTerms.extractTerms(input);
            
            // 验证术语组合的合理性
            const validationResult = this.validateTermCombination(terms);
            if (!validationResult.isValid) {
                console.warn('术语组合不合理:', validationResult.conflicts);
            }

            // 分析用户输入
            const analysis = this.analyzeInput(input);
            
            // 添加识别到的术语信息
            analysis.recognizedTerms = terms;
            
            // 添加复杂模式信息
            analysis.complexPattern = complexPattern;

            // 生成图表数据
            return this.generateChartData(analysis);
        } catch (error) {
            console.error('处理用户输入时出错:', error);
            return this.generateSampleData();
        }
    }

    /**
     * 生成分时图
     */
    generateIntradayChart(input, complexPattern) {
        console.log('Generating intraday chart with pattern:', complexPattern);
        
        const { timeRange, technicalIndicators } = complexPattern;
        
        if (!timeRange) {
            console.error('No time range found in complex pattern');
            return this.generateSampleData();
        }
        
        console.log('Time range:', timeRange);
        console.log('Technical indicators:', technicalIndicators);
        
        // 分析用户输入中的趋势信息
        const analysis = this.analyzeInput(input);
        console.log('Trend analysis:', analysis.trend);
        
        try {
            // 生成分时数据，传入趋势信息
            const timeData = this.generateIntradayData(timeRange, analysis.trend);
            console.log('Generated time data length:', timeData.length);
            
            // 如果有MACD金叉需求，在特定时间点添加信号
            if (technicalIndicators.macd && technicalIndicators.macd.signals.includes('goldenCross')) {
                console.log('Adding MACD golden cross signal');
                this.addMACDGoldenCrossToTimeData(timeData, timeRange);
            }
            
            const result = {
                title: `${timeRange.session || '分时图'} (${timeRange.startTime}-${timeRange.endTime}) - ${analysis.trend}`,
                chartType: 'time',
                timeData: timeData,
                timeRange: timeRange,
                technicalIndicators: technicalIndicators,
                trend: analysis.trend, // 添加趋势信息
                // 添加MACD指标数据
                macdData: technicalIndicators.macd ? this.generateMACDData(timeData) : null
            };
            
            console.log('Generated intraday chart data:', result);
            return result;
        } catch (error) {
            console.error('Error generating intraday chart:', error);
            return this.generateSampleData();
        }
    }

    /**
     * 生成带技术指标的K线图
     */
    generateChartWithIndicators(input, complexPattern) {
        console.log('Generating chart with indicators, pattern:', complexPattern);
        
        // 先生成基础K线数据
        const analysis = this.analyzeInput(input);
        analysis.complexPattern = complexPattern;
        
        const baseData = this.generateChartData(analysis);
        console.log('Base chart data generated:', {
            hasData: !!baseData.data,
            dataLength: baseData.data?.length,
            hasVolumes: !!baseData.volumes
        });
        
        // 添加技术指标
        if (complexPattern.technicalIndicators.macd) {
            console.log('Generating MACD data for K-line chart...');
            baseData.macdData = this.generateMACDDataForKLine(baseData.data);
            console.log('MACD data generated:', {
                hasMacdData: !!baseData.macdData,
                difLength: baseData.macdData?.dif?.length,
                deaLength: baseData.macdData?.dea?.length,
                histogramLength: baseData.macdData?.histogram?.length,
                sampleDif: baseData.macdData?.dif?.slice(30, 35),
                sampleDea: baseData.macdData?.dea?.slice(30, 35)
            });
            
            // 如果有金叉信号需求，标记金叉点
            if (complexPattern.technicalIndicators.macd.signals.includes('goldenCross')) {
                baseData.macdSignals = this.findMACDGoldenCross(baseData.macdData);
                console.log('MACD signals generated:', baseData.macdSignals?.length);
            }
        }
        
        baseData.technicalIndicators = complexPattern.technicalIndicators;
        
        console.log('Final chart data with indicators:', {
            title: baseData.title,
            chartType: baseData.chartType,
            hasMacdData: !!baseData.macdData,
            hasTechnicalIndicators: !!baseData.technicalIndicators,
            technicalIndicators: baseData.technicalIndicators
        });
        
        return baseData;
    }

    /**
     * 生成分时数据
     */
    generateIntradayData(timeRange, trend = '震荡') {
        console.log('Generating intraday data for time range:', timeRange, 'with trend:', trend);
        
        const data = [];
        const startTime = timeRange.startTime;
        const endTime = timeRange.endTime;
        
        console.log('Start time:', startTime, 'End time:', endTime);
        
        // 将时间转换为分钟数
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        
        console.log('Start minutes:', startMinutes, 'End minutes:', endMinutes);
        
        if (startMinutes >= endMinutes) {
            console.error('Invalid time range: start >= end');
            // 创建默认的30分钟数据
            const defaultStart = this.timeToMinutes('09:30');
            const defaultEnd = this.timeToMinutes('10:00');
            return this.generateDefaultIntradayData(defaultStart, defaultEnd, trend);
        }
        
        let basePrice = 100;
        let currentMinutes = startMinutes;
        const totalMinutes = endMinutes - startMinutes;
        
        while (currentMinutes <= endMinutes) {
            const timeStr = this.minutesToTime(currentMinutes);
            const progress = (currentMinutes - startMinutes) / totalMinutes;
            
            // 根据趋势生成价格波动
            let trendFactor = this.getIntradayTrendFactor(trend, progress);
            const change = (Math.random() - 0.5) * 0.5; // 基础随机波动
            const price = basePrice * trendFactor + change;
            
            // 计算均价线，使其更平滑地反映趋势
            const avgPrice = basePrice * (1 + progress * this.getTrendDirection(trend) * 0.02);
            const volume = Math.floor(Math.random() * 1000 + 500);
            
            data.push({
                time: timeStr,
                price: parseFloat(price.toFixed(2)),
                avgPrice: parseFloat(avgPrice.toFixed(2)),
                volume: volume
            });
            
            basePrice = price;
            currentMinutes += 1; // 每分钟一个数据点
        }
        
        console.log('Generated', data.length, 'data points with trend:', trend);
        return data;
    }

    /**
     * 生成默认分时数据（当时间范围无效时）
     */
    generateDefaultIntradayData(startMinutes, endMinutes, trend = '震荡') {
        console.log('Generating default intraday data with trend:', trend);
        const data = [];
        let basePrice = 100;
        const totalMinutes = endMinutes - startMinutes;
        
        for (let currentMinutes = startMinutes; currentMinutes <= endMinutes; currentMinutes++) {
            const timeStr = this.minutesToTime(currentMinutes);
            const progress = (currentMinutes - startMinutes) / totalMinutes;
            
            let trendFactor = this.getIntradayTrendFactor(trend, progress);
            const change = (Math.random() - 0.5) * 0.5;
            const price = basePrice * trendFactor + change;
            const avgPrice = basePrice * (1 + progress * this.getTrendDirection(trend) * 0.02);
            const volume = Math.floor(Math.random() * 1000 + 500);
            
            data.push({
                time: timeStr,
                price: parseFloat(price.toFixed(2)),
                avgPrice: parseFloat(avgPrice.toFixed(2)),
                volume: volume
            });
            
            basePrice = price;
        }
        
        return data;
    }

    /**
     * 获取分时图趋势系数
     */
    getIntradayTrendFactor(trend, progress) {
        switch (trend) {
            case '上涨':
            case '涨':
                return 1 + progress * 0.03; // 3%的分时上涨
            case '震荡上涨':
            case '震荡上行':
                // 震荡上涨：总体上涨但有波动
                return 1 + progress * 0.02 + Math.sin(progress * Math.PI * 8) * 0.005;
            case '下跌':
            case '跌':
                return 1 - progress * 0.03; // 3%的分时下跌
            case '震荡下跌':
            case '震荡下行':
                // 震荡下跌：总体下跌但有波动
                return 1 - progress * 0.02 + Math.sin(progress * Math.PI * 8) * 0.005;
            case '震荡':
            case '横盘':
            default:
                return 1 + Math.sin(progress * Math.PI * 6) * 0.01; // 纯震荡
        }
    }

    /**
     * 获取趋势方向系数
     */
    getTrendDirection(trend) {
        switch (trend) {
            case '上涨':
            case '涨':
            case '震荡上涨':
            case '震荡上行':
                return 1; // 上涨方向
            case '下跌':
            case '跌':
            case '震荡下跌':
            case '震荡下行':
                return -1; // 下跌方向
            case '震荡':
            case '横盘':
            default:
                return 0; // 无明确方向
        }
    }

    /**
     * 为分时数据添加MACD金叉信号
     */
    addMACDGoldenCrossToTimeData(timeData, timeRange) {
        console.log('Adding MACD golden cross signal to time data');
        
        // 不在这里简单添加信号，而是在后续处理中根据实际MACD计算结果来确定
        // 这个方法现在主要用于在金叉点增强价格表现
        const targetIndex = Math.floor(timeData.length * 0.5); // 预期金叉位置
        if (timeData[targetIndex]) {
            // 在预期金叉点稍微拉升价格以增强视觉效果
            timeData[targetIndex].price *= 1.005; // 轻微拉升0.5%
            console.log(`Enhanced price at index ${targetIndex} for golden cross visualization`);
        }
    }

    /**
     * 生成MACD数据
     */
    generateMACDData(timeData) {
        const prices = timeData.map(item => item.price);
        return this.calculateMACD(prices);
    }

    /**
     * 为K线数据生成MACD
     */
    generateMACDDataForKLine(klineData) {
        const closePrices = klineData.map(item => item[1]); // 收盘价
        return this.calculateMACD(closePrices);
    }

    /**
     * 计算MACD指标 - 优化版本，支持长周期和更好的零轴显示，增加数值标准化
     */
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        console.log('Calculating Enhanced MACD for', prices.length, 'price points');
        console.log('Price range:', Math.min(...prices), 'to', Math.max(...prices));
        
        // 增强的长周期支持：只有当数据点少于slowPeriod + signalPeriod时才使用模拟
        const minimumDataPoints = slowPeriod + signalPeriod - 1; // 26 + 9 - 1 = 34
        if (prices.length < minimumDataPoints) {
            console.log('Using enhanced simulated MACD for short time period');
            return this.generateEnhancedSimulatedMACD(prices.length, prices);
        }

        const ema12 = this.calculateEMA(prices, fastPeriod);
        const ema26 = this.calculateEMA(prices, slowPeriod);
        
        console.log('EMA12 calculated with', ema12.filter(v => v > 0).length, 'valid values');
        console.log('EMA26 calculated with', ema26.filter(v => v > 0).length, 'valid values');
        
        // 计算DIF (EMA12 - EMA26)，并进行强标准化处理
        const dif = [];
        const basePrices = prices.slice(slowPeriod - 1); // 获取有效价格段用于标准化
        const avgPrice = basePrices.reduce((sum, price) => sum + price, 0) / basePrices.length;
        
        // 先计算原始DIF值以了解其变化范围
        const rawDifValues = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < slowPeriod - 1) {
                rawDifValues[i] = 0;
            } else {
                const ema12Value = ema12[i] || 0;
                const ema26Value = ema26[i] || 0;
                rawDifValues[i] = ema12Value - ema26Value;
            }
        }
        
        // 计算有效DIF值的标准差用于标准化
        const validRawDif = rawDifValues.filter(v => v !== 0);
        const rawDifMean = validRawDif.reduce((sum, val) => sum + val, 0) / validRawDif.length;
        const rawDifStd = Math.sqrt(validRawDif.reduce((sum, val) => sum + Math.pow(val - rawDifMean, 2), 0) / validRawDif.length);
        
        console.log('Raw DIF statistics:', {
            mean: rawDifMean.toFixed(4),
            std: rawDifStd.toFixed(4),
            range: [Math.min(...validRawDif).toFixed(4), Math.max(...validRawDif).toFixed(4)]
        });
        
        // 使用Z-score标准化，然后缩放到极小范围，贴近零轴
        for (let i = 0; i < prices.length; i++) {
            if (i < slowPeriod - 1) {
                dif[i] = 0;
            } else {
                // Z-score标准化: (value - mean) / std
                const zScore = (rawDifValues[i] - rawDifMean) / rawDifStd;
                // 极小的缩放因子，让线条非常贴近零轴
                dif[i] = zScore * 0.1; // 从0.3降低到0.1，10倍缩小
            }
        }
        
        // 计算DEA (DIF的9日EMA)
        const dea = this.calculateDEA(dif, slowPeriod, signalPeriod);
        
        // 对DEA也进行去趋势化处理，确保围绕零轴
        const validDea = dea.filter(v => v !== 0);
        if (validDea.length > 0) {
            const deaMean = validDea.reduce((sum, val) => sum + val, 0) / validDea.length;
            console.log('DEA mean before detrending:', deaMean.toFixed(4));
            
            // 去除DEA的趋势，让其围绕零轴，并大幅缩小
            for (let i = 0; i < dea.length; i++) {
                if (dea[i] !== 0) {
                    dea[i] = (dea[i] - deaMean) * 0.5; // 从0.8降低到0.5，进一步缩小
                }
            }
        }
        
        // 计算MACD柱状图 (DIF - DEA) * 2
        const histogram = dif.map((difVal, i) => {
            const hist = (difVal - dea[i]) * 2;
            return isNaN(hist) ? 0 : hist;
        });

        // 优化数据，确保在长周期下有完整的显示
        const validStartIndex = slowPeriod + signalPeriod - 2;
        
        console.log('MACD calculation completed with enhanced algorithm and normalization:');
        console.log('- Data length:', prices.length);
        console.log('- Average price for normalization:', avgPrice.toFixed(2));
        console.log('- Valid data starts from index:', validStartIndex);
        console.log('- DIF non-zero values:', dif.filter(v => v !== 0).length);
        console.log('- DEA non-zero values:', dea.filter(v => v !== 0).length);
        console.log('- Normalized DIF range:', Math.min(...dif.filter(v => v !== 0)).toFixed(4), 'to', Math.max(...dif.filter(v => v !== 0)).toFixed(4));
        console.log('- Normalized DEA range:', Math.min(...dea.filter(v => v !== 0)).toFixed(4), 'to', Math.max(...dea.filter(v => v !== 0)).toFixed(4));

        return {
            dif: dif,
            dea: dea,
            histogram: histogram,
            validStartIndex: validStartIndex,
            normalizationFactor: avgPrice // 记录标准化因子，便于理解
        };
    }

    /**
     * 计算EMA
     */
    calculateEMA(prices, period) {
        const ema = new Array(prices.length);
        const multiplier = 2 / (period + 1);
        
        console.log(`Calculating EMA${period} for ${prices.length} prices`);
        
        if (prices.length < period) {
            console.log(`Not enough data for EMA${period}, need ${period} but got ${prices.length}`);
            return ema.fill(0);
        }
        
        // 第一个EMA值使用SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += prices[i];
        }
        ema[period - 1] = sum / period;
        
        console.log(`EMA${period} initial value at index ${period - 1}:`, ema[period - 1]);
        
        // 后续EMA值使用递归公式: EMA[today] = (price[today] * multiplier) + (EMA[yesterday] * (1 - multiplier))
        for (let i = period; i < prices.length; i++) {
            ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
        }
        
        // 前period-1个值设为0
        for (let i = 0; i < period - 1; i++) {
            ema[i] = 0;
        }
        
        const validValues = ema.filter(v => v > 0);
        console.log(`EMA${period} calculated: ${validValues.length} valid values, range: ${Math.min(...validValues).toFixed(4)} - ${Math.max(...validValues).toFixed(4)}`);
        
        return ema;
    }

    /**
     * 填充数组到指定长度
     */
    padArray(array, targetLength, fillValue = 0) {
        const result = [...array];
        while (result.length < targetLength) {
            result.unshift(fillValue);
        }
        return result;
    }

    /**
     * 计算DEA - 改进版本，更准确的DEA计算
     */
    calculateDEA(dif, slowPeriod, signalPeriod) {
        console.log('Calculating enhanced DEA');
        const dea = new Array(dif.length).fill(0);
        
        // 找到第一个有效DIF值的位置
        const validDifStartIndex = slowPeriod - 1;
        
        if (validDifStartIndex >= dif.length) {
            console.log('Not enough data for DEA calculation');
            return dea;
        }
        
        // DEA的计算从 validDifStartIndex + signalPeriod - 1 开始
        const deaStartIndex = validDifStartIndex + signalPeriod - 1;
        
        if (deaStartIndex >= dif.length) {
            console.log('Not enough data for DEA start calculation');
            return dea;
        }
        
        // 计算DEA初始值（使用前signalPeriod个有效DIF值的平均值）
        let sum = 0;
        for (let i = validDifStartIndex; i < validDifStartIndex + signalPeriod; i++) {
            sum += dif[i];
        }
        dea[deaStartIndex] = sum / signalPeriod;
        
        // 使用EMA公式计算后续DEA值
        const multiplier = 2 / (signalPeriod + 1);
        for (let i = deaStartIndex + 1; i < dif.length; i++) {
            dea[i] = (dif[i] * multiplier) + (dea[i - 1] * (1 - multiplier));
        }
        
        console.log('DEA calculation completed:');
        console.log('- Valid DEA starts from index:', deaStartIndex);
        console.log('- DEA non-zero values:', dea.filter(v => v !== 0).length);
        
        return dea;
    }

    /**
     * 生成增强的模拟MACD数据（当数据不足时）- 支持基于真实价格的模拟，使用标准化数值
     */
    generateEnhancedSimulatedMACD(length, realPrices = null) {
        console.log('Generating enhanced simulated MACD data for', length, 'points');
        
        const dif = [];
        const dea = [];
        const histogram = [];
        
        // 如果有真实价格，使用价格趋势来生成更真实的MACD
        let priceBasedTrend = 0;
        if (realPrices && realPrices.length > 1) {
            const startPrice = realPrices[0];
            const endPrice = realPrices[realPrices.length - 1];
            priceBasedTrend = (endPrice - startPrice) / startPrice; // 价格变化趋势
            console.log('Using price-based trend for MACD simulation:', priceBasedTrend.toFixed(4));
        }
        
        // 使用极小的数值范围，确保线条非常贴近零轴
        const maxRange = 0.3; // 最大范围±0.3，确保贴近零轴
        
        for (let i = 0; i < length; i++) {
            const progress = i / Math.max(length - 1, 1);
            
            // 基于真实价格趋势创建更准确的MACD模式
            let difValue;
            
            if (priceBasedTrend > 0.01) {
                // 上涨趋势：创建明显的金叉模式
                if (progress < 0.3) {
                    difValue = -maxRange * 0.6 + (progress * maxRange * 0.8); // 从负值上升
                } else if (progress < 0.7) {
                    const crossProgress = (progress - 0.3) / 0.4;
                    difValue = maxRange * 0.2 + (crossProgress * maxRange * 0.6); // 金叉后继续上升
                } else {
                    const lateProgress = (progress - 0.7) / 0.3;
                    difValue = maxRange * 0.8 + (lateProgress * maxRange * 0.2) + (Math.sin(lateProgress * Math.PI * 4) * maxRange * 0.05); // 高位震荡
                }
            } else if (priceBasedTrend < -0.01) {
                // 下跌趋势：创建死叉模式
                if (progress < 0.3) {
                    difValue = maxRange * 0.6 - (progress * maxRange * 0.8); // 从正值下降
                } else {
                    const declineProgress = (progress - 0.3) / 0.7;
                    difValue = -maxRange * 0.2 - (declineProgress * maxRange * 0.4); // 持续下跌
                }
            } else {
                // 震荡趋势：创建多次金叉死叉
                const cycles = progress * Math.PI * 6;
                difValue = Math.sin(cycles) * maxRange * 0.4 + (Math.random() - 0.5) * maxRange * 0.1;
            }
            
            // DEA线：更平滑的跟随趋势
            let deaValue;
            if (i < 8) {
                deaValue = 0; // 前8个点DEA为0
            } else {
                // DEA跟随DIF但更平滑
                const deaProgress = (i - 8) / Math.max(length - 9, 1);
                if (priceBasedTrend > 0.01) {
                    // 上涨趋势的DEA
                    if (deaProgress < 0.4) {
                        deaValue = -maxRange * 0.4 + (deaProgress * maxRange * 0.6);
                    } else if (deaProgress < 0.8) {
                        const midProgress = (deaProgress - 0.4) / 0.4;
                        deaValue = maxRange * 0.2 + (midProgress * maxRange * 0.4);
                    } else {
                        const lateProgress = (deaProgress - 0.8) / 0.2;
                        deaValue = maxRange * 0.6 + (lateProgress * maxRange * 0.2);
                    }
                } else if (priceBasedTrend < -0.01) {
                    // 下跌趋势的DEA
                    deaValue = maxRange * 0.4 - (deaProgress * maxRange * 0.6);
                } else {
                    // 震荡趋势的DEA
                    const cycles = deaProgress * Math.PI * 6;
                    deaValue = Math.sin(cycles - Math.PI/4) * maxRange * 0.25; // 滞后于DIF
                }
            }
            
            // 添加小幅随机波动
            const noise = (Math.random() - 0.5) * maxRange * 0.02;
            difValue += noise;
            if (deaValue !== 0) {
                deaValue += noise * 0.5;
            }
            
            dif.push(parseFloat(difValue.toFixed(4)));
            dea.push(parseFloat(deaValue.toFixed(4)));
            histogram.push(parseFloat(((difValue - deaValue) * 2).toFixed(4)));
        }
        
        console.log('Generated enhanced simulated MACD with normalized values:');
        console.log('- Price trend factor:', priceBasedTrend.toFixed(4));
        console.log('- Max range used:', maxRange);
        console.log('- DIF range:', Math.min(...dif).toFixed(4), 'to', Math.max(...dif).toFixed(4));
        console.log('- DEA range:', Math.min(...dea.filter(v => v !== 0)).toFixed(4), 'to', Math.max(...dea).toFixed(4));
        
        return { 
            dif, 
            dea, 
            histogram,
            validStartIndex: 8 // 模拟数据的有效起始索引
        };
    }

    /**
     * 查找MACD金叉点
     */
    findMACDGoldenCross(macdData) {
        const signals = [];
        const { dif, dea } = macdData;
        
        console.log('Searching for golden cross in MACD data...');
        console.log('Data length:', dif.length);
        
        for (let i = 1; i < dif.length; i++) {
            // 检查DIF是否上穿DEA（金叉）
            const prevDifBelowDea = dif[i-1] <= dea[i-1];
            const currDifAboveDea = dif[i] > dea[i];
            
            if (prevDifBelowDea && currDifAboveDea) {
                console.log(`Golden cross found at index ${i}:`);
                console.log(`  Previous: DIF=${dif[i-1]}, DEA=${dea[i-1]}`);
                console.log(`  Current: DIF=${dif[i]}, DEA=${dea[i]}`);
                
                signals.push({
                    index: i,
                    type: 'goldenCross',
                    description: 'MACD金叉',
                    difValue: dif[i],
                    deaValue: dea[i]
                });
            }
        }
        
        // 如果没有找到真实的金叉，但用户明确要求金叉，则在合适位置模拟一个
        if (signals.length === 0) {
            console.log('No natural golden cross found, creating simulated cross');
            const simulatedIndex = Math.floor(dif.length * 0.5); // 中间位置
            if (simulatedIndex < dif.length) {
                signals.push({
                    index: simulatedIndex,
                    type: 'goldenCross',
                    description: 'MACD金叉（模拟）',
                    difValue: dif[simulatedIndex],
                    deaValue: dea[simulatedIndex],
                    isSimulated: true
                });
                console.log(`Simulated golden cross at index ${simulatedIndex}`);
            }
        }
        
        console.log(`Total golden cross signals found: ${signals.length}`);
        return signals;
    }

    /**
     * 时间转分钟数
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * 分钟数转时间
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * 生成示例数据
     * @returns {Object} 示例图表数据
     */
    generateSampleData() {
        return this.generateChartData({
            prices: [100],
            trend: '上涨',
            period: 20,
            hasVolume: true,
            volumeTrend: 'normal',
            volumePriceRelation: 'normal',
            specificPrices: {
                open: null,
                close: null,
                high: null,
                low: null
            }
        });
    }

    /**
     * 分析用户输入
     * @param {string} input - 用户输入
     * @returns {Object} 分析结果
     */
    analyzeInput(input) {
        const analysis = {
            prices: [],
            trend: '震荡',
            period: 20,
            hasVolume: false,
            volumeTrend: 'normal',
            volumePriceRelation: 'normal',
            specificPrices: {
                open: null,
                close: null,
                high: null,
                low: null
            }
        };

        // 提取价格信息
        const priceMatches = input.match(this.patterns.price);
        if (priceMatches) {
            analysis.prices = priceMatches.map(p => parseFloat(p));
        }

        // 提取趋势信息
        const trendMatch = input.match(this.patterns.trend);
        if (trendMatch) {
            analysis.trend = trendMatch[1];
        }

        // 提取时间周期
        const periodMatch = input.match(this.patterns.period);
        if (periodMatch) {
            analysis.period = parseInt(periodMatch[1]);
        }

        // 检查是否包含成交量
        analysis.hasVolume = this.patterns.volume.test(input);

        // 提取具体价格
        const openMatch = input.match(this.patterns.openPrice);
        if (openMatch) analysis.specificPrices.open = parseFloat(openMatch[1]);

        const closeMatch = input.match(this.patterns.closePrice);
        if (closeMatch) analysis.specificPrices.close = parseFloat(closeMatch[1]);

        const highMatch = input.match(this.patterns.highPrice);
        if (highMatch) analysis.specificPrices.high = parseFloat(highMatch[1]);

        const lowMatch = input.match(this.patterns.lowPrice);
        if (lowMatch) analysis.specificPrices.low = parseFloat(lowMatch[1]);

        return analysis;
    }

    /**
     * 验证术语组合的合理性
     * @param {Array} terms - 识别到的术语
     * @returns {Object} 验证结果
     */
    validateTermCombination(terms) {
        return {
            isValid: true,
            conflicts: []
        };
    }

    /**
     * 生成图表数据
     * @param {Object} analysis - 分析结果
     * @returns {Object} 图表数据
     */
    generateChartData(analysis) {
        const { prices, trend, period, hasVolume, specificPrices } = analysis;

        // 确定起始价格
        let startPrice = 100; // 默认价格
        if (prices.length > 0) {
            startPrice = prices[0];
        } else if (specificPrices.open) {
            startPrice = specificPrices.open;
        }

        // 生成K线数据
        const klineData = this.generateKLineData(startPrice, trend, period, specificPrices);

        // 生成成交量数据
        const volumeData = hasVolume ? this.generateVolumeData(klineData, trend) : null;

        // 生成日期数据
        const dates = this.generateDates(period);

        console.log('Generated chart data summary:', {
            title: this.generateTitle(analysis),
            dataLength: klineData.length,
            hasVolumes: !!volumeData,
            chartType: 'candlestick',
            trend: analysis.trend,
            period: analysis.period
        });

        return {
            title: this.generateTitle(analysis),
            data: klineData,
            volumes: volumeData, // 修改字段名以匹配 chartConfig.js 的期望
            dates: dates,
            chartType: 'candlestick', // 默认为K线图
            analysis: analysis
        };
    }

    /**
     * 生成K线数据
     * @param {number} startPrice - 起始价格
     * @param {string} trend - 趋势
     * @param {number} period - 周期
     * @param {Object} specificPrices - 具体价格
     * @returns {Array} K线数据
     */
    generateKLineData(startPrice, trend, period, specificPrices) {
        const data = [];
        let currentPrice = startPrice;

        for (let i = 0; i < period; i++) {
            const dayData = this.generateDayData(currentPrice, trend, i, period, specificPrices);
            data.push(dayData);
            currentPrice = dayData[1]; // 收盘价作为下一天的基准
        }

        return data;
    }

    /**
     * 生成单日数据
     * @param {number} basePrice - 基准价格
     * @param {string} trend - 趋势
     * @param {number} dayIndex - 天数索引
     * @param {number} totalDays - 总天数
     * @param {Object} specificPrices - 具体价格
     * @returns {Array} [开盘价, 收盘价, 最低价, 最高价]
     */
    generateDayData(basePrice, trend, dayIndex, totalDays, specificPrices) {
        // 趋势系数
        const trendFactor = this.getTrendFactor(trend, dayIndex, totalDays);

        // 随机波动
        const volatility = 0.02; // 2%的波动率
        const randomFactor = 1 + (Math.random() - 0.5) * volatility;

        // 计算开盘价
        let open = basePrice * trendFactor * randomFactor;

        // 计算收盘价
        let close = open * (1 + (Math.random() - 0.5) * volatility);

        // 计算最高价和最低价
        let high = Math.max(open, close) * (1 + Math.random() * volatility);
        let low = Math.min(open, close) * (1 - Math.random() * volatility);

        // 应用具体价格（如果是最后一天）
        if (dayIndex === totalDays - 1) {
            if (specificPrices.open !== null) open = specificPrices.open;
            if (specificPrices.close !== null) close = specificPrices.close;
            if (specificPrices.high !== null) high = specificPrices.high;
            if (specificPrices.low !== null) low = specificPrices.low;
        }

        // 确保价格关系正确
        high = Math.max(high, open, close);
        low = Math.min(low, open, close);

        // ECharts candlestick 数据格式: [open, close, low, high]
        return [
            parseFloat(open.toFixed(2)),
            parseFloat(close.toFixed(2)),
            parseFloat(low.toFixed(2)),
            parseFloat(high.toFixed(2))
        ];
    }

    /**
     * 获取趋势系数
     * @param {string} trend - 趋势
     * @param {number} dayIndex - 天数索引
     * @param {number} totalDays - 总天数
     * @returns {number} 趋势系数
     */
    getTrendFactor(trend, dayIndex, totalDays) {
        const progress = dayIndex / totalDays;

        switch (trend) {
            case '上涨':
            case '涨':
            case '牛市':
                return 1 + progress * 0.2; // 20%的上涨
            case '震荡上涨':
            case '震荡上行':
                // 震荡上涨：整体上涨但有波动
                return 1 + progress * 0.15 + Math.sin(progress * Math.PI * 6) * 0.03;
            case '下跌':
            case '跌':
            case '熊市':
                return 1 - progress * 0.2; // 20%的下跌
            case '震荡下跌':
            case '震荡下行':
                // 震荡下跌：整体下跌但有波动
                return 1 - progress * 0.15 + Math.sin(progress * Math.PI * 6) * 0.03;
            case '震荡':
            case '横盘':
            default:
                return 1 + Math.sin(progress * Math.PI * 4) * 0.05; // 震荡
        }
    }

    /**
     * 生成成交量数据
     * @param {Array} klineData - K线数据
     * @param {string} trend - 趋势
     * @returns {Array} 成交量数据
     */
    generateVolumeData(klineData, trend) {
        return klineData.map((dayData, index) => {
            const baseVolume = 1000000; // 基础成交量
            const priceChange = (dayData[1] - dayData[0]) / dayData[0];
            const volumeMultiplier = 1 + Math.abs(priceChange) * 2; // 价格变化越大，成交量越大
            const randomFactor = 0.8 + Math.random() * 0.4;

            return Math.floor(baseVolume * volumeMultiplier * randomFactor);
        });
    }

    /**
     * 生成日期数据
     * @param {number} period - 周期
     * @returns {Array} 日期数组
     */
    generateDates(period) {
        const dates = [];
        const today = new Date();

        for (let i = period - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
    }

    /**
     * 生成图表标题
     * @param {Object} analysis - 分析结果
     * @returns {string} 图表标题
     */
    generateTitle(analysis) {
        const { trend, period, prices } = analysis;
        let title = `${period}日K线图`;

        if (prices.length > 0) {
            title += ` (起始价格: ${prices[0]})`;
        }

        if (trend !== '震荡') {
            title += ` - ${trend}趋势`;
        }

        return title;
    }
}
