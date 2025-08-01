/**
 * 股票专用术语表
 * 用于识别和解析股票相关的自然语言输入
 */

export const StockTerms = {
    // 趋势类型术语
    trends: {
        upward: ['上涨', '上升', '涨', '牛市', '多头', '看涨', '拉升', '冲高', '突破', '向上'],
        downward: ['下跌', '下降', '跌', '熊市', '空头', '看跌', '下挫', '杀跌', '破位', '向下'],
        sideways: ['震荡', '横盘', '盘整', '整理', '窄幅', '平台', '箱体', '区间'],
        volatile: ['波动', '起伏', '震荡上行', '震荡下行', '宽幅震荡']
    },

    // 技术指标术语
    technicalIndicators: {
        // 移动平均线
        movingAverage: {
            patterns: [
                /MA\s*(\d+)/gi,
                /(\d+)\s*日\s*均线/g,
                /(\d+)\s*日\s*线/g,
                /移动平均线/g,
                /均线/g,
                /年线/g, // 250日线
                /半年线/g, // 120日线
                /季线/g, // 60日线
                /月线/g, // 20日线
                /周线/g, // 5日线
            ],
            aliases: {
                '年线': 250,
                '半年线': 120,
                '季线': 60,
                '月线': 20,
                '周线': 5
            }
        },

        // MACD指标
        macd: {
            patterns: [
                /MACD/gi,
                /指数平滑移动平均线/g,
                /异同移动平均线/g,
                /DIF/gi,
                /DEA/gi,
                /MACD柱状图/g,
                /MACD金叉/g,
                /MACD死叉/g,
                /MACD背离/g,
                /MACD顶背离/g,
                /MACD底背离/g,
                /红柱/g,
                /绿柱/g
            ],
            signals: {
                goldenCross: ['金叉', 'DIF上穿DEA', '红柱放大'],
                deathCross: ['死叉', 'DIF下穿DEA', '绿柱放大'],
                bullishDivergence: ['底背离', '牛背离'],
                bearishDivergence: ['顶背离', '熊背离']
            }
        },

        // CCI指标
        cci: {
            patterns: [
                /CCI/gi,
                /顺势指标/g,
                /商品通道指标/g,
                /CCI超买/g,
                /CCI超卖/g,
                /CCI背离/g
            ],
            levels: {
                overbought: 100,
                oversold: -100,
                extreme_overbought: 200,
                extreme_oversold: -200
            }
        },

        // KDJ指标
        kdj: {
            patterns: [
                /KDJ/gi,
                /随机指标/g,
                /K线指标/g,
                /D线指标/g,
                /J线指标/g,
                /KDJ金叉/g,
                /KDJ死叉/g,
                /KDJ背离/g
            ]
        },

        // RSI指标
        rsi: {
            patterns: [
                /RSI/gi,
                /相对强弱指标/g,
                /相对强弱指数/g,
                /RSI超买/g,
                /RSI超卖/g,
                /RSI背离/g
            ],
            levels: {
                overbought: 70,
                oversold: 30,
                extreme_overbought: 80,
                extreme_oversold: 20
            }
        },

        // 布林带
        bollinger: {
            patterns: [
                /BOLL/gi,
                /布林带/g,
                /布林线/g,
                /Bollinger/gi,
                /上轨/g,
                /下轨/g,
                /中轨/g,
                /布林带收口/g,
                /布林带开口/g
            ]
        }
    },

    // K线形态术语
    candlestickPatterns: {
        single: {
            bullish: ['大阳线', '光头阳线', '光脚阳线', '光头光脚阳线', '锤子线', '倒锤子线'],
            bearish: ['大阴线', '光头阴线', '光脚阴线', '光头光脚阴线', '上吊线', '流星线'],
            neutral: ['十字星', '长十字星', '蜻蜓十字星', '墓碑十字星', '纺锤线']
        },
        multiple: {
            bullish: ['早晨之星', '红三兵', '三白武士', '上升三法', '多方炮'],
            bearish: ['黄昏之星', '黑三鸦', '三只乌鸦', '下降三法', '空方炮'],
            reversal: ['头肩顶', '头肩底', '双顶', '双底', '三重顶', '三重底']
        }
    },

    // 成交量术语
    volume: {
        patterns: [
            /成交量/g,
            /量能/g,
            /交易量/g,
            /成交额/g,
            /换手率/g
        ],
        trends: {
            increasing: ['放量', '量能放大', '成交量增加', '量增', '天量', '巨量'],
            decreasing: ['缩量', '量能萎缩', '成交量减少', '量缩', '地量', '无量'],
            stable: ['量能平稳', '成交量稳定', '量平']
        },
        priceRelation: {
            consistent: ['量价齐升', '量价齐跌', '量价配合', '放量上涨', '放量下跌'],
            divergent: ['量价背离', '价涨量缩', '价跌量增', '缩量上涨', '缩量下跌']
        }
    },

    // 价格术语
    price: {
        patterns: [
            /开盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/g,
            /收盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/g,
            /最高价?\s*[:：]?\s*(\d+(?:\.\d+)?)/g,
            /最低价?\s*[:：]?\s*(\d+(?:\.\d+)?)/g,
            /价格\s*[:：]?\s*(\d+(?:\.\d+)?)/g,
            /从\s*(\d+(?:\.\d+)?)\s*[到至]\s*(\d+(?:\.\d+)?)/g,
            /(\d+(?:\.\d+)?)\s*[到至]\s*(\d+(?:\.\d+)?)/g
        ],
        levels: {
            support: ['支撑位', '支撑线', '底部支撑', '关键支撑'],
            resistance: ['阻力位', '阻力线', '压力位', '压力线', '关键阻力']
        }
    },

    // 时间周期术语
    timeframe: {
        patterns: [
            /(\d+)\s*天/g,
            /(\d+)\s*日/g,
            /(\d+)\s*个?\s*交易日/g,
            /(\d+)\s*根?\s*[Kk]线/g,
            /(\d+)\s*条?\s*[Kk]线/g,
            /(\d+)\s*个?\s*周期/g,
            /(\d+)\s*周/g,
            /(\d+)\s*个?\s*月/g,
            /(\d+)\s*个?\s*季度/g,
            /(\d+)\s*个?\s*季/g,
            /(\d+)\s*个?\s*年/g,
            /(\d+)\s*weeks?/gi,
            /(\d+)\s*months?/gi,
            /(\d+)\s*years?/gi,
            /(\d+)\s*days?/gi,
            /(\d+)\s*quarters?/gi
        ],
        aliases: {
            '一天': 1,
            '一日': 1,
            '一周': 5,
            '两周': 10,
            '半月': 10,
            '一月': 20,
            '一个月': 20,
            '季度': 60,
            '一季度': 60,
            '一季': 60,
            '半年': 120,
            '一年': 250,
            '两天': 2,
            '三天': 3,
            '四天': 4,
            '五天': 5,
            '六天': 6,
            '七天': 7,
            '一星期': 5,
            '两个月': 40,
            '三个月': 60,
            '六个月': 120,
            '九个月': 180,
            '两年': 500,
            '三年': 750
        }
    },

    // 市场情绪术语
    sentiment: {
        bullish: ['看多', '做多', '多头', '牛市', '乐观', '积极'],
        bearish: ['看空', '做空', '空头', '熊市', '悲观', '消极'],
        neutral: ['观望', '中性', '平衡', '震荡']
    },

    // 特殊形态术语
    specialPatterns: {
        breakout: ['突破', '向上突破', '向下突破', '放量突破', '缩量突破'],
        consolidation: ['整理', '盘整', '横盘整理', '三角整理', '旗形整理'],
        gap: ['跳空', '缺口', '向上跳空', '向下跳空', '补缺口'],
        reversal: ['反转', '趋势反转', 'V型反转', 'U型反转']
    }
};

