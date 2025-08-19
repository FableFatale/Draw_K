/**
 * 股票专用术语表
 * 用于识别和解析股票相关的自然语言输入
 */

// 术语数据
export const StockTermsData = {
    // 时间相关术语
    timeRanges: {
        // 分时图时间格式
        intraday: {
            patterns: [
                /(\d{1,2})[:.：](\d{2})\s*[-—到至]\s*(\d{1,2})[:.：](\d{2})/g, // 9:30-10:00
                /上午|下午|早盘|午盘|尾盘/g,
                /开盘\s*(\d+)\s*分钟?/g,
                /收盘前\s*(\d+)\s*分钟?/g
            ],
            sessions: {
                '早盘': ['09:30', '11:30'],
                '午盘': ['13:00', '15:00'],
                '上午': ['09:30', '11:30'],
                '下午': ['13:00', '15:00'],
                '尾盘': ['14:30', '15:00']
            }
        }
    },

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
                /绿柱/g,
                /金叉/g,  // 添加独立的金叉识别
                /死叉/g   // 添加独立的死叉识别
            ],
            signals: {
                goldenCross: ['金叉', 'DIF上穿DEA', '红柱放大', 'MACD金叉'],
                deathCross: ['死叉', 'DIF下穿DEA', '绿柱放大', 'MACD死叉'],
                bullishDivergence: ['底背离', '牛背离'],
                bearishDivergence: ['顶背离', '熊背离']
            },
            // MACD参数配置
            parameters: {
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9
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
                /强弱指标/g,
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

        // 布林带指标
        bollinger: {
            patterns: [
                /BOLL/gi,
                /布林带/g,
                /布林线/g,
                /Bollinger/gi,
                /上轨/g,
                /中轨/g,
                /下轨/g,
                /布林带收口/g,
                /布林带开口/g
            ]
        }
    },

    // 成交量术语
    volume: {
        patterns: [
            /成交量/g,
            /交易量/g,
            /量/g,
            /放量/g,
            /缩量/g,
            /温和放量/g,
            /巨量/g,
            /地量/g,
            /量价齐升/g,
            /量价背离/g,
            /无量上涨/g,
            /无量下跌/g
        ],
        characteristics: {
            increase: ['放量', '巨量', '温和放量', '量价齐升'],
            decrease: ['缩量', '地量', '无量上涨', '无量下跌'],
            divergence: ['量价背离']
        }
    },

    // 时间周期术语
    periods: {
        patterns: [
            /(\d+)\s*分钟/g,
            /(\d+)\s*小时/g,
            /(\d+)\s*天/g,
            /(\d+)\s*日/g,
            /(\d+)\s*周/g,
            /(\d+)\s*月/g,
            /(\d+)\s*年/g,
            /日K/g,
            /周K/g,
            /月K/g,
            /分时图/g,
            /1分钟/g,
            /5分钟/g,
            /15分钟/g,
            /30分钟/g,
            /60分钟/g
        ]
    }
};

// 术语匹配器类
export class TermMatcher {
    static extractTimeRange(input) {
        const timePattern = /(\d{1,2})[:.：](\d{2})\s*[-—到至]\s*(\d{1,2})[:.：](\d{2})/g;
        const matches = [...input.matchAll(timePattern)];
        
        if (matches.length > 0) {
            const match = matches[0];
            const startTime = `${match[1].padStart(2, '0')}:${match[2]}`;
            const endTime = `${match[3].padStart(2, '0')}:${match[4]}`;
            
            return {
                startTime,
                endTime,
                isIntraday: true,
                session: this.getSession(startTime, endTime)
            };
        }

        // 检查预定义时间段
        for (const [sessionName, timeRange] of Object.entries(StockTermsData.timeRanges.intraday.sessions)) {
            if (input.includes(sessionName)) {
                return {
                    startTime: timeRange[0],
                    endTime: timeRange[1],
                    isIntraday: true,
                    session: sessionName
                };
            }
        }

        return null;
    }

    static getSession(startTime, endTime) {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        
        if (start >= this.timeToMinutes('09:30') && end <= this.timeToMinutes('11:30')) {
            return '早盘';
        } else if (start >= this.timeToMinutes('13:00') && end <= this.timeToMinutes('15:00')) {
            return '午盘';
        } else if (end <= this.timeToMinutes('10:00')) {
            return '开盘';
        } else if (start >= this.timeToMinutes('14:30')) {
            return '尾盘';
        }
        
        return '盘中';
    }

    static timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static extractTechnicalIndicators(input) {
        const indicators = {};
        
        console.log('Checking technical indicators for input:', input);
        
        // 检查MACD相关
        const macdPatterns = StockTermsData.technicalIndicators.macd.patterns;
        const hasMacd = macdPatterns.some(pattern => {
            const regex = new RegExp(pattern.source, pattern.flags);
            return regex.test(input);
        });
        
        console.log('MACD patterns check result:', hasMacd);
        
        if (hasMacd) {
            indicators.macd = {
                enabled: true,
                signals: []
            };
            
            // 检查MACD信号
            for (const [signal, terms] of Object.entries(StockTermsData.technicalIndicators.macd.signals)) {
                const hasSignal = terms.some(term => input.includes(term));
                console.log(`Checking signal ${signal}:`, hasSignal, 'terms:', terms);
                if (hasSignal) {
                    indicators.macd.signals.push(signal);
                }
            }
            
            console.log('Final MACD indicators:', indicators.macd);
        }

        // 检查其他指标...
        // KDJ, RSI, CCI, BOLL等

        return indicators;
    }

    static extractComplexPattern(input) {
        console.log('Extracting complex pattern from:', input);
        
        const result = {
            timeRange: this.extractTimeRange(input),
            technicalIndicators: this.extractTechnicalIndicators(input),
            chartType: null,
            specialRequirements: []
        };

        // 判断图表类型
        if (result.timeRange && result.timeRange.isIntraday) {
            result.chartType = 'intraday'; // 分时图
        } else {
            result.chartType = 'candlestick'; // K线图
        }

        console.log('Extracted pattern:', result);
        return result;
    }
}

// 兼容性导出
export const StockTerms = {
    extractTerms: (input) => TermMatcher.extractComplexPattern(input)
};