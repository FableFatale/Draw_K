import { describe, it, expect } from 'vitest';
import { PatternRecognizer } from '../../../src/utils/patternRecognizer.js';

describe('PatternRecognizer', () => {
  describe('recognizeBreakoutPattern', () => {
    it('should recognize valid breakout pattern', () => {
      // Create test data with a breakout pattern
      // Format: [open, close, low, high]
      const klineData = [
        [100, 102, 99, 103],   // Random candle
        [102, 104, 101, 105],   // Random candle
        [104, 106, 103, 107],   // K1: Rising candle
        [107, 104, 103, 108],   // K2: Falling candle
        [103, 110, 102, 112]    // K3: Big rising candle breaking K2's high
      ];
      
      const result = PatternRecognizer.recognizeBreakoutPattern(klineData);
      
      // Should find the pattern at index 4 (the last candle)
      expect(result).toContain(4);
    });
    
    it('should not recognize invalid patterns', () => {
      // Test cases that should not be recognized as breakout patterns
      const testCases = [
        // Case 1: K1 is falling, not rising
        [
          [100, 98, 97, 101],   // K1: Falling candle
          [98, 95, 94, 99],     // K2: Falling candle
          [94, 100, 93, 101]    // K3: Rising candle
        ],
        // Case 2: K2 is rising, not falling
        [
          [100, 102, 99, 103],  // K1: Rising candle
          [102, 105, 101, 106], // K2: Rising candle
          [105, 110, 104, 111]  // K3: Rising candle
        ],
        // Case 3: K3 is not a big rising candle (less than 3%)
        [
          [100, 102, 99, 103],  // K1: Rising candle
          [102, 100, 99, 103],  // K2: Falling candle
          [100, 102, 99, 103]   // K3: Small rising candle (2%)
        ],
        // Case 4: K3 doesn't break K2's high
        [
          [100, 102, 99, 103],  // K1: Rising candle
          [102, 100, 99, 105],  // K2: Falling candle with high at 105
          [100, 104, 99, 104]   // K3: Rising candle but high only at 104
        ]
      ];
      
      testCases.forEach(testCase => {
        const result = PatternRecognizer.recognizeBreakoutPattern(testCase);
        expect(result).toEqual([]);
      });
    });
    
    it('should handle empty or insufficient data', () => {
      expect(PatternRecognizer.recognizeBreakoutPattern([])).toEqual([]);
      expect(PatternRecognizer.recognizeBreakoutPattern([[], []])).toEqual([]);
      expect(PatternRecognizer.recognizeBreakoutPattern(null)).toEqual([]);
    });
  });
  
  describe('checkMACondition', () => {
    it('should identify when MA5 is above MA250', () => {
      const klineData = [
        [100, 102, 99, 103],
        [102, 104, 101, 105],
        [104, 106, 103, 107],
        [106, 108, 105, 109],
        [108, 110, 107, 111]
      ];
      
      // 现在我们的MA计算从第一个点开始就有值
      const ma5Data = [102, 103, 104, 106, 106]; // MA5 values
      const ma250Data = [95, 96, 97, 99, 100]; // MA250 values
      
      const result = PatternRecognizer.checkMACondition(klineData, ma5Data, ma250Data, 4);
      
      expect(result).toBe(true);
    });
    
    it('should return false when MA5 is below MA250', () => {
      const klineData = [
        [100, 102, 99, 103],
        [102, 104, 101, 105],
        [104, 106, 103, 107],
        [106, 108, 105, 109],
        [108, 110, 107, 111]
      ];
      
      // 现在我们的MA计算从第一个点开始就有值
      const ma5Data = [102, 103, 104, 105, 100]; // MA5 values
      const ma250Data = [105, 105, 105, 105, 106]; // MA250 values
      
      const result = PatternRecognizer.checkMACondition(klineData, ma5Data, ma250Data, 4);
      
      expect(result).toBe(false);
    });
    
    it('should return false when K-lines are not all above MA5', () => {
      const klineData = [
        [100, 102, 99, 103],
        [102, 104, 101, 105],
        [104, 106, 103, 107], // K1
        [106, 104, 103, 107], // K2: close below MA5
        [104, 110, 103, 111]  // K3
      ];
      
      // 现在我们的MA计算从第一个点开始就有值
      const ma5Data = [102, 103, 105, 105, 105]; // MA5 values
      const ma250Data = [95, 96, 100, 100, 100]; // MA250 values
      
      const result = PatternRecognizer.checkMACondition(klineData, ma5Data, ma250Data, 4);
      
      expect(result).toBe(false);
    });
    
    it('should handle invalid inputs', () => {
      expect(PatternRecognizer.checkMACondition(null, [], [], 0)).toBe(false);
      expect(PatternRecognizer.checkMACondition([], null, [], 0)).toBe(false);
      expect(PatternRecognizer.checkMACondition([], [], null, 0)).toBe(false);
      expect(PatternRecognizer.checkMACondition([], [], [], -1)).toBe(false);
    });
  });
  
  describe('checkVolumeCondition', () => {
    it('should identify high-low-high volume pattern', () => {
      const volumes = [1000, 2000, 5000, 2000, 4000];
      
      // Check at index 4, where we have the pattern: 5000 (high) -> 2000 (low) -> 4000 (high)
      const result = PatternRecognizer.checkVolumeCondition(volumes, 4);
      
      expect(result).toBe(true);
    });
    
    it('should return false when first volume is not double the second', () => {
      const volumes = [1000, 2000, 3000, 2000, 4000];
      
      // 3000 is not double 2000
      const result = PatternRecognizer.checkVolumeCondition(volumes, 4);
      
      expect(result).toBe(false);
    });
    
    it('should return false when third volume is not higher than second', () => {
      const volumes = [1000, 2000, 5000, 2000, 1500];
      
      // 1500 is not higher than 2000
      const result = PatternRecognizer.checkVolumeCondition(volumes, 4);
      
      expect(result).toBe(false);
    });
    
    it('should handle invalid inputs', () => {
      expect(PatternRecognizer.checkVolumeCondition(null, 0)).toBe(false);
      expect(PatternRecognizer.checkVolumeCondition([], 0)).toBe(false);
      expect(PatternRecognizer.checkVolumeCondition([1, 2], 2)).toBe(false);
    });
  });
  
  describe('findCompletePattern', () => {
    it('should find patterns that satisfy all conditions', () => {
      // Create chart data with a valid pattern
      const chartData = {
        data: [
          [100, 102, 99, 103],   // Random candle
          [102, 104, 101, 105],   // Random candle
          [104, 106, 103, 107],   // K1: Rising candle
          [107, 104, 103, 108],   // K2: Falling candle
          [103, 110, 102, 112]    // K3: Big rising candle breaking K2's high
        ],
        volumes: [1000, 2000, 5000, 2000, 4000], // High-low-high pattern
        indicators: {
          MA5: [null, null, null, null, 105],
          MA250: [null, null, null, null, 100]
        }
      };
      
      const result = PatternRecognizer.findCompletePattern(chartData);
      
      // Should find the pattern at index 4
      expect(result).toContain(4);
    });
    
    it('should return empty array when any condition is not met', () => {
      // Test cases where different conditions fail
      const testCases = [
        // Case 1: K-line pattern is invalid
        {
          data: [
            [100, 98, 97, 101],   // K1: Falling candle (should be rising)
            [98, 95, 94, 99],     // K2: Falling candle
            [94, 100, 93, 101]    // K3: Rising candle
          ],
          volumes: [5000, 2000, 4000],
          indicators: {
            MA5: [null, null, 97],
            MA250: [null, null, 90]
          }
        },
        // Case 2: Volume pattern is invalid
        {
          data: [
            [100, 102, 99, 103],   // K1: Rising candle
            [102, 100, 99, 103],   // K2: Falling candle
            [100, 105, 99, 106]    // K3: Big rising candle
          ],
          volumes: [3000, 2000, 1500], // Third volume is lower than second
          indicators: {
            MA5: [null, null, 102],
            MA250: [null, null, 100]
          }
        },
        // Case 3: MA condition is invalid
        {
          data: [
            [100, 102, 99, 103],   // K1: Rising candle
            [102, 100, 99, 103],   // K2: Falling candle
            [100, 105, 99, 106]    // K3: Big rising candle
          ],
          volumes: [5000, 2000, 4000],
          indicators: {
            MA5: [null, null, 110], // MA5 is higher than all closes
            MA250: [null, null, 100]
          }
        }
      ];
      
      testCases.forEach(testCase => {
        const result = PatternRecognizer.findCompletePattern(testCase);
        expect(result).toEqual([]);
      });
    });
    
    it('should handle missing data', () => {
      // Test with missing indicators
      const missingIndicators = {
        data: [[100, 102, 99, 103]],
        volumes: [1000]
      };
      expect(PatternRecognizer.findCompletePattern(missingIndicators)).toEqual([]);
      
      // Test with missing MA250
      const missingMA250 = {
        data: [[100, 102, 99, 103]],
        volumes: [1000],
        indicators: {
          MA5: [102]
        }
      };
      expect(PatternRecognizer.findCompletePattern(missingMA250)).toEqual([]);
    });
  });
});