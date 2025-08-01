import { TermMatcher } from './stockTerms.js';

export class DataProcessor {
    constructor() {
        this.patterns = {
            price: /(\d+(?:\.\d+)?)/g,
            trend: /(上涨|下跌|震荡|横盘|涨|跌|牛市|熊市)/,
            period: /(\d+)\s*(?:天|日|个交易日|交易日)/,
            volume: /成交量|交易量|量/,
            openPrice: /开盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            closePrice: /收盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            highPrice: /最高价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            lowPrice: /最低价?\s*[:：]?\s*(\d+(?:\.\d+)?)/,
            volumeTrend: /(缩量|放量|量能萎缩|量能放大|成交量降低|成交量增加|成交量减少|量价|无量|天量)/,
            volumePattern: /(缩量上涨|缩量下跌|放量上涨|放量下跌|量价齐升|量价背离|无量上涨|无量下跌)/,
            // 添加技术指标识别
            technicalIndicators: /(MACD|CCI|KDJ|RSI|BOLL|布林带)/gi
        };
    }

    processUserInput(input) {
        try {
            const analysis = this.analyzeInput(input);
            return this.generateChartData(analysis);
        } catch (error) {
            console.error('处理用户输入时出错:', error);
            return this.generateSampleData();
        }
    }

    analyzeInput(input) {
        // 使用新的术语匹配器
        const trend = TermMatcher.matchTrend(input);
        const period = TermMatcher.matchTimeframe(input);
        const priceInfo = TermMatcher.matchPrices(input);
        const volumeInfo = TermMatcher.matchVolume(input);
        const technicalIndicators = TermMatcher.matchTechnicalIndicators(input);
        const movingAverages = TermMatcher.matchMovingAverages(input);

        // 兼容旧的价格提取逻辑
        const prices = input.match(this.patterns.price);
        const openMatch = input.match(this.patterns.openPrice);
        const closeMatch = input.match(this.patterns.closePrice);
        const highMatch = input.match(this.patterns.highPrice);
        const lowMatch = input.match(this.patterns.lowPrice);

        // 使用新的术语匹配结果，如果没有匹配到则使用默认值
        const normalizedTrend = trend || '震荡';
        const finalVolumeTrend = volumeInfo.volumeTrend || 'normal';
        const finalVolumePriceRelation = volumeInfo.volumePriceRelation || 'normal';

        return {
            prices: prices ? prices.map(p => parseFloat(p)) : [],
            trend: normalizedTrend,
            period: period || 30, // 默认周期为30天
            hasVolume: !input.includes('不要成交量') &&
                !input.includes('无成交量') &&
                !input.includes('不显示成交量'),
            volumeTrend: finalVolumeTrend,
            volumePriceRelation: finalVolumePriceRelation,
            specificPrices: {
                open: priceInfo.open || (openMatch ? parseFloat(openMatch[1]) : null),
                close: priceInfo.close || (closeMatch ? parseFloat(closeMatch[1]) : null),
                high: priceInfo.high || (highMatch ? parseFloat(highMatch[1]) : null),
                low: priceInfo.low || (lowMatch ? parseFloat(lowMatch[1]) : null)
            },
            // 添加技术指标信息
            technicalIndicators: technicalIndicators,
            movingAverages: movingAverages
        };
    }

    generateChartData(analysis) {
        const { prices, trend, period, hasVolume, specificPrices, volumeTrend, volumePriceRelation, technicalIndicators } = analysis;

        // 基础价格设定
        let basePrice = 100;
        if (specificPrices && specificPrices.open !== null) {
            basePrice = specificPrices.open;
        } else if (prices.length > 0) {
            basePrice = prices[0];
        }

        // 目标价格设定（如果有）
        let targetPrice = null;
        if (specificPrices && specificPrices.close !== null) {
            targetPrice = specificPrices.close;
        }

        // 创建分析上下文，包含所有需要在生成过程中共享的信息
        const analysisContext = {
            ...analysis,
            targetPrice,
            prevDayClose: basePrice
        };

        const data = [];
        const volumes = [];
        const dates = [];

        // 生成日期数组 - 确保生成指定数量的交易日
        const endDate = new Date();
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - period * 1.5);

