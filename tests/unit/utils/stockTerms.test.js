import { describe, it, expect } from 'vitest';
import { StockTerms } from '../../../src/utils/stockTerms.js';

describe('StockTerms', () => {
    describe('getTermsMapping', () => {
        it('should return a non-empty mapping object', () => {
            const mapping = StockTerms.getTermsMapping();
            expect(mapping).toBeDefined();
            expect(Object.keys(mapping).length).toBeGreaterThan(0);
        });
        
        it('should contain key financial terms', () => {
            const mapping = StockTerms.getTermsMapping();
            expect(mapping['金叉']).toBeDefined();
            expect(mapping['量上涨']).toBeDefined();
            expect(mapping['量增价升']).toBeDefined();
        });
    });
    
    describe('parseTerm', () => {
        it('should correctly parse known terms', () => {
            const goldCross = StockTerms.parseTerm('金叉');
            expect(goldCross).toBeDefined();
            expect(goldCross.type).toBe('indicator');
            expect(goldCross.indicator).toBe('MACD');
        });
        
        it('should return null for unknown terms', () => {
            const unknown = StockTerms.parseTerm('未知术语');
            expect(unknown).toBeNull();
        });
    });
    
    describe('extractTerms', () => {
        it('should extract all terms from input', () => {
            const input = '我想看到金叉和量增价升的情况';
            const terms = StockTerms.extractTerms(input);
            expect(terms.length).toBe(2);
            expect(terms[0].term).toBe('金叉');
            expect(terms[1].term).toBe('量增价升');
        });
        
        it('should return empty array for input with no terms', () => {
            const input = '没有任何金融术语的输入';
            const terms = StockTerms.extractTerms(input);
            expect(terms.length).toBe(0);
        });
    });
    
    describe('parseVolumeIncreaseParams', () => {
        it('should parse days correctly', () => {
            const input = '19天量上涨';
            const params = StockTerms.parseVolumeIncreaseParams(input);
            expect(params.days).toBe(19);
        });
        
        it('should parse growth rate correctly', () => {
            const input = '量上涨10%';
            const params = StockTerms.parseVolumeIncreaseParams(input);
            expect(params.minGrowthRate).toBe(0.1);
        });
        
        it('should parse mode correctly', () => {
            const input1 = '连续5天量上涨';
            const params1 = StockTerms.parseVolumeIncreaseParams(input1);
            expect(params1.strict).toBe(true);
            
            const input2 = '平均7天量上涨';
            const params2 = StockTerms.parseVolumeIncreaseParams(input2);
            expect(params2.strict).toBe(false);
        });
        
        it('should use default values when not specified', () => {
            const input = '量上涨';
            const params = StockTerms.parseVolumeIncreaseParams(input);
            expect(params.days).toBe(5);
            expect(params.minGrowthRate).toBe(0.05);
            expect(params.strict).toBe(true);
        });
    });
});