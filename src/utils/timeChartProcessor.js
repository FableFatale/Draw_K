/**
 * 分时图数据处理器
 */
export class TimeChartProcessor {
    /**
     * 判断是否为分时图请求
     * @param {string} input - 用户输入
     * @returns {boolean}
     */
    static isTimeChartRequest(input) {
        return /分时图|分时|日内走势|(\d{1,2}[:：.]?\d{2}.*(?:缓量上涨|放量上涨|拉升|上涨|回落|下跌|震荡|横盘|盘整|冲高|探底))/i.test(input);
    }

    /**
     * 标准化时间格式
     * @param {string} time - 输入的时间
     * @returns {string} - 标准化的时间 (HH:mm)
     */
    static normalizeTime(time) {
        const nums = time.replace(/[^\d]/g, '');
        if (nums.length === 3) {
            return `0${nums[0]}:${nums[1]}${nums[2]}`;
        } else if (nums.length === 4) {
            return `${nums[0]}${nums[1]}:${nums[2]}${nums[3]}`;
        }
        return time;
    }

    /**
     * 调整时间到交易时间范围内
     * @param {string} time - 输入时间
     * @returns {string} - 调整后的时间
     */
    static adjustToTradingHours(time) {
        const minutes = this.timeToMinutes(time);
        if (minutes < this.timeToMinutes('09:30')) return '09:30';
        if (minutes > this.timeToMinutes('15:00')) return '15:00';
        if (minutes >= this.timeToMinutes('11:30') && minutes < this.timeToMinutes('13:00')) {
            return minutes < this.timeToMinutes('12:15') ? '11:30' : '13:00';
        }
        return time;
    }

    /**
     * 将时间转换为分钟数（相对于当日00:00）
     * @param {string} time - 时间字符串 (HH:mm)
     * @returns {number} - 分钟数
     */
    static timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * 生成分时数据
     * @param {string} input - 用户输入
     * @returns {Object} - 分时图数据
     */
    static processTimeChart(input) {
        const match = input.match(/(\d{1,2}[:：.]?\d{2})\s*[-~至到]\s*(\d{1,2}[:：.]?\d{2})\s*(.*)/);
        if (!match) return null;

        let startTime = this.normalizeTime(match[1]);
        let endTime = this.normalizeTime(match[2]);
        const trendDesc = match[3] || '';

        // 调整交易时间范围
        startTime = this.adjustToTradingHours(startTime);
        endTime = this.adjustToTradingHours(endTime);

        // 解析趋势参数
        const trendParams = this.parseTrendParams(trendDesc);
        
        // 生成分时数据
        const timeData = this.generateTimeData(startTime, endTime, trendParams);

        return {
            chartType: 'time',
            timeData: timeData,
            title: '分时图'
        };
    }

    /**
     * 解析趋势参数
     * @param {string} trendDesc - 趋势描述
     * @returns {Object} - 趋势参数
     */
    static parseTrendParams(trendDesc) {
        const params = {
            baseStrength: 0.02,    // 基础强度
            volatility: 0.001,     // 波动率
            volumeBase: 500000,    // 基础成交量
            volumeMultiplier: 1,   // 成交量倍数
            trend: 'normal'        // 趋势类型
        };

        // 先处理缓量/放量
        if (trendDesc.includes('缓量')) {
            params.volumeMultiplier = 0.7;
            if (trendDesc.includes('上涨')) {
                params.baseStrength = 0.015;
                params.volatility = 0.0006;
                params.trend = 'slowRise';
            }
        } else if (trendDesc.includes('放量')) {
            params.volumeMultiplier = 1.8;
            if (trendDesc.includes('上涨')) {
                params.baseStrength = 0.025;
                params.volatility = 0.0015;
                params.trend = 'volumeRise';
            }
        } else {
            // 处理其他趋势类型
            if (trendDesc.includes('拉升')) {
                params.baseStrength = 0.03;
                params.volatility = 0.002;
                params.volumeMultiplier = 1.5;
                params.trend = 'rapidRise';
            } else if (trendDesc.includes('上涨')) {
                params.baseStrength = 0.02;
                params.trend = 'rise';
            } else if (trendDesc.includes('下跌')) {
                params.baseStrength = -0.02;
                params.trend = 'fall';
            } else if (trendDesc.includes('横盘') || trendDesc.includes('盘整')) {
                params.baseStrength = 0.005;
                params.volatility = 0.0008;
                params.trend = 'flat';
            } else if (trendDesc.includes('震荡')) {
                params.baseStrength = 0.01;
                params.volatility = 0.002;
                params.trend = 'volatile';
            }
        }

        return params;
    }

