import { describe, it, expect } from 'vitest';
import { DataProcessor } from '../../../src/utils/dataProcessor.js';

describe('DataProcessor', () => {
  let dataProcessor;

  beforeEach(() => {
    dataProcessor = new DataProcessor();
  });

  describe('analyzeInput', () => {
    it('should extract prices correctly', () => {
      const input = '股票从100涨到120，最高到达125，最低95';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.prices).toEqual([100, 120, 125, 95]);
    });

    it('should identify upward trend correctly', () => {
      const input = '上涨趋势，30天';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.trend).toBe('上涨');
    });

    it('should identify downward trend correctly', () => {
      const input = '下跌趋势，15天';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.trend).toBe('下跌');
    });

    it('should identify oscillating trend correctly', () => {
      const input = '震荡行情，20天';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.trend).toBe('震荡');
    });

    it('should extract period correctly', () => {
      const input = '上涨趋势，30天';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.period).toBe(30); // 这里期望30是因为输入明确指定了30天
    });

    it('should handle different period formats', () => {
      const inputs = [
        '上涨趋势，30天',
        '上涨趋势，30日',
        '上涨趋势，30个交易日',
        '上涨趋势，30交易日'
      ];
      
      inputs.forEach(input => {
        const result = dataProcessor.analyzeInput(input);
        expect(result.period).toBe(30);
      });
    });

    it('should detect volume settings correctly', () => {
      const withVolume = '上涨趋势，30天，带成交量';
      const withoutVolume = '上涨趋势，30天，不要成交量';
      
      const resultWith = dataProcessor.analyzeInput(withVolume);
      const resultWithout = dataProcessor.analyzeInput(withoutVolume);
      
      expect(resultWith.hasVolume).toBe(true);
      expect(resultWithout.hasVolume).toBe(false);
    });

    it('should extract specific prices correctly', () => {
      const input = '开盘价100，收盘价120，最高价125，最低价95';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.specificPrices.open).toBe(100);
      expect(result.specificPrices.close).toBe(120);
      expect(result.specificPrices.high).toBe(125);
      expect(result.specificPrices.low).toBe(95);
    });

    it('should identify volume trend correctly', () => {
      const inputs = {
        '缩量上涨': 'shrinking',
        '放量下跌': 'expanding',
        '量能萎缩': 'shrinking',
        '量能放大': 'expanding',
        '无量': 'shrinking',
        '天量': 'expanding'
      };
      
      Object.entries(inputs).forEach(([input, expected]) => {
        const result = dataProcessor.analyzeInput(input);
        expect(result.volumeTrend).toBe(expected);
      });
    });

    it('should handle complex input with multiple parameters', () => {
      const input = '上涨趋势，30天，开盘价100，收盘价120，最高价125，最低价95，放量上涨';
      const result = dataProcessor.analyzeInput(input);
      
      expect(result.trend).toBe('上涨');
      expect(result.period).toBe(30);
      expect(result.specificPrices.open).toBe(100);
      expect(result.specificPrices.close).toBe(120);
      expect(result.specificPrices.high).toBe(125);
      expect(result.specificPrices.low).toBe(95);
      expect(result.volumeTrend).toBe('expanding');
      expect(result.volumePriceRelation).toBe('consistent');
    });
  });

  describe('generateChartData', () => {
    it('should generate correct number of data points', () => {
      const analysis = {
        prices: [100],
        trend: '上涨',
        period: 20,
        hasVolume: true
      };
      
      const result = dataProcessor.generateChartData(analysis);
      
      expect(result.dates.length).toBe(20); // 测试中使用的周期为20天
      expect(result.data.length).toBe(20); // 测试中使用的周期为20天
      expect(result.volumes.length).toBe(20);
    });

    it('should generate data with correct structure', () => {
      const analysis = {
        prices: [100],
        trend: '上涨',
        period: 5,
        hasVolume: true
      };
      
      const result = dataProcessor.generateChartData(analysis);
      
      // Check data structure
      expect(result).toHaveProperty('dates');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('volumes');
      expect(result).toHaveProperty('indicators');
      expect(result).toHaveProperty('title');
      
      // Check OHLC format
      const firstCandle = result.data[0];
      expect(firstCandle).toHaveLength(4);
      expect(typeof firstCandle[0]).toBe('number'); // open
      expect(typeof firstCandle[1]).toBe('number'); // close
      expect(typeof firstCandle[2]).toBe('number'); // low
      expect(typeof firstCandle[3]).toBe('number'); // high
      
      // Check indicators
      expect(result.indicators).toHaveProperty('MA5');
      expect(result.indicators).toHaveProperty('MA10');
      expect(result.indicators).toHaveProperty('MA20');
    });

    it('should respect specific prices when provided', () => {
      const analysis = {
        prices: [100],
        trend: '上涨',
        period: 5,
        hasVolume: true,
        specificPrices: {
          open: 100,
          close: 120,
          high: 125,
          low: 95
        }
      };
      
      const result = dataProcessor.generateChartData(analysis);
      
      // First day should use the specified open price
      expect(result.data[0][0]).toBeCloseTo(100, 0);
      
      // Last day should use the specified close price
      const lastDay = result.data[result.data.length - 1];
      expect(lastDay[1]).toBeCloseTo(120, 0);
    });

    it('should generate appropriate volumes based on price movement', () => {
      const analysis = {
        prices: [100],
        trend: '上涨',
        period: 10,
        hasVolume: true,
        volumeTrend: 'expanding'
      };
      
      const result = dataProcessor.generateChartData(analysis);
      
      // Check that volumes are numbers
      result.volumes.forEach(volume => {
        expect(typeof volume).toBe('number');
        expect(volume).toBeGreaterThan(0);
      });
      
      // With expanding volume trend, later volumes should be generally higher
      const firstHalfAvg = result.volumes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const secondHalfAvg = result.volumes.slice(5).reduce((a, b) => a + b, 0) / 5;
      
      // This is a probabilistic test, but with 'expanding' trend it should pass most of the time
      expect(secondHalfAvg).toBeGreaterThan(firstHalfAvg * 0.8);
    });
  });

  describe('getTrendFactor', () => {
    it('should return positive values for upward trend', () => {
      const result = dataProcessor.getTrendFactor('上涨', 10, 20);
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative values for downward trend', () => {
      const result = dataProcessor.getTrendFactor('下跌', 10, 20);
      expect(result).toBeLessThan(0);
    });

    it('should return values close to zero for sideways trend', () => {
      const result = dataProcessor.getTrendFactor('横盘', 10, 20);
      expect(Math.abs(result)).toBeLessThan(0.01);
    });
  });

  describe('generateDayData', () => {
    it('should generate valid OHLC data', () => {
      const result = dataProcessor.generateDayData(100, '上涨', 5, 20);
      
      expect(result).toHaveProperty('ohlc');
      expect(result).toHaveProperty('volume');
      
      const [open, close, low, high] = result.ohlc;
      
      expect(typeof open).toBe('number');
      expect(typeof close).toBe('number');
      expect(typeof low).toBe('number');
      expect(typeof high).toBe('number');
      
      // Check that high is the highest value
      expect(high).toBeGreaterThanOrEqual(open);
      expect(high).toBeGreaterThanOrEqual(close);
      
      // Check that low is the lowest value
      expect(low).toBeLessThanOrEqual(open);
      expect(low).toBeLessThanOrEqual(close);
    });
  });

  describe('calculateMA', () => {
    it('should calculate moving average correctly', () => {
      const data = [10, 20, 30, 40, 50];
      const ma3 = dataProcessor.calculateMA(data, 3);
      
      // 新的计算方法会从第一个点开始计算
      expect(ma3).toEqual([10, 15, 20, 30, 40]);
    });

    it('should handle empty data', () => {
      const data = [];
      const ma3 = dataProcessor.calculateMA(data, 3);
      
      expect(ma3).toEqual([]);
    });
    
    it('should calculate partial averages when data points are insufficient', () => {
      const data = [10, 20, 30];
      const ma5 = dataProcessor.calculateMA(data, 5);
      
      // 数据点不足时，使用可用的数据点计算平均值
      expect(ma5).toEqual([10, 15, 20]);
    });
  });

  describe('processUserInput', () => {
    it('should process valid input correctly', () => {
      const input = '上涨趋势，30天';
      const result = dataProcessor.processUserInput(input);
      
      expect(result).toHaveProperty('dates');
      expect(result).toHaveProperty('data');
      expect(result.dates.length).toBe(30);
      expect(result.data.length).toBe(30);
    });

    it('should return sample data for invalid input', () => {
      // Mock console.error to avoid polluting test output
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      const input = ''; // Empty input should trigger error handling
      const result = dataProcessor.processUserInput(input);
      
      // Verify we still get valid chart data
      expect(result).toHaveProperty('dates');
      expect(result).toHaveProperty('data');
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('generateTitle', () => {
    it('should generate appropriate title based on analysis', () => {
      const analyses = [
        {
          trend: '上涨',
          period: 30,
          volumeTrend: 'normal',
          volumePriceRelation: 'normal',
          expectedTitle: '上涨趋势 - 30日K线图'
        },
        {
          trend: '下跌',
          period: 20,
          volumeTrend: 'shrinking',
          volumePriceRelation: 'normal',
          expectedTitle: '下跌趋势 - 20日K线图 | 缩量'
        },
        {
          trend: '震荡',
          period: 15,
          volumeTrend: 'expanding',
          volumePriceRelation: 'consistent',
          expectedTitle: '震荡趋势 - 15日K线图 | 放量 | 量价齐升'
        }
      ];
      
      analyses.forEach(({ trend, period, volumeTrend, volumePriceRelation, expectedTitle }) => {
        const title = dataProcessor.generateTitle({ trend, period, volumeTrend, volumePriceRelation });
        expect(title).toBe(expectedTitle);
      });
    });
  });
});