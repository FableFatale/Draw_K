/**
 * 分时图趋势分析器
 */
export class TimeSeriesAnalyzer {
    /**
     * 解析时间区间趋势描述
     * @param {string} input - 用户输入的趋势描述
     * @returns {Array} 返回趋势数组，每个元素包含开始时间、结束时间和趋势
     */
    static parseTimeTrends(input) {
        const trends = [];
        
        // 匹配时间区间和趋势的正则表达式
        const timeRangePattern = /(\d{1,2}[:.]?\d{2})\s*[-~至到]\s*(\d{1,2}[:.]?\d{2})\s*(拉升|上涨|回落|下跌|震荡|横盘|盘整|冲高|探底|反弹)/g;
        let match;

        while ((match = timeRangePattern.exec(input)) !== null) {
            // 标准化时间格式
            const startTime = this.normalizeTime(match[1]);
            const endTime = this.normalizeTime(match[2]);
            const trend = this.normalizeTrend(match[3]);

            if (startTime && endTime) {
                trends.push({
                    startTime,
                    endTime,
                    trend,
                    strength: this.getTrendStrength(trend),
                    volatility: this.getTrendVolatility(trend)
                });
            }
        }

        // 按时间排序
        trends.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return trends;
    }

    /**
     * 标准化时间格式为 HH:mm
     * @param {string} time - 输入的时间字符串
     * @returns {string} 标准化的时间字符串
     */
    static normalizeTime(time) {
        // 移除所有非数字字符
        const nums = time.replace(/[^\d]/g, '');
        
        if (nums.length === 3) {
            // 处理类似 "930" 的格式
            return `0${nums[0]}:${nums[1]}${nums[2]}`;
        } else if (nums.length === 4) {
            // 处理类似 "0930" 的格式
            return `${nums[0]}${nums[1]}:${nums[2]}${nums[3]}`;
        }
        
        return null;
    }

    /**
     * 标准化趋势描述
     * @param {string} trend - 输入的趋势描述
     * @returns {string} 标准化的趋势
     */
    static normalizeTrend(trend) {
        const trendMap = {
            '拉升': 'strongRise',
            '上涨': 'rise',
            '回落': 'fall',
            '下跌': 'strongFall',
            '震荡': 'volatile',
            '横盘': 'flat',
            '盘整': 'flat',
            '冲高': 'upAndDown',
            '探底': 'downAndUp',
            '反弹': 'bounce'
        };

        return trendMap[trend] || 'flat';
    }

    /**
     * 获取趋势强度
     * @param {string} trend - 趋势类型
     * @returns {number} 趋势强度系数
     */
    static getTrendStrength(trend) {
        const strengthMap = {
            'strongRise': 0.015,   // 拉升
            'rise': 0.008,         // 上涨
            'fall': -0.008,        // 回落
            'strongFall': -0.015,  // 下跌
            'volatile': 0.005,     // 震荡
            'flat': 0.002,         // 横盘
            'upAndDown': 0.012,    // 冲高
            'downAndUp': -0.012,   // 探底
            'bounce': 0.01         // 反弹
        };

        return strengthMap[trend] || 0.002;
    }

    /**
     * 获取趋势波动率
     * @param {string} trend - 趋势类型
     * @returns {number} 波动率系数
     */
    static getTrendVolatility(trend) {
        const volatilityMap = {
            'strongRise': 0.008,   // 拉升时波动较大
            'rise': 0.005,         // 上涨时波动中等
            'fall': 0.005,         // 回落时波动中等
            'strongFall': 0.008,   // 下跌时波动较大
            'volatile': 0.01,      // 震荡时波动最大
            'flat': 0.002,         // 横盘时波动最小
            'upAndDown': 0.009,    // 冲高时波动较大
            'downAndUp': 0.009,    // 探底时波动较大
            'bounce': 0.007        // 反弹时波动中等偏上
        };

        return volatilityMap[trend] || 0.003;
    }