    /**
     * 生成分时数据
     * @param {string} startTime - 开始时间
     * @param {string} endTime - 结束时间
     * @param {Object} params - 趋势参数
     * @returns {Array} - 分时数据数组
     */
    static generateTimeData(startTime, endTime, params) {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        const timeData = [];
        let currentPrice = 100;
        let accumulatedPrice = 0;
        let accumulatedVolume = 0;

        for (let m = startMinutes; m <= endMinutes; m++) {
            // 跳过午休时间
            if (m >= this.timeToMinutes('11:30') && m < this.timeToMinutes('13:00')) {
                continue;
            }

            const progress = (m - startMinutes) / (endMinutes - startMinutes);
            const time = this.minutesToTime(m);
            
            // 根据不同趋势类型计算价格变化
            let priceChange;
            switch (params.trend) {
                case 'slowRise':
                    // 缓量上涨：价格缓慢上升
                    priceChange = params.baseStrength * Math.pow(progress, 1.2) + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'volumeRise':
                    // 放量上涨：价格加速上升
                    priceChange = params.baseStrength * Math.pow(progress, 0.8) + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'rapidRise':
                    // 拉升：快速上涨
                    priceChange = params.baseStrength * (1 + Math.sin(progress * Math.PI / 2)) + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'rise':
                    // 普通上涨
                    priceChange = params.baseStrength * progress + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'fall':
                    // 下跌
                    priceChange = params.baseStrength * (1 - Math.pow(progress, 0.8)) + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'volatile':
                    // 震荡
                    priceChange = params.baseStrength * Math.sin(progress * Math.PI * 4) + 
                                (Math.random() - 0.5) * params.volatility;
                    break;
                    
                case 'flat':
                default:
                    // 横盘
                    priceChange = (Math.random() - 0.5) * params.volatility;
                    break;
            }
            
            // 更新价格
            currentPrice *= (1 + priceChange);
            
            // 根据趋势和进度生成成交量
            let volumeMultiplier;
            switch (params.trend) {
                case 'slowRise':
                    volumeMultiplier = 0.7 + 0.3 * Math.pow(progress, 1.5);
                    break;
                case 'volumeRise':
                    volumeMultiplier = 1.0 + progress * 2;
                    break;
                case 'rapidRise':
                    volumeMultiplier = 1.5 + Math.sin(progress * Math.PI) * 1.5;
                    break;
                case 'volatile':
                    volumeMultiplier = 1.0 + Math.sin(progress * Math.PI * 4) * 0.5;
                    break;
                default:
                    volumeMultiplier = 0.8 + Math.random() * 0.4;
            }
            
            const volume = Math.floor(params.volumeBase * 
                                    params.volumeMultiplier * 
                                    volumeMultiplier * 
                                    (0.8 + Math.random() * 0.4));
            
            accumulatedVolume += volume;
            accumulatedPrice += currentPrice;
            
            timeData.push({
                time,
                price: parseFloat(currentPrice.toFixed(2)),
                volume,
                avgPrice: parseFloat((accumulatedPrice / (timeData.length + 1)).toFixed(2))
            });
        }

        return timeData;
    }

    /**
     * 将分钟数转换为时间字符串
     * @param {number} minutes - 分钟数
     * @returns {string} - 时间字符串 (HH:mm)
     */
    static minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
}