        while (dates.length < period && currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                dates.push(currentDate.toISOString().split('T')[0]);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        while (dates.length < period) {
            const lastDate = new Date(dates[dates.length - 1]);
            lastDate.setDate(lastDate.getDate() + 1);
            if (lastDate.getDay() !== 0 && lastDate.getDay() !== 6) {
                dates.push(lastDate.toISOString().split('T')[0]);
            } else {
                lastDate.setDate(lastDate.getDate() + 1);
                if (lastDate.getDay() !== 0 && lastDate.getDay() !== 6) {
                    dates.push(lastDate.toISOString().split('T')[0]);
                }
            }
        }

        dates.splice(0, dates.length - period);

        for (let i = 0; i < period; i++) {
            const dayData = this.generateDayData(basePrice, trend, i, period, analysisContext);
            data.push(dayData.ohlc);

            if (hasVolume) {
                volumes.push(dayData.volume);
            }

            // 更新基准价格和上下文
            basePrice = dayData.ohlc[1];
            analysisContext.prevDayClose = basePrice;

            // 保存当前价格变化，用于后续成交量生成
            analysisContext.priceChanges = analysisContext.priceChanges || [];
            analysisContext.priceChanges.push((dayData.ohlc[1] - dayData.ohlc[0]) / dayData.ohlc[0]);
        }

        // 计算技术指标
        const indicators = {};

        // 计算均线指标
        const closePrices = data.map(d => d[1]); // 收盘价
        indicators.MA5 = this.calculateMA(closePrices, 5);
        indicators.MA10 = this.calculateMA(closePrices, 10);
        indicators.MA20 = this.calculateMA(closePrices, 20);

        // 添加MA250长期均线
        indicators.MA250 = this.calculateMA(closePrices, Math.min(250, closePrices.length));

        // 根据用户需求添加技术指标
        if (technicalIndicators && technicalIndicators.length > 0) {
            // 添加MACD指标
            if (technicalIndicators.includes('MACD')) {
                indicators.MACD = this.calculateMACD(closePrices);
            }

            // 添加CCI指标
            if (technicalIndicators.includes('CCI')) {
                indicators.CCI = this.calculateCCI(data);
            }
            
            // 添加KDJ指标
            if (technicalIndicators.includes('KDJ')) {
                indicators.KDJ = this.calculateKDJ(data);
            }
            
            // 添加RSI指标
            if (technicalIndicators.includes('RSI')) {
                indicators.RSI = this.calculateRSI(closePrices);
            }
            
            // 添加布林带指标
            if (technicalIndicators.includes('BOLL')) {
                indicators.BOLL = this.calculateBOLL(closePrices);
            }
        }

        // 返回完整的图表数据
        return {
            dates,
            data,
            volumes: hasVolume ? volumes : null,
            indicators,
            title: this.generateTitle(analysis),
            technicalIndicators: technicalIndicators || []
        };
    }

    generateDayData(basePrice, trend, dayIndex, totalDays, analysis = null) {
        // 根据天数调整波动率，使波动与天数联动
        const progress = dayIndex / totalDays;
        const volatility = 0.02 + (progress * 0.01); // 波动率随天数增加而增加

        let trendFactor = this.getTrendFactor(trend, dayIndex, totalDays);

        // 计算目标价格（如果有）
        let targetPrice = null;
        if (analysis && analysis.specificPrices && analysis.specificPrices.close && dayIndex === totalDays - 1) {
            targetPrice = analysis.specificPrices.close;
        }

        // 如果有目标价格，调整价格走势以达到目标
        if (targetPrice !== null && dayIndex === totalDays - 1) {
            // 最后一天直接使用目标价格
            const finalTrend = (targetPrice - basePrice) / basePrice;
            const adjustedTrendFactor = finalTrend / totalDays * (dayIndex + 1);
            trendFactor = adjustedTrendFactor;
        }

        let open = basePrice * (1 + (Math.random() - 0.5) * volatility);

        if (dayIndex === 0 && analysis && analysis.specificPrices && analysis.specificPrices.open) {
            open = analysis.specificPrices.open;
        }

        let close = open * (1 + trendFactor + (Math.random() - 0.5) * volatility);

        if (dayIndex === totalDays - 1 && analysis && analysis.specificPrices && analysis.specificPrices.close) {
            close = analysis.specificPrices.close;
        }

        // 根据天数和趋势调整高低点
        let highVolatility = volatility * (1 + progress * 0.5); // 高点波动率随天数增加
        let lowVolatility = volatility * (1 - progress * 0.2); // 低点波动率随天数减少

        let high = Math.max(open, close) * (1 + Math.random() * highVolatility);
        let low = Math.min(open, close) * (1 - Math.random() * lowVolatility);

        if (analysis && analysis.specificPrices) {
            if (analysis.specificPrices.high && analysis.specificPrices.high >= Math.max(open, close)) {
                high = analysis.specificPrices.high;
            }
            if (analysis.specificPrices.low && analysis.specificPrices.low <= Math.min(open, close)) {
                low = analysis.specificPrices.low;
            }
        }

        const volume = this.generateVolume(open, close, trend, dayIndex, totalDays, analysis);

        return {
            ohlc: [open, close, low, high],
            volume
        };
    }

