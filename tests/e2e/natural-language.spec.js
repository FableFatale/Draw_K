import { test, expect } from '@playwright/test';

test.describe('自然语言输入测试', () => {
  test('各种趋势描述', async ({ page }) => {
    await page.goto('/');
    
    // 测试各种趋势描述
    const trendInputs = [
      { text: '上涨趋势，30天', expectedTrend: '上涨' },
      { text: '下跌趋势，30天', expectedTrend: '下跌' },
      { text: '震荡行情，30天', expectedTrend: '震荡' },
      { text: '横盘整理，30天', expectedTrend: '横盘' },
      { text: '牛市行情，30天', expectedTrend: '上涨' },
      { text: '熊市行情，30天', expectedTrend: '下跌' },
      { text: '先涨后跌，30天', expectedTrend: '上涨' }, // 应该识别第一个趋势词
      { text: '股票一直涨，30天', expectedTrend: '上涨' }
    ];
    
    for (const input of trendInputs) {
      // 输入描述
      await page.locator('#userInput').fill(input.text);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查图表标题是否包含预期趋势
      const chartTitle = await page.evaluate(() => {
        const chartDom = document.querySelector('#chartContainer');
        if (!chartDom.__echarts__) return null;
        const option = chartDom.__echarts__.getOption();
        return option.title[0].text;
      });
      
      expect(chartTitle).toContain(input.expectedTrend);
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('各种周期描述', async ({ page }) => {
    await page.goto('/');
    
    // 测试各种周期描述
    const periodInputs = [
      { text: '上涨趋势，30天', expectedPeriod: 30 },
      { text: '上涨趋势，30日', expectedPeriod: 30 },
      { text: '上涨趋势，30个交易日', expectedPeriod: 30 },
      { text: '上涨趋势，30交易日', expectedPeriod: 30 },
      { text: '上涨趋势，30根K线', expectedPeriod: 30 },
      { text: '上涨趋势，30条K线', expectedPeriod: 30 }
    ];
    
    for (const input of periodInputs) {
      // 输入描述
      await page.locator('#userInput').fill(input.text);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查生成的K线数量（通过评估图表数据点数量）
      const dataLength = await page.evaluate(() => {
        const chartDom = document.querySelector('#chartContainer');
        if (!chartDom.__echarts__) return 0;
        const option = chartDom.__echarts__.getOption();
        return option.series[0].data.length;
      });
      
      expect(dataLength).toBe(input.expectedPeriod);
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('价格描述', async ({ page }) => {
    await page.goto('/');
    
    // 测试各种价格描述
    const priceInputs = [
      '上涨趋势，10天，开盘价100',
      '上涨趋势，10天，收盘价150',
      '上涨趋势，10天，最高价160',
      '上涨趋势，10天，最低价90',
      '上涨趋势，10天，开盘价100，收盘价150',
      '上涨趋势，10天，开盘价100，收盘价150，最高价160，最低价90',
      '股票从100涨到150，10天',
      '股票价格在100到150之间波动，10天'
    ];
    
    for (const input of priceInputs) {
      // 输入描述
      await page.locator('#userInput').fill(input);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查是否有成功通知
      await expect(page.locator('.notification.success')).toBeVisible();
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('成交量描述', async ({ page }) => {
    await page.goto('/');
    
    // 测试各种成交量描述
    const volumeInputs = [
      '上涨趋势，10天，带成交量',
      '上涨趋势，10天，不要成交量',
      '上涨趋势，10天，缩量上涨',
      '上涨趋势，10天，放量上涨',
      '上涨趋势，10天，量能萎缩',
      '上涨趋势，10天，量能放大',
      '上涨趋势，10天，量价齐升',
      '上涨趋势，10天，量价背离'
    ];
    
    for (const input of volumeInputs) {
      // 输入描述
      await page.locator('#userInput').fill(input);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查是否有成功通知
      await expect(page.locator('.notification.success')).toBeVisible();
      
      // 检查图表标题是否包含相关信息（如果有）
      if (input.includes('缩量') || input.includes('量能萎缩')) {
        const chartTitle = await page.evaluate(() => {
          const chartDom = document.querySelector('#chartContainer');
          if (!chartDom.__echarts__) return null;
          const option = chartDom.__echarts__.getOption();
          return option.title[0].text;
        });
        
        expect(chartTitle).toContain('缩量');
      }
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('复杂自然语言描述', async ({ page }) => {
    await page.goto('/');
    
    // 测试复杂的自然语言描述
    const complexInputs = [
      '我想看一个股票从100元开始，经过30天的上涨，最终到达150元的K线图',
      '帮我画一个30天的下跌走势，从200跌到100，中间有一些反弹',
      '生成一个股票先涨后跌，最后横盘的20天K线图，带成交量',
      '我需要一个30天的K线图，前10天上涨，中间10天震荡，最后10天下跌',
      '画一个典型的头肩顶形态，30天K线图，带均线和成交量'
    ];
    
    for (const input of complexInputs) {
      // 输入描述
      await page.locator('#userInput').fill(input);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查是否有成功通知
      await expect(page.locator('.notification.success')).toBeVisible();
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
});