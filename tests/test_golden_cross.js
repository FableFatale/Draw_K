// Test golden cross marker positioning
import { DataProcessor } from './src/utils/dataProcessor.js';
import { getChartConfig } from './src/utils/chartConfig.simple.js';

async function testGoldenCrossPosition() {
    try {
        console.log('Testing golden cross marker positioning...');
        
        const processor = new DataProcessor();
        const result = await processor.processUserInput('9.00-10.00 震荡上涨，金叉');
        
        // Test chart config generation
        const chartConfig = getChartConfig(result);
        
        console.log('Chart series count:', chartConfig.series.length);
        console.log('Series names:', chartConfig.series.map(s => s.name));
        
        // Check which series has the markPoint (golden cross marker)
        chartConfig.series.forEach((series, index) => {
            if (series.markPoint) {
                console.log(`✅ Golden cross marker found on series ${index} (${series.name})`);
                console.log('Marker data:', series.markPoint.data[0]);
                
                // Check if it's on the DIF line (correct position)
                if (series.name === 'DIF') {
                    console.log('✅ Correct: Golden cross marker is on DIF line');
                } else {
                    console.log('❌ Incorrect: Golden cross marker should be on DIF line, but found on:', series.name);
                }
            }
        });
        
        // Check MACD data structure
        if (result.macdData) {
            console.log('MACD DIF sample values:', result.macdData.dif.slice(25, 35));
            console.log('MACD DEA sample values:', result.macdData.dea.slice(25, 35));
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testGoldenCrossPosition();