    getTrendFactor(trend, dayIndex, totalDays) {
        const progress = dayIndex / totalDays;

        // 添加随机性和周期性，使走势更自然
        const randomNoise = (Math.random() - 0.5) * 0.003;
        const cyclicalFactor = Math.sin(progress * Math.PI * 2) * 0.002;

        switch (trend) {
            case '上涨':
                // 上涨趋势：开始缓慢，中间加速，最后趋于平缓
                const upCurve = 0.003 + Math.pow(progress, 1.5) * 0.015;
                return upCurve + randomNoise + cyclicalFactor;

            case '下跌':
                // 下跌趋势：开始急跌，然后减缓
                const downCurve = -0.003 - Math.pow(progress, 0.8) * 0.015;
                return downCurve + randomNoise - cyclicalFactor;

            case '震荡':
                // 震荡趋势：多重正弦波叠加，与天数紧密联动
                const primaryWave = Math.sin(progress * Math.PI * 4) * 0.006;
                const secondaryWave = Math.sin(progress * Math.PI * 8) * 0.003;
                return primaryWave + secondaryWave + randomNoise;

            case '横盘':
                // 横盘趋势：小幅随机波动，保持在一定范围内
                const baseNoise = (Math.random() - 0.5) * 0.002;
                const boundedNoise = Math.min(Math.max(baseNoise, -0.003), 0.003);
                return boundedNoise + Math.sin(progress * Math.PI * 6) * 0.001;

            default:
                return randomNoise;
        }
    }

    generateVolume(open, close, trend, dayIndex, totalDays, analysis = null) {
        const baseVolume = 600000;
        const priceChangePercent = Math.abs((close - open) / open);
        const progress = dayIndex / totalDays;

        // 增强价格变化对成交量的影响
        const priceImpact = 1 + priceChangePercent * 3;

        let volumeTrendImpact = 1;
        if (analysis && analysis.volumeTrend) {
            switch (analysis.volumeTrend) {
                case 'shrinking':
                    // 更强的缩量效果，与天数更紧密联动
                    volumeTrendImpact = 1.5 - progress * 1.2;
                    break;
                case 'expanding':
                    // 更强的放量效果，与天数更紧密联动
                    volumeTrendImpact = 0.5 + progress * 1.5;
                    break;
                default:
                    // 默认情况下，成交量与K线走势联动
                    volumeTrendImpact = 0.8 + Math.sin(progress * Math.PI * 2) * 0.3;
            }
        } else {
            // 根据K线走势调整成交量
            switch (trend) {
                case '上涨':
                    // 上涨趋势：成交量逐渐增加
                    volumeTrendImpact = 0.7 + progress * 0.8;
                    break;
                case '下跌':
                    // 下跌趋势：成交量先增加后减少
                    if (progress < 0.5) {
                        volumeTrendImpact = 0.8 + progress * 0.8;
                    } else {
                        volumeTrendImpact = 1.2 - (progress - 0.5) * 0.8;
                    }
                    break;
                case '震荡':
                    // 震荡趋势：成交量波动与价格波动同步
                    volumeTrendImpact = 0.8 + Math.sin(progress * Math.PI * 4) * 0.4;
                    break;
                case '横盘':
                    // 横盘趋势：成交量逐渐萎缩
                    volumeTrendImpact = 0.9 - progress * 0.4;
                    break;
                default:
                    volumeTrendImpact = 1;
            }
        }

        let volumePriceAdjust = 1;
        if (analysis && analysis.volumePriceRelation) {
            switch (analysis.volumePriceRelation) {
                case 'divergent':
                    if (priceChangePercent > 0.01) {
                        volumePriceAdjust = 0.5;
                    } else {
                        volumePriceAdjust = 1.5;
                    }
                    break;
                case 'consistent':
                    volumePriceAdjust = 1 + priceChangePercent * 3;
                    break;
                default:
                    volumePriceAdjust = 1;
            }
        }

        const randomFactor = 0.95 + Math.random() * 0.1;

        const volume = Math.floor(baseVolume * priceImpact * volumeTrendImpact * volumePriceAdjust * randomFactor);

        return Math.max(200000, Math.min(5000000, volume));
    }

