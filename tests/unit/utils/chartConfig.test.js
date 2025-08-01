import { describe, it, expect } from 'vitest';
import { getChartConfig } from '../../../src/utils/chartConfig.js';

// Mock the PatternRecognizer dependency
vi.mock('../../../src/utils/patternRecognizer.js', () => ({
  PatternRecognizer: {
    findCompletePattern: vi.fn().mockReturnValue([])
  }
}));

describe('chartConfig', () => {
  describe('getChartConfig', () => {
    it('should generate basic chart configuration', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107], // [open, close, low, high]
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        title: 'Test Chart'
      };
      
      const config = getChartConfig(chartData);
      
      // Check basic structure
      expect(config).toHaveProperty('title');
      expect(config).toHaveProperty('tooltip');
      expect(config).toHaveProperty('xAxis');
      expect(config).toHaveProperty('yAxis');
      expect(config).toHaveProperty('series');
      
      // Check title
      expect(config.title.text).toBe('Test Chart');
      
      // Check series
      expect(config.series.length).toBeGreaterThan(0);
      expect(config.series[0].type).toBe('candlestick');
      expect(config.series[0].data).toEqual(chartData.data);
    });
    
    it('should include volume chart when volumes are provided', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        volumes: [5000, 6000, 4500],
        title: 'Chart with Volumes'
      };
      
      const config = getChartConfig(chartData);
      
      // Check for volume series
      const volumeSeries = config.series.find(s => s.name === '成交量');
      expect(volumeSeries).toBeDefined();
      expect(volumeSeries.type).toBe('bar');
      expect(volumeSeries.data.length).toBe(3);
      
      // Check for volume trend series
      const volumeTrendSeries = config.series.find(s => s.name === '成交量趋势');
      expect(volumeTrendSeries).toBeDefined();
    });
    
    it('should include MA indicators when provided', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114],
          [108, 112, 107, 115],
          [112, 115, 110, 118]
        ],
        indicators: {
          MA5: [null, null, null, null, 110],
          MA10: [null, null, null, null, 108],
          MA20: [null, null, null, null, 105]
        },
        title: 'Chart with MA Indicators'
      };
      
      const config = getChartConfig(chartData);
      
      // Check for MA series
      const ma5Series = config.series.find(s => s.name === 'MA5');
      expect(ma5Series).toBeDefined();
      expect(ma5Series.type).toBe('line');
      expect(ma5Series.data).toEqual(chartData.indicators.MA5);
      
      const ma10Series = config.series.find(s => s.name === 'MA10');
      expect(ma10Series).toBeDefined();
      expect(ma10Series.data).toEqual(chartData.indicators.MA10);
      
      const ma20Series = config.series.find(s => s.name === 'MA20');
      expect(ma20Series).toBeDefined();
      expect(ma20Series.data).toEqual(chartData.indicators.MA20);
    });
    
    it('should include MA250 when provided', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        indicators: {
          MA5: [null, null, 108],
          MA250: [null, null, 100]
        },
        title: 'Chart with MA250'
      };
      
      const config = getChartConfig(chartData);
      
      // Check for MA250 series
      const ma250Series = config.series.find(s => s.name === 'MA250');
      expect(ma250Series).toBeDefined();
      expect(ma250Series.type).toBe('line');
      expect(ma250Series.data).toEqual(chartData.indicators.MA250);
      expect(ma250Series.lineStyle.type).toBe('dashed');
    });
    
    it('should configure grid layout based on chart components', () => {
      // Test with K-line only
      const klineOnly = getChartConfig({
        dates: ['2023-01-01'],
        data: [[100, 105, 98, 107]],
        title: 'K-line Only'
      });
      
      // Test with K-line and volume
      const withVolume = getChartConfig({
        dates: ['2023-01-01'],
        data: [[100, 105, 98, 107]],
        volumes: [5000],
        title: 'With Volume'
      });
      
      // Test with K-line and MACD
      const withMACD = getChartConfig({
        dates: ['2023-01-01'],
        data: [[100, 105, 98, 107]],
        indicators: {
          MACD: {
            dif: [0.5],
            dea: [0.3],
            macd: [0.4]
          }
        },
        title: 'With MACD'
      });
      
      // Check grid configurations
      expect(klineOnly.grid).toHaveProperty('left');
      expect(withVolume.grid).toBeInstanceOf(Array);
      expect(withVolume.grid.length).toBe(2);
      expect(withMACD.grid).toBeInstanceOf(Array);
      expect(withMACD.grid.length).toBe(2);
    });
    
    it('should configure dataZoom for interactive chart navigation', () => {
      const config = getChartConfig({
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        title: 'Test Chart'
      });
      
      expect(config.dataZoom).toBeDefined();
      expect(config.dataZoom.length).toBe(2);
      expect(config.dataZoom[0].type).toBe('inside');
      expect(config.dataZoom[1].type).toBe('slider');
    });
    
    it('should handle MACD indicator when provided', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        indicators: {
          MACD: {
            dif: [0.5, 0.6, 0.4],
            dea: [0.3, 0.4, 0.35],
            macd: [0.4, 0.4, 0.1]
          }
        },
        title: 'Chart with MACD'
      };
      
      const config = getChartConfig(chartData);
      
      // Check for MACD series
      const difSeries = config.series.find(s => s.name === 'DIF');
      expect(difSeries).toBeDefined();
      expect(difSeries.data).toEqual(chartData.indicators.MACD.dif);
      
      const deaSeries = config.series.find(s => s.name === 'DEA');
      expect(deaSeries).toBeDefined();
      expect(deaSeries.data).toEqual(chartData.indicators.MACD.dea);
      
      const macdSeries = config.series.find(s => s.name === 'MACD');
      expect(macdSeries).toBeDefined();
      expect(macdSeries.data.length).toBe(3);
    });
    
    it('should format tooltip correctly', () => {
      const chartData = {
        dates: ['2023-01-01'],
        data: [[100, 105, 98, 107]],
        title: 'Test Chart'
      };
      
      const config = getChartConfig(chartData);
      
      expect(config.tooltip).toBeDefined();
      expect(config.tooltip.formatter).toBeInstanceOf(Function);
      
      // Test the formatter function with mock params
      const mockParams = [
        {
          axisValue: '2023-01-01',
          seriesName: 'K线',
          data: [100, 105, 98, 107]
        }
      ];
      
      const tooltipContent = config.tooltip.formatter(mockParams);
      expect(tooltipContent).toContain('2023-01-01');
      expect(tooltipContent).toContain('100.00'); // Open price
      expect(tooltipContent).toContain('105.00'); // Close price
    });
  });
});    
it('should handle CCI indicator when provided', () => {
      const chartData = {
        dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112],
          [110, 108, 106, 114]
        ],
        indicators: {
          CCI: [50, 75, -25]
        },
        title: 'Chart with CCI'
      };
      
      const config = getChartConfig(chartData);
      
      // Check for CCI series
      const cciSeries = config.series.find(s => s.name === 'CCI');
      expect(cciSeries).toBeDefined();
      expect(cciSeries.type).toBe('line');
      expect(cciSeries.data).toEqual(chartData.indicators.CCI);
      
      // Check for CCI reference lines
      const cciBuyLine = config.series.find(s => s.name === 'CCI超买线');
      expect(cciBuyLine).toBeDefined();
      expect(cciBuyLine.data.length).toBe(3);
      expect(cciBuyLine.data[0]).toBe(100);
      
      const cciSellLine = config.series.find(s => s.name === 'CCI超卖线');
      expect(cciSellLine).toBeDefined();
      expect(cciSellLine.data.length).toBe(3);
      expect(cciSellLine.data[0]).toBe(-100);
      
      // Check grid configuration
      expect(config.grid).toBeInstanceOf(Array);
      expect(config.grid.length).toBe(2);
    });