    /**
     * 生成符合趋势的价格序列
     * @param {Object} trend - 趋势对象
     * @param {number} basePrice - 基准价格
     * @param {number} minutes - 分钟数
     * @returns {Array} 价格序列
     */
    static generateTrendPrices(trend, basePrice, minutes) {
        const prices = [];
        const strength = trend.strength;
        const volatility = trend.volatility;

        for (let i = 0; i < minutes; i++) {
            const progress = i / minutes;
            let trendFactor = 0;

            switch (trend.trend) {
                case 'strongRise':
                case 'rise':
                    // 上涨趋势：开始缓慢，中间加速，最后趋缓
                    trendFactor = strength * (1 + Math.pow(progress, 1.5));
                    break;
                case 'fall':
                case 'strongFall':
                    // 下跌趋势：开始快，然后减缓
                    trendFactor = strength * (1 + Math.pow(1 - progress, 0.8));
                    break;
                case 'volatile':
                    // 震荡趋势：正弦波动
                    trendFactor = strength * Math.sin(progress * Math.PI * 4);
                    break;
                case 'flat':
                    // 横盘趋势：小幅随机波动
                    trendFactor = strength * (Math.random() - 0.5);
                    break;
                case 'upAndDown':
                    // 冲高回落
                    trendFactor = strength * (Math.sin(progress * Math.PI) - progress * 0.5);
                    break;
                case 'downAndUp':
                    // 探底回升
                    trendFactor = strength * (-Math.sin(progress * Math.PI) + progress * 0.5);
                    break;
                case 'bounce':
                    // 反弹：开始快，然后减缓
                    trendFactor = strength * Math.pow(1 - Math.pow(progress - 1, 2), 0.5);
                    break;
            }

            // 添加随机波动
            const randomFactor = (Math.random() - 0.5) * volatility;
            const price = basePrice * (1 + trendFactor + randomFactor);
            
            prices.push(parseFloat(price.toFixed(2)));
            basePrice = price; // 更新基准价格
        }

        return prices;
    }

    /**
     * 生成分时图数据
     * @param {Array} trends - 趋势数组
     * @param {number} basePrice - 初始基准价格
     * @returns {Array} 完整的分时图数据
     */
    static generateTimeSeriesData(trends, basePrice = 100) {
        if (!trends || trends.length === 0) return [];

        const timeSeriesData = [];
        let currentPrice = basePrice;
        let prevTime = '09:30'; // 默认开始时间

        for (const trend of trends) {
            // 计算时间段包含的分钟数
            const startMinutes = this.timeToMinutes(trend.startTime);
            const endMinutes = this.timeToMinutes(trend.endTime);
            const minutes = endMinutes - startMinutes;

            if (minutes <= 0) continue;

            // 生成这个时间段的价格序列
            const prices = this.generateTrendPrices(trend, currentPrice, minutes);

            // 生成时间序列
            for (let i = 0; i < minutes; i++) {
                const time = this.minutesToTime(startMinutes + i);
                const price = prices[i];
                const avgPrice = this.calculateAveragePrice(timeSeriesData, price);
                const volume = this.generateVolume(price, currentPrice, trend.trend);

                timeSeriesData.push({
                    time,
                    price,
                    avgPrice,
                    volume
                });

                currentPrice = price;
            }
        }

        return timeSeriesData;
    }

    /**
     * 将时间转换为分钟数（相对于09:30）
     * @param {string} time - 时间字符串 (HH:mm)
     * @returns {number} 分钟数
     */
    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60 + minutes) - (9 * 60 + 30);
    }

    /**
     * 将分钟数转换为时间字符串
     * @param {number} minutes - 分钟数（相对于09:30）
     * @returns {string} 时间字符串 (HH:mm)
     */
    static minutesToTime(minutes) {
        const totalMinutes = minutes + (9 * 60 + 30);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * 计算平均价格
     * @param {Array} existingData - 现有数据
     * @param {number} currentPrice - 当前价格
     * @returns {number} 平均价格
     */
    static calculateAveragePrice(existingData, currentPrice) {
        if (existingData.length === 0) return currentPrice;

        const totalPrices = existingData.reduce((sum, item) => sum + item.price, 0) + currentPrice;
        return parseFloat((totalPrices / (existingData.length + 1)).toFixed(2));
    }

    /**
     * 生成成交量
     * @param {number} currentPrice - 当前价格
     * @param {number} prevPrice - 上一个价格
     * @param {string} trend - 趋势类型
     * @returns {number} 成交量
     */
    static generateVolume(currentPrice, prevPrice, trend) {
        const baseVolume = 500000; // 基础成交量
        const priceChange = Math.abs((currentPrice - prevPrice) / prevPrice);
        
        // 根据趋势调整成交量
        let volumeMultiplier = 1;
        switch (trend) {
            case 'strongRise':
                volumeMultiplier = 2 + priceChange * 20;
                break;
            case 'rise':
                volumeMultiplier = 1.5 + priceChange * 15;
                break;
            case 'fall':
                volumeMultiplier = 1.2 + priceChange * 10;
                break;
            case 'strongFall':
                volumeMultiplier = 1.8 + priceChange * 15;
                break;
            case 'volatile':
                volumeMultiplier = 1.3 + priceChange * 12;
                break;
            case 'flat':
                volumeMultiplier = 0.8;
                break;
            case 'upAndDown':
            case 'downAndUp':
                volumeMultiplier = 1.6 + priceChange * 15;
                break;
            case 'bounce':
                volumeMultiplier = 1.4 + priceChange * 12;
                break;
        }

        // 添加随机波动
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        return Math.floor(baseVolume * volumeMultiplier * randomFactor);
    }
}