    generateTitle(analysis) {
        const { trend, period, volumeTrend, volumePriceRelation, technicalIndicators } = analysis;
        let title = `${trend}趋势 - ${period}日K线图`;

        if (volumeTrend === 'shrinking') {
            title += ' | 缩量';
        } else if (volumeTrend === 'expanding') {
            title += ' | 放量';
        }

        if (volumePriceRelation === 'divergent') {
            title += ' | 量价背离';
        } else if (volumePriceRelation === 'consistent') {
            title += ' | 量价齐升';
        }

        // 添加技术指标信息到标题
        if (technicalIndicators && technicalIndicators.length > 0) {
            title += ` | ${technicalIndicators.join('+')}`;
        }

        return title;
    }

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

    /**
     * 计算MACD指标
     * @param {Array} closePrices - 收盘价数组
     * @returns {Object} - MACD指标数据
     */
    calculateMACD(closePrices) {
        // MACD参数
        const fastPeriod = 12;
        const slowPeriod = 26;
        const signalPeriod = 9;

        // 计算EMA
        const emaFast = this.calculateEMA(closePrices, fastPeriod);
        const emaSlow = this.calculateEMA(closePrices, slowPeriod);

        // 计算DIF (MACD Line)
        const dif = [];
        for (let i = 0; i < closePrices.length; i++) {
            if (i < slowPeriod - 1) {
                // 数据不足时，使用0
                dif.push(0);
            } else {
                dif.push(emaFast[i] - emaSlow[i]);
            }
        }

        // 计算DEA (Signal Line)
        const dea = this.calculateEMA(dif, signalPeriod);

        // 计算MACD柱状图 (Histogram)
        const macd = [];
        for (let i = 0; i < dif.length; i++) {
            macd.push((dif[i] - dea[i]) * 2); // 乘以2是为了放大视觉效果
        }

        return { dif, dea, macd };
    }

