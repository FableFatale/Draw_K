import React from 'react';

export const ChartControls = ({ onTypeChange, activeType }) => {
    const chartTypes = [
        { id: 'up-trend', label: '上涨趋势', icon: '📈' },
        { id: 'down-trend', label: '下跌无量', icon: '📉' },
        { id: 'high-volume', label: '放量行情', icon: '📊' },
        { id: 'pattern-scan', label: '模式扫描', icon: '🔍' },
        { id: 'macd-index', label: 'MACD指标', icon: '📊' },
        { id: 'cci-effect', label: 'CCI效果', icon: '📈' },
        { id: 'price-compare', label: '量价背离', icon: '⚖️' },
        { id: 'volume-rise', label: '放量上涨', icon: '📈' }
    ];

    return (
        <div className="chart-controls">
            <div className="chart-type-buttons">
                <span className="hint-text">显示:</span>
                {chartTypes.map(type => (
                    <button
                        key={type.id}
                        className={activeType === type.id ? 'active' : ''}
                        onClick={() => onTypeChange(type.id)}
                    >
                        {type.icon} {type.label}
                    </button>
                ))}
            </div>
            <div className="input-hint">
                可以绘制走势图(上涨/下跌/震荡), 价格、天数(如15天/3周/2月)。技术指标(MACD/CCI等)和成交量特征(放量/缩量)
            </div>
        </div>
    );
};
