// 生成错误配置的辅助函数
function getErrorConfig(title, message) {
    // 安全地检查主题，避免在 Node.js 环境中出错
    const isDarkTheme = typeof document !== 'undefined' && 
                       document.documentElement && 
                       document.documentElement.classList.contains('dark-theme');
    
    return {
        backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
        title: {
            text: title,
            left: 'center',
            top: '45%',
            textStyle: {
                fontSize: 16,
                color: isDarkTheme ? '#ff5252' : '#d32f2f',
                fontWeight: 'bold'
            }
        },
        graphic: [{
            type: 'text',
            left: 'center',
            top: '55%',
            style: {
                text: message,
                font: '14px Microsoft YaHei',
                fill: isDarkTheme ? '#888' : '#666'
            }
        }]
    };
}

export function getChartConfig(data) {
    if (!data) {
        console.error('Chart data is null or undefined');
        return getErrorConfig('数据错误', '图表数据为空，请检查数据源');
    }

    try {
        console.log('Processing chart data:', data);
        
        // 检查是否是分时图
        if (data.chartType === 'time' && data.timeData) {
            return generateIntradayChart(data);
        }

        // 解构并验证K线数据结构  
        const { 
            dates, 
            data: klineData, 
            volumes, 
            indicators, 
            title = '',
            chartType = 'candlestick',
            macdData,
            macdSignals
        } = data;

        // 验证K线数据
        if (!Array.isArray(dates) || !Array.isArray(klineData) || 
            dates.length === 0 || klineData.length === 0 ||
            dates.length !== klineData.length) {
            console.error('Invalid candlestick data');
            return getErrorConfig('数据错误', '无效的K线数据');
        }

        // 验证K线数据格式
        const invalidKline = klineData.some(item => {
            return !Array.isArray(item) || 
                   item.length < 4 ||
                   item.some(value => isNaN(Number(value)));
        });

        if (invalidKline) {
            console.error('Malformed candlestick data');
            return getErrorConfig('数据错误', 'K线数据格式错误');
        }

        return generateCandlestickChart(data);

    } catch (error) {
        console.error('Chart configuration error:', error);
        return getErrorConfig('配置错误', error.message || '生成图表配置时出错');
    }
}

