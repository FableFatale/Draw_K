// 测试极小范围MACD，确保贴近零轴
import { DataProcessor } from './src/utils/dataProcessor.js';

const processor = new DataProcessor();
const testInput = '上涨趋势，45天，MACD';

console.log('\n=== 测试极贴近零轴的MACD ===');

try {
    const result = processor.processUserInput(testInput);
    
    if (result.macdData) {
        const validDif = result.macdData.dif.filter(v => v !== 0);
        const validDea = result.macdData.dea.filter(v => v !== 0);
        
        console.log('\n=== 极小数值范围检查 ===');
        console.log('DIF范围:', Math.min(...validDif).toFixed(4), 'to', Math.max(...validDif).toFixed(4));
        console.log('DEA范围:', Math.min(...validDea).toFixed(4), 'to', Math.max(...validDea).toFixed(4));
        
        const maxDifAbs = Math.max(...validDif.map(Math.abs));
        const maxDeaAbs = Math.max(...validDea.map(Math.abs));
        
        console.log('DIF最大绝对值:', maxDifAbs.toFixed(4));
        console.log('DEA最大绝对值:', maxDeaAbs.toFixed(4));
        
        // 检查是否在±0.5范围内（新的Y轴范围）
        const difInRange = validDif.filter(v => Math.abs(v) <= 0.5).length;
        const deaInRange = validDea.filter(v => Math.abs(v) <= 0.5).length;
        
        console.log('\n=== ±0.5范围检查 ===');
        console.log('DIF在±0.5范围内:', difInRange, '/', validDif.length, `(${(difInRange/validDif.length*100).toFixed(1)}%)`);
        console.log('DEA在±0.5范围内:', deaInRange, '/', validDea.length, `(${(deaInRange/validDea.length*100).toFixed(1)}%)`);
        
        // 检查是否非常贴近零轴
        const difNearZero = validDif.filter(v => Math.abs(v) <= 0.3).length;
        const deaNearZero = validDea.filter(v => Math.abs(v) <= 0.3).length;
        
        console.log('\n=== 贴近零轴检查(±0.3) ===');
        console.log('DIF在±0.3范围内:', difNearZero, '/', validDif.length, `(${(difNearZero/validDif.length*100).toFixed(1)}%)`);
        console.log('DEA在±0.3范围内:', deaNearZero, '/', validDea.length, `(${(deaNearZero/validDea.length*100).toFixed(1)}%)`);
        
        console.log('\n=== 零轴中心度检查 ===');
        const difMean = validDif.reduce((sum, val) => sum + val, 0) / validDif.length;
        const deaMean = validDea.reduce((sum, val) => sum + val, 0) / validDea.length;
        console.log('DIF均值:', difMean.toFixed(4));
        console.log('DEA均值:', deaMean.toFixed(4));
        
        console.log('\n=== 样本数据 ===');
        console.log('最后5个DIF:', validDif.slice(-5).map(v => v.toFixed(4)));
        console.log('最后5个DEA:', validDea.slice(-5).map(v => v.toFixed(4)));
        
        // 最终评估
        const veryCloseToZero = maxDifAbs < 0.3 && maxDeaAbs < 0.3;
        const perfectlyCentered = Math.abs(difMean) < 0.05 && Math.abs(deaMean) < 0.05;
        
        if (veryCloseToZero && perfectlyCentered) {
            console.log('\n✅ MACD完美贴近零轴！线条应该围绕零轴紧密波动');
        } else if (maxDifAbs < 0.5 && maxDeaAbs < 0.5) {
            console.log('\n⚠️ MACD接近零轴，但可能还需要微调');
        } else {
            console.log('\n❌ MACD仍需要进一步缩小范围');
        }
    }
    
} catch (error) {
    console.error('测试出错:', error);
}