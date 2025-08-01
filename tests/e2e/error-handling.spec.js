import { test, expect } from '@playwright/test';

test.describe('错误处理和边界情况测试', () => {
  test('处理无效输入', async ({ page }) => {
    await page.goto('/');
    
    // 测试各种无效输入
    const invalidInputs = [
      { text: '', expectedError: '请输入K线图描述' },
      { text: '短', expectedError: '描述太短' },
      { text: '!@#$%^&*()', expectedError: '描述太短' }
    ];
    
    for (const input of invalidInputs) {
      // 输入无效文本
      await page.locator('#userInput').fill(input.text);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 检查错误通知是否出现
      await expect(page.locator('.notification.error')).toBeVisible();
      await expect(page.locator('.notification.error')).toContainText(input.expectedError);
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('处理缺少关键信息的输入', async ({ page }) => {
    await page.goto('/');
    
    // 输入缺少趋势和周期的描述
    await page.locator('#userInput').fill('股票价格从100到120');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 检查提示通知是否出现
    await expect(page.locator('.notification.info')).toBeVisible();
    await expect(page.locator('.notification.info')).toContainText('添加趋势');
    
    // 等待通知消失
    await page.waitForTimeout(3500);
  });
  
  test('处理极端输入值', async ({ page }) => {
    await page.goto('/');
    
    // 测试极端输入值
    const extremeInputs = [
      '上涨趋势，1000天，开盘价1，收盘价1000000',
      '下跌趋势，1天，开盘价9999，收盘价1',
      '震荡行情，0天', // 无效天数
      '横盘整理，-10天' // 负天数
    ];
    
    for (const input of extremeInputs) {
      // 输入极端文本
      await page.locator('#userInput').fill(input);
      
      // 点击生成按钮
      await page.locator('#generateBtn').click();
      
      // 等待加载状态消失
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      
      // 检查是否有图表渲染（应该能够处理极端情况）
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查是否有成功通知
      await expect(page.locator('.notification.success')).toBeVisible();
      
      // 等待通知消失
      await page.waitForTimeout(3500);
    }
  });
  
  test('处理特殊字符和长文本', async ({ page }) => {
    await page.goto('/');
    
    // 测试包含特殊字符的输入
    const specialInput = '上涨趋势，30天，开盘价100，收盘价150，最高价160，最低价90，带有特殊字符：!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';
    
    // 输入特殊文本
    await page.locator('#userInput').fill(specialInput);
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查是否有图表渲染（应该能够处理特殊字符）
    await expect(page.locator('#chartContainer canvas')).toBeVisible();
    
    // 检查是否有成功通知
    await expect(page.locator('.notification.success')).toBeVisible();
    
    // 等待通知消失
    await page.waitForTimeout(3500);
    
    // 测试长文本输入
    const longInput = '上涨趋势，30天，'.repeat(20) + '这是一个非常长的描述，测试应用对长文本的处理能力。';
    
    // 输入长文本
    await page.locator('#userInput').fill(longInput);
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查是否有图表渲染（应该能够处理长文本）
    await expect(page.locator('#chartContainer canvas')).toBeVisible();
    
    // 检查是否有成功通知
    await expect(page.locator('.notification.success')).toBeVisible();
  });
  
  test('连续多次生成图表', async ({ page }) => {
    await page.goto('/');
    
    // 连续生成多个图表，测试稳定性
    const inputs = [
      '上涨趋势，10天',
      '下跌趋势，15天',
      '震荡行情，20天',
      '横盘整理，25天',
      '上涨趋势，30天'
    ];
    
    for (const input of inputs) {
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
  
  test('特殊形态请求', async ({ page }) => {
    await page.goto('/');
    
    // 输入特殊形态请求
    await page.locator('#userInput').fill('阳线 + 阴线 + 大阳线，突破形态，5日线在250日线上方');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查是否有图表渲染
    await expect(page.locator('#chartContainer canvas')).toBeVisible();
    
    // 检查是否有成功通知
    await expect(page.locator('.notification.success')).toBeVisible();
    
    // 检查图表标题是否包含特殊形态信息
    const chartTitle = await page.evaluate(() => {
      const chartDom = document.querySelector('#chartContainer');
      if (!chartDom.__echarts__) return null;
      const option = chartDom.__echarts__.getOption();
      return option.title[0].text;
    });
    
    expect(chartTitle).toContain('突破形态');
  });
});