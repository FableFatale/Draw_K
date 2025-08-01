import { PatternRecognizer } from './patternRecognizer.js';

export function getChartConfig(data) {
    const { dates, data: klineData, volumes, indicators, technicalIndicators, title } = data
    
    // 识别特殊形态
    const patternPositions = PatternRecognizer.findCompletePattern(data);

    const config = {
        title: {
            text: title,
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ccc',
            borderWidth: 1,
            textStyle: {
                color: '#333',
                fontSize: 12
            },
            formatter: function(params) {
                if (params && params.length > 0) {
                    let result = `<div style="font-weight: bold; margin-bottom: 8px; color: #333;">${params[0].axisValue}</div>`
                    let currentVolume = null
                    let volumeTrend = null
                    let klineData = null
                    
                    params.forEach(param => {
                        if (param.seriesName === 'K线') {
                            klineData = param.data
                            if (Array.isArray(klineData) && klineData.length >= 4) {
                                const open = klineData[0]
                                const close = klineData[1]
                                const low = klineData[2]
                                const high = klineData[3]
                                const change = close - open
                                const changePercent = ((change / open) * 100).toFixed(2)
                                const changeColor = change >= 0 ? '#ec0000' : '#00da3c'
                                const changeSymbol = change >= 0 ? '+' : ''
                                
                                result += `<div style="margin: 4px 0;">
                                    <span style="color: #666;">开盘:</span> 
                                    <span style="font-weight: bold;">${open.toFixed(2)}</span>
                                </div>`
                                result += `<div style="margin: 4px 0;">
                                    <span style="color: #666;">收盘:</span> 
                                    <span style="font-weight: bold; color: ${changeColor};">${close.toFixed(2)}</span>
                                </div>`
                                result += `<div style="margin: 4px 0;">
                                    <span style="color: #666;">最高:</span> 
                                    <span style="font-weight: bold;">${high.toFixed(2)}</span>
                                </div>`
                                result += `<div style="margin: 4px 0;">
                                    <span style="color: #666;">最低:</span> 
                                    <span style="font-weight: bold;">${low.toFixed(2)}</span>
                                </div>`
                                result += `<div style="margin: 4px 0; padding-top: 4px; border-top: 1px solid #eee;">
                                    <span style="color: #666;">涨跌:</span> 
                                    <span style="font-weight: bold; color: ${changeColor};">${changeSymbol}${change.toFixed(2)} (${changeSymbol}${changePercent}%)</span>
                                </div>`
                                result += `<div style="margin: 4px 0;">
                                    <span style="color: #666;">振幅:</span> 
                                    <span style="font-weight: bold;">${((high - low) / open * 100).toFixed(2)}%</span>
                                </div>`
                            }
                        } else if (param.seriesName === 'MA5' && param.data !== null) {
                            result += `<div style="margin: 2px 0; color: #FF6B35;">MA5: ${param.data.toFixed(2)}</div>`
                        } else if (param.seriesName === 'MA10' && param.data !== null) {
                            result += `<div style="margin: 2px 0; color: #4ECDC4;">MA10: ${param.data.toFixed(2)}</div>`
                        } else if (param.seriesName === 'MA20' && param.data !== null) {
                            result += `<div style="margin: 2px 0; color: #45B7D1;">MA20: ${param.data.toFixed(2)}</div>`
                        } else if (param.seriesName === '成交量') {
                            currentVolume = param.data.value || param.data
                            result += `<div style="margin: 4px 0; padding-top: 4px; border-top: 1px solid #eee;">
                                <span style="color: #666;">成交量:</span> 
                                <span style="font-weight: bold;">${(currentVolume / 10000).toFixed(2)}万</span>
                            </div>`
                        } else if (param.seriesName === '成交量趋势') {
                            volumeTrend = param.data
                            if (volumeTrend) {
                                result += `<div style="margin: 2px 0; color: #FFA726;">量趋势: ${(volumeTrend / 10000).toFixed(2)}万</div>`
                            }
                        } else if (param.seriesName === 'DIF' && param.data !== null) {
                            result += `<div style="margin: 2px 0; color: #FF6B35;">DIF: ${param.data.toFixed(4)}</div>`
                        } else if (param.seriesName === 'DEA' && param.data !== null) {
                            result += `<div style="margin: 2px 0; color: #4ECDC4;">DEA: ${param.data.toFixed(4)}</div>`
                        } else if (param.seriesName === 'MACD' && param.data !== null) {
                            const macdValue = param.data.value || param.data
                            const macdColor = macdValue > 0 ? '#FF6B6B' : '#4ECDC4'
                            result += `<div style="margin: 2px 0; color: ${macdColor};">MACD: ${macdValue.toFixed(4)}</div>`
                        } else if (param.seriesName === 'CCI' && param.data !== null) {
                            const cciValue = param.data
                            let cciColor = '#8A2BE2' // 默认紫色
                            if (cciValue > 100) {
                                cciColor = '#FF6B6B' // 超买区域红色
                            } else if (cciValue < -100) {
                                cciColor = '#4ECDC4' // 超卖区域绿色
                            }
                            result += `<div style="margin: 2px 0; color: ${cciColor};">CCI: ${cciValue.toFixed(2)}</div>`
                        }
                    })
                    
                    // 显示成交量变化趋势
                    if (currentVolume && volumeTrend) {
                        const trendPercent = ((currentVolume - volumeTrend) / volumeTrend * 100).toFixed(1)
                        const trendIcon = trendPercent > 0 ? '📈' : '📉'
                        const trendColor = trendPercent > 0 ? '#ec0000' : '#00da3c'
                        result += `<div style="margin: 4px 0; color: ${trendColor};">
                            量能变化: ${trendIcon} ${trendPercent}%
                        </div>`
                    }
                    
                    return result
                }
                return ''
            }
        },
        legend: {
            data: (() => {
                let legendData = ['K线']
                if (indicators && indicators.MA5) {
                    legendData.push('MA5', 'MA10', 'MA20')
                }
                if (volumes) {
                    legendData.push('成交量', '成交量趋势')
                }
                if (indicators && indicators.MACD) {
                    legendData.push('DIF', 'DEA', 'MACD')
                }
                if (indicators && indicators.CCI) {
                    legendData.push('CCI')
                }
                return legendData
            })(),
            top: 30
        },
        grid: (() => {
            const hasMACD = indicators && indicators.MACD;
            const hasCCI = indicators && indicators.CCI;
            const indicatorCount = (hasMACD ? 1 : 0) + (hasCCI ? 1 : 0);
            
            if (volumes && indicatorCount > 0) {
                // K线 + 成交量 + 指标区域
                const grids = [
                    { left: '10%', right: '8%', height: `${40 - indicatorCount * 5}%`, top: '15%' }, // K线区域
                    { left: '10%', right: '8%', top: `${60 - indicatorCount * 5}%`, height: '15%' } // 成交量区域
                ];
                
                // 添加指标区域
                let currentTop = 80 - indicatorCount * 5;
                const indicatorHeight = 15;
                
                if (hasMACD) {
                    grids.push({ left: '10%', right: '8%', top: `${currentTop}%`, height: `${indicatorHeight}%` });
                    currentTop += indicatorHeight + 5;
                }
                
                if (hasCCI) {
                    grids.push({ left: '10%', right: '8%', top: `${currentTop}%`, height: `${indicatorHeight}%` });
                }
                
                return grids;
            } else if (volumes) {
                // K线 + 成交量 两个区域
                return [
                    { left: '10%', right: '8%', height: '50%', top: '15%' },
                    { left: '10%', right: '8%', top: '70%', height: '20%' }
                ];
            } else if (indicatorCount > 0) {
                // K线 + 指标区域
                const grids = [
                    { left: '10%', right: '8%', height: `${60 - indicatorCount * 5}%`, top: '15%' } // K线区域
                ];
                
                // 添加指标区域
                let currentTop = 80 - indicatorCount * 5;
                const indicatorHeight = 15;
                
                if (hasMACD) {
                    grids.push({ left: '10%', right: '8%', top: `${currentTop}%`, height: `${indicatorHeight}%` });
                    currentTop += indicatorHeight + 5;
                }
                
                if (hasCCI) {
                    grids.push({ left: '10%', right: '8%', top: `${currentTop}%`, height: `${indicatorHeight}%` });
                }
                
                return grids;
            } else {
                // 只有K线一个区域
                return { left: '10%', right: '8%', top: '15%', bottom: '15%' };
            }
        })(),
        xAxis: (() => {
            const hasMACD = indicators && indicators.MACD;
            const hasCCI = indicators && indicators.CCI;
            const indicatorCount = (hasMACD ? 1 : 0) + (hasCCI ? 1 : 0);
            
            // 计算合适的分割数量，确保日期标签不会重叠
            const splitNumber = Math.min(20, Math.max(5, Math.floor(dates.length / 2)));
            
            // K线图区域的X轴
            const klineXAxis = {
                type: 'category',
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { 
                    onZero: false,
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 11,
                    interval: function(index, value) {
                        // 根据数据点数量动态调整标签显示间隔
                        const totalPoints = dates.length;
                        if (totalPoints <= 10) {
                            return true; // 显示所有标签
                        } else if (totalPoints <= 20) {
                            return index % 2 === 0; // 每隔一个显示
                        } else if (totalPoints <= 40) {
                            return index % 4 === 0; // 每隔三个显示
                        } else {
                            return index % 5 === 0; // 每隔四个显示
                        }
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#ccc'
                    },
                    alignWithLabel: true
                },
                splitLine: { 
                    show: false 
                },
                splitNumber: splitNumber,
                min: 'dataMin',
                max: 'dataMax'
            };
            
            const result = [klineXAxis];
            let gridIndex = 1;
            
            // 成交量区域的X轴 - 与K线图联动
            if (volumes) {
                result.push({
                    type: 'category',
                    gridIndex: gridIndex++,
                    data: dates,
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                });
            }
            
            // MACD区域的X轴 - 与K线图联动
            if (hasMACD) {
                result.push({
                    type: 'category',
                    gridIndex: gridIndex++,
                    data: dates,
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                });
            }
            
            // CCI区域的X轴 - 与K线图联动
            if (hasCCI) {
                result.push({
                    type: 'category',
                    gridIndex: gridIndex++,
                    data: dates,
                    axisLabel: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false }
                });
            }
            
            return result.length > 1 ? result : result[0];
        })(),
        yAxis: (() => {
            const hasMACD = indicators && indicators.MACD;
            const hasCCI = indicators && indicators.CCI;
            
            const baseYAxis = {
                scale: true,
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisLabel: {
                    color: '#666',
                    fontSize: 11,
                    formatter: function(value) {
                        return value.toFixed(2)
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0',
                        type: 'dashed'
                    }
                },
                splitArea: { 
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.3)', 'rgba(245,245,245,0.3)']
                    }
                }
            };
            
            const volumeYAxis = {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { 
                    show: true,
                    color: '#666',
                    fontSize: 10,
                    formatter: function(value) {
                        // 将成交量格式化为更易读的形式
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        } else {
                            return value;
                        }
                    }
                },
                axisLine: { 
                    show: true,
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisTick: { 
                    show: true,
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: { 
                    show: false 
                }
            };
            
            // 创建指标Y轴的通用配置
            const createIndicatorYAxis = (gridIndex) => ({
                scale: true,
                gridIndex: gridIndex,
                splitNumber: 2,
                axisLabel: { 
                    show: true,
                    color: '#666',
                    fontSize: 10
                },
                axisLine: { 
                    show: true,
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisTick: { 
                    show: true,
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                splitLine: { 
                    show: false 
                }
            });
            
            const result = [baseYAxis];
            let gridIndex = 1;
            
            // 添加成交量Y轴
            if (volumes) {
                result.push(volumeYAxis);
                gridIndex++;
            }
            
            // 添加MACD Y轴
            if (hasMACD) {
                result.push(createIndicatorYAxis(gridIndex++));
            }
            
            // 添加CCI Y轴
            if (hasCCI) {
                result.push(createIndicatorYAxis(gridIndex++));
            }
            
            return result.length > 1 ? result : result[0];
        })(),
        dataZoom: (() => {
            const hasMACD = indicators && indicators.MACD;
            const hasCCI = indicators && indicators.CCI;
            
            // 计算需要联动的x轴索引数组
            const xAxisIndices = [0]; // 主图x轴索引
            let currentIndex = 1;
            
            if (volumes) {
                xAxisIndices.push(currentIndex++);
            }
            
            if (hasMACD) {
                xAxisIndices.push(currentIndex++);
            }
            
            if (hasCCI) {
                xAxisIndices.push(currentIndex++);
            }
            
            const baseDataZoom = {
                type: 'inside',
                start: 0,  // 从第一天开始显示
                end: 100,  // 显示到最后一天
                filterMode: 'filter',
                throttle: 50, // 节流，提高性能
                xAxisIndex: xAxisIndices
            };
            
            const sliderDataZoom = {
                show: true,
                type: 'slider',
                top: '90%',
                start: 0,  // 从第一天开始显示
                end: 100,  // 显示到最后一天
                height: 20,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#667eea',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                textStyle: {
                    color: '#333'
                },
                borderColor: '#ddd',
                fillerColor: 'rgba(102, 126, 234, 0.2)',
                backgroundColor: 'rgba(247, 247, 247, 0.5)',
                xAxisIndex: xAxisIndices
            };
            
            return [baseDataZoom, sliderDataZoom];
        })(),
        series: []
    }

    // K线数据 - 修复数据格式和颜色方案
    config.series.push({
        name: 'K线',
        type: 'candlestick',
        data: klineData,
        itemStyle: {
            color: '#ec0000',      // 阳线颜色（红色）
            color0: '#00da3c',     // 阴线颜色（绿色）
            borderColor: '#ec0000', // 阳线边框颜色
            borderColor0: '#00da3c' // 阴线边框颜色
        },
        emphasis: {
            itemStyle: {
                borderWidth: 2
            }
        },
        // 添加动画效果
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
    })

    // 添加均线指标
    if (indicators && indicators.MA5) {
        config.series.push({
            name: 'MA5',
            type: 'line',
            data: indicators.MA5,
            smooth: true,
            lineStyle: {
                color: '#FF6B35',
                width: 1.5
            },
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: false,
            connectNulls: true, // 连接空值点
            emphasis: {
                lineStyle: {
                    width: 3
                },
                showSymbol: true
            },
            // 添加动画效果
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
        })
    }

    if (indicators && indicators.MA10) {
        config.series.push({
            name: 'MA10',
            type: 'line',
            data: indicators.MA10,
            smooth: true,
            lineStyle: {
                color: '#4ECDC4',
                width: 1.5
            },
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: false,
            connectNulls: true, // 连接空值点
            emphasis: {
                lineStyle: {
                    width: 3
                },
                showSymbol: true
            },
            // 添加动画效果
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
        })
    }

    if (indicators && indicators.MA20) {
        config.series.push({
            name: 'MA20',
            type: 'line',
            data: indicators.MA20,
            smooth: true,
            lineStyle: {
                color: '#45B7D1',
                width: 1.5
            },
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: false,
            connectNulls: true, // 连接空值点
            emphasis: {
                lineStyle: {
                    width: 3
                },
                showSymbol: true
            },
            // 添加动画效果
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
        })
    }
    
    // 添加MA250长期均线
    if (indicators && indicators.MA250) {
        config.series.push({
            name: 'MA250',
            type: 'line',
            data: indicators.MA250,
            smooth: true,
            lineStyle: {
                color: '#9C27B0', // 紫色
                width: 1.5,
                type: 'dashed' // 虚线
            },
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: false,
            connectNulls: true, // 连接空值点
            emphasis: {
                lineStyle: {
                    width: 3
                },
                showSymbol: true
            },
            // 添加动画效果
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
        })
    }

    // 成交量数据
    if (volumes) {
        // 成交量柱状图
        config.series.push({
            name: '成交量',
            type: 'bar',
            xAxisIndex: 1, // 使用成交量区域的X轴
            yAxisIndex: 1,
            data: volumes.map((volume, index) => {
                const kline = klineData[index]
                const isRising = kline && kline[1] > kline[0]
                const baseColor = isRising ? '#ec0000' : '#00da3c'
                return {
                    value: volume,
                    itemStyle: {
                        color: baseColor,
                        opacity: 0.7,
                        borderColor: baseColor,
                        borderWidth: 0
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            borderWidth: 1
                        }
                    }
                }
            }),
            barWidth: '60%',
            barMaxWidth: 10,
            // 添加动画效果
            animation: true,
            animationDuration: 800,
            animationEasing: 'cubicOut'
        })

        // 成交量趋势线（5日移动平均）
        const volumeMA = []
        for (let i = 0; i < volumes.length; i++) {
            if (i === 0) {
                // 第一个点直接使用当前值
                volumeMA.push(volumes[i])
            } else if (i < 4) {
                // 数据点不足时，使用可用的数据点计算平均值
                let sum = 0
                for (let j = 0; j <= i; j++) {
                    sum += volumes[j]
                }
                volumeMA.push(sum / (i + 1))
            } else {
                // 数据点足够时，使用完整的5日平均
                const sum = volumes.slice(i - 4, i + 1).reduce((a, b) => a + b, 0)
                volumeMA.push(sum / 5)
            }
        }

        config.series.push({
            name: '成交量趋势',
            type: 'line',
            xAxisIndex: 1, // 使用独立的X轴
            yAxisIndex: 1,
            data: volumeMA,
            lineStyle: {
                color: '#FFA726',
                width: 2,
                type: 'dashed'
            },
            symbol: 'circle',
            symbolSize: 4,
            showSymbol: false,
            smooth: true,
            connectNulls: true, // 连接空值点
            emphasis: {
                lineStyle: {
                    width: 3
                },
                showSymbol: true
            },
            // 添加动画效果
            animation: true,
            animationDuration: 1200,
            animationEasing: 'cubicOut'
        })
        
        // 不再为成交量区域添加独立的滑动条，使用共享的滑动条
    }

    // 添加MACD指标
    if (indicators && indicators.MACD) {
        const { dif, dea, macd } = indicators.MACD
        const macdGridIndex = volumes ? 2 : 1
        const macdYAxisIndex = volumes ? 2 : 1
        
        // DIF线
        config.series.push({
            name: 'DIF',
            type: 'line',
            xAxisIndex: macdGridIndex,
            yAxisIndex: macdYAxisIndex,
            data: dif,
            lineStyle: {
                color: '#FF6B35',
                width: 1.5
            },
            symbol: 'none',
            smooth: true,
            connectNulls: true // 连接空值点
        })
        
        // DEA线
        config.series.push({
            name: 'DEA',
            type: 'line',
            xAxisIndex: macdGridIndex,
            yAxisIndex: macdYAxisIndex,
            data: dea,
            lineStyle: {
                color: '#4ECDC4',
                width: 1.5
            },
            symbol: 'none',
            smooth: true,
            connectNulls: true // 连接空值点
        })
        
        // MACD柱状图
        config.series.push({
            name: 'MACD',
            type: 'bar',
            xAxisIndex: macdGridIndex,
            yAxisIndex: macdYAxisIndex,
            data: macd.map(value => ({
                value: value,
                itemStyle: {
                    color: value > 0 ? '#FF6B6B' : '#4ECDC4'
                }
            })),
            barWidth: '60%',
            barMaxWidth: 6
        })
        
        // 不再为MACD区域添加独立的缩放控制，使用共享的缩放控制
    }

    // 添加技术形态标注
    const graphicElements = []
    
    // 成交量趋势标注
    if (volumes && volumes.length > 5) {
        const firstVolume = volumes[4] // 第5天开始有趋势线数据
        const lastVolume = volumes[volumes.length - 1]
        const volumeGrowth = ((lastVolume - firstVolume) / firstVolume * 100).toFixed(1)
        
        if (volumeGrowth > 10) { // 如果成交量增长超过10%，添加标注
            graphicElements.push({
                type: 'text',
                left: '15%',
                top: '75%',
                style: {
                    text: `📈 成交量递增 +${volumeGrowth}%`,
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: '#FFA726',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: [4, 8],
                    borderRadius: 4
                }
            })
        }
    }
    
    // 缩量上涨区域标注
    if (technicalIndicators && technicalIndicators.patterns && technicalIndicators.patterns.includes('lowVolumeRise')) {
        const totalDays = dates.length
        const startIndex = Math.floor(totalDays * 0.4) // 40%位置
        const endIndex = Math.floor(totalDays * 0.7)   // 70%位置
        
        // 添加区域背景标注
        graphicElements.push({
            type: 'rect',
            left: `${10 + (startIndex / totalDays) * 80}%`,
            top: '15%',
            style: {
                width: `${((endIndex - startIndex) / totalDays) * 80}%`,
                height: '50%',
                fill: 'rgba(255, 193, 7, 0.1)',
                stroke: 'rgba(255, 193, 7, 0.3)',
                lineWidth: 1
            }
        })
        
        // 添加文字标注
        graphicElements.push({
            type: 'text',
            left: `${10 + ((startIndex + endIndex) / 2 / totalDays) * 80}%`,
            top: '20%',
            style: {
                text: '📉 缩量上涨区域',
                fontSize: 12,
                fontWeight: 'bold',
                fill: '#FF8F00',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: [4, 8],
                borderRadius: 4,
                textAlign: 'center'
            }
        })
        
        // 添加成交量区域的标注
        if (volumes) {
            graphicElements.push({
                type: 'rect',
                left: `${10 + (startIndex / totalDays) * 80}%`,
                top: '70%',
                style: {
                    width: `${((endIndex - startIndex) / totalDays) * 80}%`,
                    height: '20%',
                    fill: 'rgba(255, 193, 7, 0.15)',
                    stroke: 'rgba(255, 193, 7, 0.4)',
                    lineWidth: 1
                }
            })
        }
    }
    
    // MACD金叉标注
    if (technicalIndicators && technicalIndicators.patterns && technicalIndicators.patterns.includes('MACDGoldenCross') && indicators && indicators.MACD) {
        const { dif, dea } = indicators.MACD;
        let crossIndex = -1;
        
        // 寻找金叉位置
        for (let i = 1; i < dif.length; i++) {
            if (dif[i] > dea[i] && dif[i-1] <= dea[i-1]) {
                crossIndex = i;
                break;
            }
        }
        
        if (crossIndex > 0) {
            const totalDays = dates.length;
            const position = crossIndex / totalDays;
            
            // 添加金叉标注
            graphicElements.push({
                type: 'path',
                left: `${10 + position * 80}%`,
                top: '40%',
                style: {
                    fill: '#FF6B35',
                    stroke: '#FF6B35',
                    lineWidth: 2
                },
                shape: {
                    pathData: 'M0,0 L10,10 L20,0 L10,20 Z'
                }
            });
            
            // 添加文字标注
            graphicElements.push({
                type: 'text',
                left: `${10 + position * 80}%`,
                top: '45%',
                style: {
                    text: '金叉',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: '#FF6B35',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: [4, 8],
                    borderRadius: 4,
                    textAlign: 'center'
                }
            });
            
            // 如果有MACD子图，也在MACD区域添加标注
            if (volumes) {
                graphicElements.push({
                    type: 'circle',
                    left: `${10 + position * 80}%`,
                    top: '85%',
                    shape: {
                        r: 5
                    },
                    style: {
                        fill: '#FF6B35',
                        stroke: '#FF6B35',
                        lineWidth: 2
                    }
                });
            }
        }
    }
    
    // 头肩顶形态标注
    if (technicalIndicators && technicalIndicators.patterns && technicalIndicators.patterns.includes('headAndShouldersPattern')) {
        const totalDays = dates.length;
        const leftShoulderPos = Math.floor(totalDays * 0.25);
        const headPos = Math.floor(totalDays * 0.5);
        const rightShoulderPos = Math.floor(totalDays * 0.75);
        
        // 添加连线
        graphicElements.push({
            type: 'polyline',
            left: '10%',
            top: '15%',
            shape: {
                points: [
                    [(leftShoulderPos / totalDays) * 80, 20],
                    [(headPos / totalDays) * 80, 10],
                    [(rightShoulderPos / totalDays) * 80, 20]
                ]
            },
            style: {
                stroke: '#FF5252',
                lineWidth: 2,
                lineDash: [5, 5]
            }
        });
        
        // 添加文字标注
        graphicElements.push({
            type: 'text',
            left: `${10 + (headPos / totalDays) * 80}%`,
            top: '10%',
            style: {
                text: '头肩顶形态',
                fontSize: 12,
                fontWeight: 'bold',
                fill: '#FF5252',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: [4, 8],
                borderRadius: 4,
                textAlign: 'center'
            }
        });
    }
    
    // 双底形态标注
    if (technicalIndicators && technicalIndicators.patterns && technicalIndicators.patterns.includes('doubleBottomPattern')) {
        const totalDays = dates.length;
        const firstBottomPos = Math.floor(totalDays * 0.3);
        const middlePos = Math.floor(totalDays * 0.5);
        const secondBottomPos = Math.floor(totalDays * 0.7);
        
        // 添加连线
        graphicElements.push({
            type: 'polyline',
            left: '10%',
            top: '15%',
            shape: {
                points: [
                    [(firstBottomPos / totalDays) * 80, 40],
                    [(middlePos / totalDays) * 80, 30],
                    [(secondBottomPos / totalDays) * 80, 40]
                ]
            },
            style: {
                stroke: '#4ECDC4',
                lineWidth: 2,
                lineDash: [5, 5]
            }
        });
        
        // 添加文字标注
        graphicElements.push({
            type: 'text',
            left: `${10 + (middlePos / totalDays) * 80}%`,
            top: '50%',
            style: {
                text: '双底形态',
                fontSize: 12,
                fontWeight: 'bold',
                fill: '#4ECDC4',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: [4, 8],
                borderRadius: 4,
                textAlign: 'center'
            }
        });
    }
    
    // 添加形态标注
    if (patternPositions && patternPositions.length > 0) {
        patternPositions.forEach(index => {
            // 标注K线形态
            graphicElements.push({
                type: 'rect',
                left: `${10 + ((index - 2) / dates.length) * 80}%`,
                top: '15%',
                style: {
                    width: `${(3 / dates.length) * 80}%`,
                    height: '50%',
                    fill: 'rgba(255, 87, 34, 0.1)',
                    stroke: 'rgba(255, 87, 34, 0.5)',
                    lineWidth: 1
                }
            });
            
            // 添加文字标注
            graphicElements.push({
                type: 'text',
                left: `${10 + ((index - 1) / dates.length) * 80}%`,
                top: '10%',
                style: {
                    text: '突破形态',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fill: '#FF5722',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: [4, 8],
                    borderRadius: 4,
                    textAlign: 'center'
                }
            });
            
            // 标注成交量形态
            if (volumes) {
                graphicElements.push({
                    type: 'rect',
                    left: `${10 + ((index - 2) / dates.length) * 80}%`,
                    top: '70%',
                    style: {
                        width: `${(3 / dates.length) * 80}%`,
                        height: '20%',
                        fill: 'rgba(255, 87, 34, 0.1)',
                        stroke: 'rgba(255, 87, 34, 0.5)',
                        lineWidth: 1
                    }
                });
                
                // 添加成交量形态标注
                graphicElements.push({
                    type: 'text',
                    left: `${10 + ((index - 1) / dates.length) * 80}%`,
                    top: '65%',
                    style: {
                        text: '凹形量能',
                        fontSize: 12,
                        fontWeight: 'bold',
                        fill: '#FF5722',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: [4, 8],
                        borderRadius: 4,
                        textAlign: 'center'
                    }
                });
            }
        });
    }
    
    // 设置图形标注
    if (graphicElements.length > 0) {
        config.graphic = {
            elements: graphicElements
        }
    }

    // 添加CCI指标
    if (indicators && indicators.CCI) {
        // 计算CCI的网格索引
        let cciGridIndex = 1;
        if (volumes) {
            cciGridIndex++;
        }
        if (indicators.MACD) {
            cciGridIndex++;
        }
        
        // CCI线
        config.series.push({
            name: 'CCI',
            type: 'line',
            xAxisIndex: cciGridIndex,
            yAxisIndex: cciGridIndex,
            data: indicators.CCI,
            lineStyle: {
                color: '#8A2BE2', // 紫色
                width: 1.5
            },
            symbol: 'none',
            smooth: true,
            connectNulls: true
        });
        
        // 添加CCI超买超卖线 (+100 和 -100)
        config.series.push({
            name: 'CCI超买线',
            type: 'line',
            xAxisIndex: cciGridIndex,
            yAxisIndex: cciGridIndex,
            data: new Array(dates.length).fill(100),
            lineStyle: {
                color: '#FF6B6B',
                width: 1,
                type: 'dashed'
            },
            symbol: 'none',
            silent: true
        });
        
        config.series.push({
            name: 'CCI超卖线',
            type: 'line',
            xAxisIndex: cciGridIndex,
            yAxisIndex: cciGridIndex,
            data: new Array(dates.length).fill(-100),
            lineStyle: {
                color: '#4ECDC4',
                width: 1,
                type: 'dashed'
            },
            symbol: 'none',
            silent: true
        });
        
        // 添加CCI零线
        config.series.push({
            name: 'CCI零线',
            type: 'line',
            xAxisIndex: cciGridIndex,
            yAxisIndex: cciGridIndex,
            data: new Array(dates.length).fill(0),
            lineStyle: {
                color: '#999',
                width: 1,
                type: 'dashed'
            },
            symbol: 'none',
            silent: true
        });
    }

    return config
}