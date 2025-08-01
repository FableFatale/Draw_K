/**
 * K线形态识别器
 * 用于识别特定的K线、均线和成交量组合形态
 */
export class PatternRecognizer {
    /**
     * 识别"阳线 + 阴线 + 大阳线/涨停板"形态
     * @param {Array} klineData - K线数据数组
     * @returns {Array} - 返回形态出现的位置索引数组
     */
    static recognizeBreakoutPattern(klineData) {
        const result = [];
        
        // 至少需要3根K线
        if (!klineData || klineData.length < 3) return result;
        
        for (let i = 2; i < klineData.length; i++) {
            const k1 = klineData[i-2]; // 第一根K线
            const k2 = klineData[i-1]; // 第二根K线
            const k3 = klineData[i];   // 第三根K线
            
            // 检查是否为"阳线 + 阴线 + 大阳线/涨停板"形态
            const isK1Rising = k1[1] > k1[0]; // 第一根是阳线
            const isK2Falling = k2[1] < k2[0]; // 第二根是阴线
            const isK3BigRising = k3[1] > k3[0] && (k3[1] - k3[0]) / k3[0] > 0.03; // 第三根是大阳线(涨幅>3%)
            
            // 第三根K线收盘价突破第二根K线的最高点
            const k3BreakK2High = k3[1] > k2[3];
            
            if (isK1Rising && isK2Falling && isK3BigRising && k3BreakK2High) {
                result.push(i);
            }
        }
        
        return result;
    }
    
    /**
     * 检查均线条件：5日线在250日线上方，且三根K线均收于5日线上方
     * @param {Array} klineData - K线数据数组
     * @param {Array} ma5Data - 5日均线数据
     * @param {Array} ma250Data - 250日均线数据
     * @param {Number} index - 当前检查的位置索引
     * @returns {Boolean} - 是否满足条件
     */
    static checkMACondition(klineData, ma5Data, ma250Data, index) {
        // 检查数据是否有效
        if (!klineData || !ma5Data || !ma250Data) return false;
        if (index < 2 || index >= klineData.length) return false;
        if (index >= ma5Data.length || index >= ma250Data.length) return false;
        
        // 检查5日线是否在250日线上方
        // 由于我们现在的计算方法，ma5Data和ma250Data在所有点都有值
        const ma5Above250 = ma5Data[index] > ma250Data[index];
        
        // 检查三根K线是否都收于5日线上方
        const k1AboveMa5 = klineData[index-2][1] > ma5Data[index-2];
        const k2AboveMa5 = klineData[index-1][1] > ma5Data[index-1];
        const k3AboveMa5 = klineData[index][1] > ma5Data[index];
        
        return ma5Above250 && k1AboveMa5 && k2AboveMa5 && k3AboveMa5;
    }
    
    /**
     * 检查成交量条件："高-低-高"凹字形态
     * @param {Array} volumes - 成交量数据数组
     * @param {Number} index - 当前检查的位置索引
     * @returns {Boolean} - 是否满足条件
     */
    static checkVolumeCondition(volumes, index) {
        // 检查数据是否有效
        if (!volumes || index < 2 || index >= volumes.length) return false;
        
        const v1 = volumes[index-2]; // 第一根成交量
        const v2 = volumes[index-1]; // 第二根成交量
        const v3 = volumes[index];   // 第三根成交量
        
        // 第一根是第二根的两倍以上
        const v1DoubleV2 = v1 > v2 * 2;
        
        // 第三根放量超过第二根
        const v3MoreThanV2 = v3 > v2;
        
        // "高-低-高"凹字形态
        return v1DoubleV2 && v3MoreThanV2;
    }
    
    /**
     * 综合检查所有条件
     * @param {Object} chartData - 图表数据对象
     * @returns {Array} - 返回满足所有条件的位置索引数组
     */
    static findCompletePattern(chartData) {
        const { data: klineData, volumes, indicators } = chartData;
        
        // 检查数据是否有效
        if (!klineData || !volumes || !indicators) return [];
        
        const ma5Data = indicators.MA5;
        const ma250Data = indicators.MA250;
        
        // 如果没有MA250数据，返回空数组
        if (!ma250Data) return [];
        
        // 获取K线形态位置
        const breakoutPositions = this.recognizeBreakoutPattern(klineData);
        
        // 筛选同时满足均线和成交量条件的位置
        return breakoutPositions.filter(index => 
            this.checkMACondition(klineData, ma5Data, ma250Data, index) && 
            this.checkVolumeCondition(volumes, index)
        );
    }
}