function generateIntradayChart(data) {
    const { timeData, title, timeRange, macdData, technicalIndicators } = data;
    // 安全地检查主题，避免在 Node.js 环境中出错
    const isDarkTheme = typeof document !== 'undefined' && 
                       document.documentElement && 
                       document.documentElement.classList.contains('dark-theme');
    
    console.log('Generating intraday chart with data:', { 
        dataLength: timeData?.length, 
        hasMacd: !!macdData,
        timeRange,
        sampleData: timeData?.slice(0, 3)
    });

    if (!timeData || !Array.isArray(timeData) || timeData.length === 0) {
        console.error('Invalid timeData for intraday chart:', timeData);
        return getErrorConfig('数据错误', '分时图数据无效');
    }

    // 处理时间和价格数据
    const times = timeData.map(item => item.time);
    const prices = timeData.map(item => item.price);
    const avgPrices = timeData.map(item => item.avgPrice);
    const volumes = timeData.map(item => item.volume);

    console.log('Processed data:', {
        timesLength: times.length,
        pricesLength: prices.length,
        sampleTimes: times.slice(0, 5),
        samplePrices: prices.slice(0, 5)
    });

    // 基础配置
    const config = {
        backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
        animation: false,
        title: {
            text: title || '分时图',
            left: 'center',
            top: '2%',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: isDarkTheme ? '#eceff4' : '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                link: [{xAxisIndex: 'all'}]
            },
            backgroundColor: isDarkTheme ? 'rgba(33, 33, 33, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkTheme ? '#555' : '#ddd',
            textStyle: {
                color: isDarkTheme ? '#eee' : '#333',
                fontSize: 12
            },
            formatter: function(params) {
                if (!params || params.length === 0) return '';
                
                let result = `<div style="margin: 4px 0;">
                    <strong>${params[0].axisValueLabel}</strong>
                </div>`;
                
                params.forEach(param => {
                    if (param.seriesName === '分时价格') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            ${param.seriesName}: <strong>${param.value.toFixed(2)}</strong>
                        </div>`;
                    } else if (param.seriesName === '均价线') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            ${param.seriesName}: <strong>${param.value.toFixed(2)}</strong>
                        </div>`;
                    } else if (param.seriesName === '成交量') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            ${param.seriesName}: <strong>${param.value.toLocaleString()}</strong>
                        </div>`;
                    } else if (param.seriesName === 'DIF') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            DIF: <strong>${param.value ? param.value.toFixed(4) : '0.0000'}</strong>
                        </div>`;
                    } else if (param.seriesName === 'DEA') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            DEA: <strong>${param.value ? param.value.toFixed(4) : '0.0000'}</strong>
                        </div>`;
                    } else if (param.seriesName === 'MACD') {
                        result += `<div style="margin: 2px 0;">
                            <span style="color: ${param.color};">●</span> 
                            MACD: <strong>${param.value ? param.value.toFixed(4) : '0.0000'}</strong>
                        </div>`;
                    }
                });
                
                return result;
            }
        },
        grid: macdData ? [
            {
                left: '8%',
                right: '5%',
                top: '12%',
                height: '35%'
            },
            {
                left: '8%',
                right: '5%',
                top: '52%',
                height: '12%'
            },
            {
                left: '8%',
                right: '5%',
                top: '70%',
                height: '25%'
            }
        ] : [
            {
                left: '8%',
                right: '5%',
                top: '12%',
                height: '55%'
            },
            {
                left: '8%',
                right: '5%',
                top: '72%',
                height: '20%'
            }
        ],
        xAxis: macdData ? [
            {
                type: 'category',
                data: times,
                axisLabel: {
                    color: isDarkTheme ? '#aaa' : '#666',
                    show: false
                },
                axisTick: { show: false },
                axisLine: { show: false }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: times,
                axisLabel: { show: false },
                axisTick: { show: false },
                axisLine: { show: false }
            },
            {
                type: 'category',
                gridIndex: 2,
                data: times,
                axisLabel: {
                    color: isDarkTheme ? '#aaa' : '#666',
                    fontSize: 10,
                    interval: Math.floor(times.length / 8)
                },
                axisTick: { show: true },
                axisLine: { show: true, lineStyle: { color: isDarkTheme ? '#444' : '#ddd' } }
            }
        ] : [
            {
                type: 'category',
                data: times,
                axisLabel: {
                    color: isDarkTheme ? '#aaa' : '#666'
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: times,
                axisLabel: { show: false }
            }
        ],
        yAxis: macdData ? [
            {
                type: 'value',
                scale: true,
                axisLabel: {
                    color: isDarkTheme ? '#aaa' : '#666',
                    fontSize: 10
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: isDarkTheme ? '#333' : '#f0f0f0',
                        type: 'dashed'
                    }
                }
            },
            {
                type: 'value',
                gridIndex: 1,
                scale: true,
                axisLabel: { 
                    show: true,
                    color: isDarkTheme ? '#aaa' : '#666',
                    fontSize: 9
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            {
                type: 'value',
                gridIndex: 2,
                scale: false, // 不使用自动缩放
                min: -0.5, // 更小的固定范围
                max: 0.5,  // 更小的固定范围
                splitNumber: 8, // 增加分割数
                axisLabel: {
                    show: true,
                    color: isDarkTheme ? '#aaa' : '#666',
                    fontSize: 10,
                    formatter: function(value) {
                        return value.toFixed(1);
                    }
                },
                axisLine: { 
                    show: true, 
                    lineStyle: { color: isDarkTheme ? '#444' : '#ddd' } 
                },
                axisTick: { show: true },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: function(params) {
                            // 零轴线加粗显示
                            return Math.abs(params.value) < 0.001 ? 
                                (isDarkTheme ? '#888' : '#666') : 
                                (isDarkTheme ? '#333' : '#f0f0f0');
                        },
                        width: function(params) {
                            return Math.abs(params.value) < 0.001 ? 3 : 1;
                        },
                        type: function(params) {
                            return Math.abs(params.value) < 0.001 ? 'solid' : 'dashed';
                        }
                    }
                }
            }
        ] : [
            {
                type: 'value',
                scale: true,
                axisLabel: {
                    color: isDarkTheme ? '#aaa' : '#666'
                }
            },
            {
                type: 'value',
                gridIndex: 1,
                scale: true,
                axisLabel: { show: false }
            }
        ],
        series: [
            {
                name: '分时价格',
                type: 'line',
                data: prices,
                smooth: false,
                showSymbol: false,
                lineStyle: {
                    color: isDarkTheme ? '#81c784' : '#4CAF50',
                    width: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: isDarkTheme ? 'rgba(129,199,132,0.3)' : 'rgba(76,175,80,0.3)' },
                            { offset: 1, color: isDarkTheme ? 'rgba(129,199,132,0.05)' : 'rgba(76,175,80,0.05)' }
                        ]
                    }
                }
            },
            {
                name: '均价线',
                type: 'line',
                data: avgPrices,
                smooth: false,
                showSymbol: false,
                lineStyle: {
                    color: isDarkTheme ? '#ffb74d' : '#FFA726',
                    width: 1.5,
                    type: 'dashed'
                }
            },
            {
                name: '成交量',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: volumes.map((volume, index) => ({
                    value: volume,
                    itemStyle: {
                        color: timeData[index].price >= timeData[index].avgPrice ? 
                            (isDarkTheme ? 'rgba(129,199,132,0.8)' : 'rgba(76,175,80,0.8)') :
                            (isDarkTheme ? 'rgba(239,83,80,0.8)' : 'rgba(244,67,54,0.8)')
                    }
                }))
            }
        ]
    };

    // 添加MACD指标
    if (macdData) {
        // 添加MACD区域专业图例
        config.legend = {
            data: [
                {
                    name: 'DIF',
                    icon: 'line',
                    textStyle: {
                        color: isDarkTheme ? '#ff6b6b' : '#ff4757',
                        fontSize: 12,
                        fontWeight: 'bold'
                    }
                },
                {
                    name: 'DEA', 
                    icon: 'line',
                    textStyle: {
                        color: isDarkTheme ? '#4ecdc4' : '#1dd1a1',
                        fontSize: 12,
                        fontWeight: 'bold'
                    }
                },
                {
                    name: 'MACD',
                    icon: 'rect',
                    textStyle: {
                        color: isDarkTheme ? '#aaa' : '#666',
                        fontSize: 11
                    }
                }
            ],
            right: '5%',
            top: '66%',
            orient: 'horizontal',
            itemGap: 20,
            backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
            padding: [6, 10],
            borderRadius: 4,
            borderColor: isDarkTheme ? '#444' : '#ddd',
            borderWidth: 1,
            textStyle: {
                fontSize: 11
            }
        };
        
        config.series.push(
            {
                name: 'DIF',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: macdData.dif,
                lineStyle: {
                    color: isDarkTheme ? '#ff6b6b' : '#ff4757',
                    width: 4, // 进一步增加线宽
                    shadowColor: 'rgba(255, 71, 87, 0.3)',
                    shadowBlur: 3
                },
                showSymbol: true, // 显示数据点
                symbol: 'circle',
                symbolSize: 2,
                smooth: false,
                emphasis: {
                    lineStyle: {
                        width: 5
                    }
                }
            },
            {
                name: 'DEA',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: macdData.dea,
                lineStyle: {
                    color: isDarkTheme ? '#4ecdc4' : '#1dd1a1',
                    width: 4, // 进一步增加线宽
                    shadowColor: 'rgba(29, 209, 161, 0.3)',
                    shadowBlur: 3
                },
                showSymbol: true, // 显示数据点
                symbol: 'circle',
                symbolSize: 2,
                smooth: false,
                emphasis: {
                    lineStyle: {
                        width: 5
                    }
                }
            },
            {
                name: 'MACD',
                type: 'bar',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: macdData.histogram.map((val, index) => ({
                    value: val,
                    itemStyle: {
                        color: val >= 0 ? 
                            (isDarkTheme ? 'rgba(255,107,107,0.8)' : 'rgba(255,71,87,0.8)') : 
                            (isDarkTheme ? 'rgba(78,205,196,0.8)' : 'rgba(29,209,161,0.8)'),
                        borderColor: val >= 0 ? 
                            (isDarkTheme ? '#ff6b6b' : '#ff4757') : 
                            (isDarkTheme ? '#4ecdc4' : '#1dd1a1'),
                        borderWidth: 1
                    }
                })),
                barWidth: '60%',
                barMaxWidth: 4
            }
        );

        // 添加零轴线
        config.series.push({
            name: '零轴',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: new Array(macdData.dif.length).fill(0),
            lineStyle: {
                color: isDarkTheme ? '#666' : '#999',
                width: 2,
                type: 'solid',
                opacity: 0.8
            },
            showSymbol: false,
            silent: true,
            tooltip: { show: false },
            emphasis: { disabled: true }
        });

        // 检测金叉和死叉点
        const crossPoints = [];
        for (let i = 1; i < macdData.dif.length; i++) {
            const prevDif = macdData.dif[i-1];
            const currDif = macdData.dif[i];
            const prevDea = macdData.dea[i-1];
            const currDea = macdData.dea[i];
            
            // 检查是否有足够的DEA数据
            if (prevDea === 0 || currDea === 0) continue;
            
            // 金叉：DIF上穿DEA
            if (prevDif <= prevDea && currDif > currDea && currDif > 0) {
                crossPoints.push({
                    index: i,
                    type: 'goldenCross',
                    difValue: currDif,
                    deaValue: currDea
                });
            }
            // 死叉：DIF下穿DEA  
            else if (prevDif >= prevDea && currDif < currDea && currDif < 0) {
                crossPoints.push({
                    index: i,
                    type: 'deathCross',
                    difValue: currDif,
                    deaValue: currDea
                });
            }
        }

        // 添加金叉死叉标记到DIF线上
        if (crossPoints.length > 0) {
            const difSeriesIndex = 3; // DIF线在系列中的索引
            if (config.series[difSeriesIndex]) {
                config.series[difSeriesIndex].markPoint = {
                    data: crossPoints.map(point => ({
                        coord: [point.index, point.difValue],
                        symbol: point.type === 'goldenCross' ? 'triangle' : 'diamond',
                        symbolSize: point.type === 'goldenCross' ? 18 : 15,
                        itemStyle: {
                            color: point.type === 'goldenCross' ? '#FFD700' : '#FF4500',
                            borderColor: point.type === 'goldenCross' ? '#FF8C00' : '#8B0000',
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            formatter: point.type === 'goldenCross' ? '金叉' : '死叉',
                            position: point.type === 'goldenCross' ? 'top' : 'bottom',
                            color: point.type === 'goldenCross' ? '#FFD700' : '#FF4500',
                            fontWeight: 'bold',
                            fontSize: 11,
                            offset: [0, point.type === 'goldenCross' ? -5 : 5]
                        }
                    }))
                };
                
                console.log(`Added ${crossPoints.length} cross markers:`, 
                    crossPoints.map(p => `${p.type} at ${p.index}`));
            }
        }

        // 添加金叉标记到DIF线上
        if (technicalIndicators?.macd?.signals?.includes('goldenCross')) {
            // 首先生成MACD数据以便检测真实的金叉点
            if (!macdData) {
                console.warn('MACD data not available for golden cross detection');
                return config;
            }
            
            // 查找真实的金叉点
            const goldenCrossPoints = [];
            for (let i = 1; i < times.length && i < macdData.dif.length; i++) {
                const prevDifBelowDea = macdData.dif[i-1] <= macdData.dea[i-1];
                const currDifAboveDea = macdData.dif[i] > macdData.dea[i];
                
                if (prevDifBelowDea && currDifAboveDea) {
                    goldenCrossPoints.push({
                        index: i,
                        time: times[i],
                        difValue: macdData.dif[i],
                        deaValue: macdData.dea[i]
                    });
                    console.log(`Golden cross detected at ${times[i]}: DIF=${macdData.dif[i].toFixed(4)}, DEA=${macdData.dea[i].toFixed(4)}`);
                }
            }
            
            // 如果没有找到真实金叉，使用模拟位置
            if (goldenCrossPoints.length === 0) {
                const simulatedIndex = Math.floor(times.length * 0.5);
                goldenCrossPoints.push({
                    index: simulatedIndex,
                    time: times[simulatedIndex],
                    difValue: macdData.dif[simulatedIndex],
                    deaValue: macdData.dea[simulatedIndex],
                    isSimulated: true
                });
                console.log(`Using simulated golden cross at ${times[simulatedIndex]}`);
            }
            
            // DIF线是series中的第4个元素（索引3，因为有价格线、均价线、成交量）
            const difSeriesIndex = 3;
            if (config.series[difSeriesIndex] && goldenCrossPoints.length > 0) {
                config.series[difSeriesIndex].markPoint = {
                    data: goldenCrossPoints.map(point => ({
                        coord: [point.index, point.difValue],
                        symbol: 'pin',
                        symbolSize: 20,
                        itemStyle: {
                            color: '#FFD700',
                            borderColor: '#FF8C00',
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            formatter: point.isSimulated ? '金叉(模拟)' : '金叉',
                            position: 'top',
                            color: '#FFD700',
                            fontWeight: 'bold',
                            fontSize: 11,
                            offset: [0, -5]
                        }
                    }))
                };
                
                console.log(`Added ${goldenCrossPoints.length} golden cross markers to DIF line`);
            }
        }
    }

    return config;
}

function generateCandlestickChart(data) {
    const { 
        dates, 
        data: klineData, 
        volumes, 
        title,
        macdData,
        macdSignals,
        technicalIndicators
    } = data;
    
    console.log('Generating candlestick chart with data:', {
        hasDates: !!dates,
        datesLength: dates?.length,
        hasKlineData: !!klineData,
        klineDataLength: klineData?.length,
        hasVolumes: !!volumes,
        hasMacdData: !!macdData,
        macdDataStructure: macdData ? {
            hasDif: !!macdData.dif,
            difLength: macdData.dif?.length,
            hasDea: !!macdData.dea,
            deaLength: macdData.dea?.length,
            hasHistogram: !!macdData.histogram,
            histogramLength: macdData.histogram?.length,
            sampleDif: macdData.dif?.slice(30, 35),
            sampleDea: macdData.dea?.slice(30, 35)
        } : null,
        hasTechnicalIndicators: !!technicalIndicators,
        technicalIndicators: technicalIndicators
    });
    
    // 安全地检查主题，避免在 Node.js 环境中出错
    const isDarkTheme = typeof document !== 'undefined' && 
                       document.documentElement && 
                       document.documentElement.classList.contains('dark-theme');

    const config = {
        backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
        animation: false,
        title: {
            text: title || 'K线图',
            left: 'center',
            textStyle: {
                color: isDarkTheme ? '#e0e0e0' : '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        grid: macdData ? [
            {
                left: '8%',
                right: '5%',
                top: '12%',
                height: '30%'
            },
            {
                left: '8%',
                right: '5%',
                top: '47%',
                height: '15%'
            },
            {
                left: '8%',
                right: '5%',
                top: '67%',
                height: '22%'
            }
        ] : volumes ? [
            {
                left: '8%',
                right: '5%',
                top: '12%',
                height: '60%'
            },
            {
                left: '8%',
                right: '5%',
                top: '77%',
                height: '15%'
            }
        ] : {
            left: '8%',
            right: '5%',
            top: '10%',
            bottom: '10%'
        },
        xAxis: macdData ? [
            {
                type: 'category',
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false }
            },
            {
                type: 'category',
                gridIndex: 2,
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false }
            }
        ] : volumes ? [
            {
                type: 'category',
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false }
            }
        ] : {
            type: 'category',
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false }
        },
        yAxis: macdData ? [
            {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            {
                scale: false, // 不使用自动缩放
                gridIndex: 2,
                splitNumber: 8, // 增加分割数，让零轴更明显
                min: -0.5, // 更小的固定范围
                max: 0.5,  // 更小的固定范围
                axisLabel: { 
                    show: true,
                    color: isDarkTheme ? '#aaa' : '#666',
                    fontSize: 10,
                    formatter: function(value) {
                        return value.toFixed(1);  
                    }
                },
                axisLine: { 
                    show: true,
                    lineStyle: { color: isDarkTheme ? '#444' : '#ddd' }
                },
                axisTick: { show: true },
                splitLine: { 
                    show: true,
                    lineStyle: {
                        color: function(params) {
                            // 零轴线特殊处理：更突出的颜色和样式
                            return Math.abs(params.value) < 0.001 ? 
                                (isDarkTheme ? '#888' : '#666') : 
                                (isDarkTheme ? '#333' : '#f0f0f0');
                        },
                        width: function(params) {
                            return Math.abs(params.value) < 0.001 ? 3 : 1;
                        },
                        type: function(params) {
                            return Math.abs(params.value) < 0.001 ? 'solid' : 'dashed';
                        }
                    }
                }
            }
        ] : volumes ? [
            {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            }
        ] : {
            scale: true,
            splitArea: {
                show: true
            }
        },
        series: [
            {
                name: 'K线',
                type: 'candlestick',
                data: klineData,
                itemStyle: {
                    color: '#ec0000',
                    color0: '#00da3c',
                    borderColor: '#8A0000',
                    borderColor0: '#008F28'
                }
            }
        ]
    };

    // 添加成交量系列
    if (volumes) {
        const volumeSeriesIndex = macdData ? 1 : 1;
        config.series.push({
            name: '成交量',
            type: 'bar',
            xAxisIndex: volumeSeriesIndex,
            yAxisIndex: volumeSeriesIndex,
            data: volumes.map((volume, index) => {
                const kData = klineData[index];
                return {
                    value: volume,
                    itemStyle: {
                        color: kData[1] > kData[0] ? '#ec0000' : '#00da3c'
                    }
                };
            })
        });
    }

    // 添加MACD指标
    if (macdData) {
        console.log('Adding MACD indicator to candlestick chart');
        console.log('MACD data validation:', {
            hasDif: !!macdData.dif,
            difLength: macdData.dif?.length,
            difNonZeroCount: macdData.dif?.filter(v => v !== 0).length,
            hasDea: !!macdData.dea,
            deaLength: macdData.dea?.length,
            deaNonZeroCount: macdData.dea?.filter(v => v !== 0).length,
            hasHistogram: !!macdData.histogram,
            histogramLength: macdData.histogram?.length,
            difSample: macdData.dif?.slice(25, 35),
            deaSample: macdData.dea?.slice(25, 35),
            histogramSample: macdData.histogram?.slice(25, 35)
        });
        
        const macdSeriesIndex = volumes ? 2 : 1;
        const macdXAxisIndex = volumes ? 2 : 1;
        const macdYAxisIndex = volumes ? 2 : 1;
        
        console.log('MACD axis configuration:', {
            hasVolumes: !!volumes,
            macdSeriesIndex,
            macdXAxisIndex, 
            macdYAxisIndex,
            totalGrids: Array.isArray(config.grid) ? config.grid.length : 1,
            totalXAxes: Array.isArray(config.xAxis) ? config.xAxis.length : 1,
            totalYAxes: Array.isArray(config.yAxis) ? config.yAxis.length : 1
        });
        
        config.series.push(
            {
                name: 'DIF',
                type: 'line',
                xAxisIndex: macdXAxisIndex,
                yAxisIndex: macdYAxisIndex,
                data: macdData.dif,
                lineStyle: {
                    color: '#ff4757',
                    width: 4, // 进一步增加线宽
                    shadowColor: 'rgba(255, 71, 87, 0.3)',
                    shadowBlur: 3
                },
                showSymbol: true, // 显示数据点
                symbol: 'circle',
                symbolSize: 2,
                smooth: false,
                emphasis: {
                    lineStyle: {
                        width: 5
                    }
                }
            },
            {
                name: 'DEA',
                type: 'line',
                xAxisIndex: macdXAxisIndex,
                yAxisIndex: macdYAxisIndex,
                data: macdData.dea,
                lineStyle: {
                    color: '#1dd1a1',
                    width: 4, // 进一步增加线宽
                    shadowColor: 'rgba(29, 209, 161, 0.3)',
                    shadowBlur: 3
                },
                showSymbol: true, // 显示数据点
                symbol: 'circle',
                symbolSize: 2,
                smooth: false,
                emphasis: {
                    lineStyle: {
                        width: 5
                    }
                }
            },
            {
                name: 'MACD',
                type: 'bar',
                xAxisIndex: macdXAxisIndex,
                yAxisIndex: macdYAxisIndex,
                data: macdData.histogram.map(val => ({
                    value: val,
                    itemStyle: {
                        color: val >= 0 ? 'rgba(255, 71, 87, 0.8)' : 'rgba(29, 209, 161, 0.8)',
                        borderColor: val >= 0 ? '#ff4757' : '#1dd1a1',
                        borderWidth: 1
                    }
                })),
                barWidth: '60%'
            }
        );

        console.log('MACD series added. Total series count:', config.series.length);

        // 添加MACD指标的零轴线
        config.series.push({
            name: 'MACD零轴',
            type: 'line',
            xAxisIndex: macdXAxisIndex,
            yAxisIndex: macdYAxisIndex,
            data: new Array(macdData.dif.length).fill(0),
            lineStyle: {
                color: isDarkTheme ? '#666' : '#999',
                width: 2,
                type: 'solid',
                opacity: 0.8
            },
            showSymbol: false,
            silent: true,
            tooltip: { show: false },
            emphasis: { disabled: true }
        });

        // 检测所有金叉和死叉点
        const allCrossPoints = [];
        for (let i = 1; i < macdData.dif.length; i++) {
            const prevDif = macdData.dif[i-1];
            const currDif = macdData.dif[i];
            const prevDea = macdData.dea[i-1];
            const currDea = macdData.dea[i];
            
            // 跳过DEA为0的点
            if (prevDea === 0 || currDea === 0) continue;
            
            // 金叉：DIF上穿DEA
            if (prevDif <= prevDea && currDif > currDea) {
                allCrossPoints.push({
                    index: i,
                    type: 'goldenCross',
                    difValue: currDif,
                    deaValue: currDea
                });
            }
            // 死叉：DIF下穿DEA
            else if (prevDif >= prevDea && currDif < currDea) {
                allCrossPoints.push({
                    index: i,
                    type: 'deathCross',
                    difValue: currDif,
                    deaValue: currDea
                });
            }
        }

        // 将交叉点标记添加到DIF线上
        if (allCrossPoints.length > 0) {
            const baseSeries = 1; // K线
            const volumeSeries = volumes ? 1 : 0;
            const difIndex = baseSeries + volumeSeries; // DIF线索引
            
            if (config.series[difIndex]) {
                config.series[difIndex].markPoint = {
                    data: allCrossPoints.map(point => ({
                        coord: [point.index, point.difValue],
                        symbol: point.type === 'goldenCross' ? 'triangle' : 'diamond',
                        symbolSize: point.type === 'goldenCross' ? 20 : 16,
                        itemStyle: {
                            color: point.type === 'goldenCross' ? '#FFD700' : '#FF4500',
                            borderColor: point.type === 'goldenCross' ? '#FF8C00' : '#8B0000',
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            formatter: point.type === 'goldenCross' ? '金叉' : '死叉',
                            position: point.type === 'goldenCross' ? 'top' : 'bottom',
                            color: point.type === 'goldenCross' ? '#FFD700' : '#FF4500',
                            fontWeight: 'bold',
                            fontSize: 12,
                            offset: [0, point.type === 'goldenCross' ? -8 : 8]
                        }
                    }))
                };
                
                console.log(`Added ${allCrossPoints.length} cross markers to K-line chart:`, 
                    allCrossPoints.map(p => `${p.type} at ${p.index}`));
            }
        }
    }

    return config;
}