    /**
     * 计算指数移动平均线 (EMA)
     * @param {Array} data - 数据数组
     * @param {Number} period - 周期
     * @returns {Array} - EMA数据
     */
    calculateEMA(data, period) {
        const result = [];
        const k = 2 / (period + 1);

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                // 第一个点使用SMA
                result.push(data[0]);
            } else if (i < period) {
                // 数据不足时，使用SMA
                let sum = 0;
                for (let j = 0; j <= i; j++) {
                    sum += data[j];
                }
                result.push(sum / (i + 1));
            } else {
                // EMA = 前一日EMA + k * (今日收盘价 - 前一日EMA)
                result.push(result[i - 1] + k * (data[i] - result[i - 1]));
            }
        }

        return result;
    }

    /**
     * 计算CCI指标 (Commodity Channel Index)
     * @param {Array} klineData - K线数据数组 [open, close, low, high]
     * @param {Number} period - 周期，默认为14
     * @returns {Array} - CCI数据
     */
    calculateCCI(klineData, period = 14) {
        const result = [];

        // 计算典型价格 (TP)
        const typicalPrices = klineData.map(candle => {
            const high = candle[3];
            const low = candle[2];
            const close = candle[1];
            return (high + low + close) / 3;
        });

        // 计算移动平均 (SMA)
        const smaTP = [];
        for (let i = 0; i < typicalPrices.length; i++) {
            if (i < period - 1) {
                smaTP.push(typicalPrices[i]); // 使用当前值而不是null
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += typicalPrices[i - j];
                }
                smaTP.push(sum / period);
            }
        }

        // 计算平均偏差 (MD)
        for (let i = 0; i < typicalPrices.length; i++) {
            if (i < period - 1) {
                // 数据不足时，使用简化的计算方法
                let sumDeviation = 0;
                for (let j = 0; j <= i; j++) {
                    sumDeviation += Math.abs(typicalPrices[j] - smaTP[i]);
                }
                const meanDeviation = sumDeviation / (i + 1);

                // CCI = (TP - SMA(TP)) / (0.015 * MD)
                const cci = meanDeviation === 0 ? 0 : (typicalPrices[i] - smaTP[i]) / (0.015 * meanDeviation);
                result.push(cci);
            } else {
                let sumDeviation = 0;
                for (let j = 0; j < period; j++) {
                    sumDeviation += Math.abs(typicalPrices[i - j] - smaTP[i]);
                }
                const meanDeviation = sumDeviation / period;

                // CCI = (TP - SMA(TP)) / (0.015 * MD)
                const cci = meanDeviation === 0 ? 0 : (typicalPrices[i] - smaTP[i]) / (0.015 * meanDeviation);
                result.push(cci);
            }
        }

        return result;
    }
    
    /**
     * 计算KDJ指标
     * @param {Array} klineData - K线数据数组 [open, close, low, high]
     * @param {Number} periodK - K值计算周期，默认为9
     * @param {Number} periodD - D值计算周期，默认为3
     * @param {Number} periodJ - J值计算周期，默认为3
     * @returns {Object} - KDJ指标数据
     */
    calculateKDJ(klineData, periodK = 9, periodD = 3, periodJ = 3) {
        const rsv = [];
        const k = [];
        const d = [];
        const j = [];
        
        // 计算RSV
        for (let i = 0; i < klineData.length; i++) {
            if (i < periodK - 1) {
                // 数据不足时，使用50作为初始值
                rsv.push(50);
            } else {
                // 计算周期内的最高价和最低价
                let highest = -Infinity;
                let lowest = Infinity;
                
                for (let j = 0; j < periodK; j++) {
                    const high = klineData[i - j][3];
                    const low = klineData[i - j][2];
                    
                    highest = Math.max(highest, high);
                    lowest = Math.min(lowest, low);
                }
                
                // 当前收盘价
                const close = klineData[i][1];
                
                // 计算RSV值：(收盘价 - 最低价) / (最高价 - 最低价) * 100
                const rsvValue = highest === lowest ? 50 : ((close - lowest) / (highest - lowest)) * 100;
                rsv.push(rsvValue);
            }
        }
        
        // 计算K值、D值和J值
        for (let i = 0; i < klineData.length; i++) {
            if (i === 0) {
                // 第一个点使用RSV值作为初始值
                k.push(rsv[0]);
                d.push(rsv[0]);
                j.push(3 * rsv[0] - 2 * rsv[0]);
            } else {
                // K值 = 前一日K值 * (2/3) + 当日RSV * (1/3)
                const kValue = (k[i - 1] * (periodD - 1) + rsv[i]) / periodD;
                k.push(kValue);
                
                // D值 = 前一日D值 * (2/3) + 当日K值 * (1/3)
                const dValue = (d[i - 1] * (periodJ - 1) + kValue) / periodJ;
                d.push(dValue);
                
                // J值 = 3 * K值 - 2 * D值
                const jValue = 3 * kValue - 2 * dValue;
                j.push(jValue);
            }
        }
        
        return { k, d, j };
    }
    
    /**
     * 计算RSI指标 (Relative Strength Index)
     * @param {Array} closePrices - 收盘价数组
     * @param {Number} period - 周期，默认为14
     * @returns {Array} - RSI数据
     */
    calculateRSI(closePrices, period = 14) {
        const result = [];
        const gains = [];
        const losses = [];
        
        // 计算价格变化
        for (let i = 0; i < closePrices.length; i++) {
            if (i === 0) {
                gains.push(0);
                losses.push(0);
                result.push(0);
                continue;
            }
            
            const change = closePrices[i] - closePrices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
            
            if (i < period) {
                // 数据不足时，使用简单平均
                let avgGain = 0;
                let avgLoss = 0;
                
                for (let j = 1; j <= i; j++) {
                    avgGain += gains[j];
                    avgLoss += losses[j];
                }
                
                avgGain /= i;
                avgLoss /= i;
                
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push(rsi);
            } else {
                // 使用平滑RSI计算方法
                const avgGain = (gains[i - 1] * (period - 1) + gains[i]) / period;
                const avgLoss = (losses[i - 1] * (period - 1) + losses[i]) / period;
                
                const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                result.push(rsi);
            }
        }
        
        return result;
    }
    
    /**
     * 计算布林带指标 (Bollinger Bands)
     * @param {Array} closePrices - 收盘价数组
     * @param {Number} period - 周期，默认为20
     * @param {Number} stdDev - 标准差倍数，默认为2
     * @returns {Object} - 布林带数据
     */
    calculateBOLL(closePrices, period = 20, stdDev = 2) {
        const middle = []; // 中轨（简单移动平均线）
        const upper = [];  // 上轨
        const lower = [];  // 下轨
        
        for (let i = 0; i < closePrices.length; i++) {
            if (i < period - 1) {
                // 数据不足时，使用当前收盘价
                middle.push(closePrices[i]);
                upper.push(closePrices[i]);
                lower.push(closePrices[i]);
            } else {
                // 计算中轨（简单移动平均线）
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += closePrices[i - j];
                }
                const ma = sum / period;
                middle.push(ma);
                
                // 计算标准差
                let squareSum = 0;
                for (let j = 0; j < period; j++) {
                    squareSum += Math.pow(closePrices[i - j] - ma, 2);
                }
                const standardDeviation = Math.sqrt(squareSum / period);
                
                // 计算上轨和下轨
                upper.push(ma + stdDev * standardDeviation);
                lower.push(ma - stdDev * standardDeviation);
            }
        }
        
        return { middle, upper, lower };
    }
}