/**
 * 术语匹配工具类
 */
export class TermMatcher {
    /**
     * 匹配趋势类型
     * @param {string} input - 输入文本
     * @returns {string|null} - 匹配的趋势类型
     */
    static matchTrend(input) {
        const { trends } = StockTerms;
        
        for (const [trendType, terms] of Object.entries(trends)) {
            for (const term of terms) {
                if (input.includes(term)) {
                    switch (trendType) {
                        case 'upward': return '上涨';
                        case 'downward': return '下跌';
                        case 'sideways': return '震荡';
                        case 'volatile': return '震荡';
                        default: return null;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 匹配技术指标
     * @param {string} input - 输入文本
     * @returns {Array} - 匹配的技术指标列表
     */
    static matchTechnicalIndicators(input) {
        const indicators = [];
        const { technicalIndicators } = StockTerms;

        // 检查MACD
        for (const pattern of technicalIndicators.macd.patterns) {
            if (pattern.test(input)) {
                indicators.push('MACD');
                break;
            }
        }

        // 检查CCI
        for (const pattern of technicalIndicators.cci.patterns) {
            if (pattern.test(input)) {
                indicators.push('CCI');
                break;
            }
        }

        // 检查KDJ
        for (const pattern of technicalIndicators.kdj.patterns) {
            if (pattern.test(input)) {
                indicators.push('KDJ');
                break;
            }
        }

        // 检查RSI
        for (const pattern of technicalIndicators.rsi.patterns) {
            if (pattern.test(input)) {
                indicators.push('RSI');
                break;
            }
        }

        // 检查布林带
        for (const pattern of technicalIndicators.bollinger.patterns) {
            if (pattern.test(input)) {
                indicators.push('BOLL');
                break;
            }
        }

        return [...new Set(indicators)]; // 去重
    }

    /**
     * 匹配移动平均线
     * @param {string} input - 输入文本
     * @returns {Array} - 匹配的MA周期列表
     */
    static matchMovingAverages(input) {
        const periods = [];
        const { movingAverage } = StockTerms.technicalIndicators;

        // 检查别名
        for (const [alias, period] of Object.entries(movingAverage.aliases)) {
            if (input.includes(alias)) {
                periods.push(period);
            }
        }

        // 检查模式
        for (const pattern of movingAverage.patterns) {
            const matches = input.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) {
                    periods.push(parseInt(match[1]));
                }
            }
        }

        return [...new Set(periods)].sort((a, b) => a - b); // 去重并排序
    }

    /**
     * 匹配成交量趋势
     * @param {string} input - 输入文本
     * @returns {Object} - 成交量趋势信息
     */
    static matchVolume(input) {
        const { volume } = StockTerms;
        let volumeTrend = 'normal';
        let volumePriceRelation = 'normal';

        // 检查成交量趋势
        for (const [trend, terms] of Object.entries(volume.trends)) {
            for (const term of terms) {
                if (input.includes(term)) {
                    switch (trend) {
                        case 'increasing': volumeTrend = 'expanding'; break;
                        case 'decreasing': volumeTrend = 'shrinking'; break;
                        case 'stable': volumeTrend = 'normal'; break;
                    }
                    break;
                }
            }
        }

        // 检查量价关系
        for (const [relation, terms] of Object.entries(volume.priceRelation)) {
            for (const term of terms) {
                if (input.includes(term)) {
                    switch (relation) {
                        case 'consistent': volumePriceRelation = 'consistent'; break;
                        case 'divergent': volumePriceRelation = 'divergent'; break;
                    }
                    break;
                }
            }
        }

        return { volumeTrend, volumePriceRelation };
    }

    /**
     * 匹配时间周期
     * @param {string} input - 输入文本
     * @returns {number|null} - 匹配的周期天数
     */
    static matchTimeframe(input) {
        const { timeframe } = StockTerms;

        // 检查别名
        for (const [alias, period] of Object.entries(timeframe.aliases)) {
            if (input.includes(alias)) {
                return period;
            }
        }

        // 检查模式
        for (const pattern of timeframe.patterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                const number = parseInt(match[1]);
                const unit = match[0].replace(number, '').trim().toLowerCase();
                
                // 根据单位转换为天数
                if (unit.includes('周') || unit.includes('week')) {
                    return number * 5; // 交易日
                } else if (unit.includes('月') || unit.includes('month')) {
                    return number * 20; // 月均交易日
                } else if (unit.includes('季') || unit.includes('quarter')) {
                    return number * 60; // 季度交易日
                } else if (unit.includes('年') || unit.includes('year')) {
                    return number * 250; // 年均交易日
                } else {
                    return number; // 默认为天数
                }
            }
        }

        // 匹配中文数字表达方式
        const chineseNumberMap = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
        };
        
        for (const [chineseNum, value] of Object.entries(chineseNumberMap)) {
            if (input.includes(`${chineseNum}天`) || input.includes(`${chineseNum}日`)) {
                return value;
            }
            if (input.includes(`${chineseNum}周`)) {
                return value * 5;
            }
            if (input.includes(`${chineseNum}月`)) {
                return value * 20;
            }
            if (input.includes(`${chineseNum}季`) || input.includes(`${chineseNum}季度`)) {
                return value * 60;
            }
            if (input.includes(`${chineseNum}年`)) {
                return value * 250;
            }
        }

        return null;
    }

    /**
     * 匹配价格信息
     * @param {string} input - 输入文本
     * @returns {Object} - 价格信息
     */
    static matchPrices(input) {
        const prices = {
            open: null,
            close: null,
            high: null,
            low: null,
            range: []
        };

        // 匹配具体价格
        const openMatch = input.match(/开盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/);
        if (openMatch) prices.open = parseFloat(openMatch[1]);

        const closeMatch = input.match(/收盘价?\s*[:：]?\s*(\d+(?:\.\d+)?)/);
        if (closeMatch) prices.close = parseFloat(closeMatch[1]);

        const highMatch = input.match(/最高价?\s*[:：]?\s*(\d+(?:\.\d+)?)/);
        if (highMatch) prices.high = parseFloat(highMatch[1]);

        const lowMatch = input.match(/最低价?\s*[:：]?\s*(\d+(?:\.\d+)?)/);
        if (lowMatch) prices.low = parseFloat(lowMatch[1]);

        // 匹配价格区间
        const rangeMatch = input.match(/从?\s*(\d+(?:\.\d+)?)\s*[到至]\s*(\d+(?:\.\d+)?)/);
        if (rangeMatch) {
            prices.range = [parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2])];
        }

        // 提取所有数字作为价格候选
        const allNumbers = input.match(/\d+(?:\.\d+)?/g);
        if (allNumbers && allNumbers.length > 0) {
            prices.candidates = allNumbers.map(n => parseFloat(n));
        }

        return prices;
    }
}