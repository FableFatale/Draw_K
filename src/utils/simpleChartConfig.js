// 简化的图表配置函数
export function getSimpleChartConfig(data) {
    console.log('Using simple chart config for data:', data);
    
    if (!data || !data.data || !data.dates) {
        console.error('Invalid data for simple chart config');
        return null;
    }
    
    const isDarkTheme = document.documentElement.classList.contains('dark-theme');
    
    const config = {
        backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
        title: {
            text: data.title || 'K线图',
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
        grid: data.volumes ? [
            {
                left: '10%',
                right: '8%',
                height: '65%'
            },
            {
                left: '10%',
                right: '8%',
                top: '75%',
                height: '15%'
            }
        ] : {
            left: '10%',
            right: '8%',
            top: '10%',
            bottom: '10%'
        },
        xAxis: data.volumes ? [
            {
                type: 'category',
                data: data.dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: data.dates,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false }
            }
        ] : {
            type: 'category',
            data: data.dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false }
        },
        yAxis: data.volumes ? [
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
                data: data.data,
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
    if (data.volumes) {
        config.series.push({
            name: '成交量',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data.volumes,
            itemStyle: {
                color: function(params) {
                    const dataIndex = params.dataIndex;
                    const kData = data.data[dataIndex];
                    return kData[1] > kData[0] ? '#ec0000' : '#00da3c';
                }
            }
        });
    }
    
    console.log('Simple config generated:', config);
    return config;
}