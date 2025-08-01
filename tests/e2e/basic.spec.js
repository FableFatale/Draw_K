import { test, expect } from '@playwright/test';

test.describe('基本功能测试', () => {
  test('页面加载和初始状态', async ({ page }) => {
    // 访问应用
    await page.goto('/');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/K线图绘制工具/);
    
    // 检查主要元素是否存在
    await expect(page.locator('h1')).toContainText('K线图绘制工具');
    await expect(page.locator('#userInput')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#chartContainer')).toBeVisible();
    
    // 检查示例芯片是否存在
    await expect(page.locator('.chip')).toHaveCount(4);
    
    // 检查欢迎图表是否加载（等待ECharts元素出现）
    await expect(page.locator('#chartContainer canvas')).toBeVisible({ timeout: 5000 });
  });
  
  test('生成K线图 - 上涨趋势', async ({ page }) => {
    await page.goto('/');
    
    // 输入上涨趋势描述
    await page.locator('#userInput').fill('上涨趋势，30天，开盘价100，收盘价150');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查成功通知是否出现
    await expect(page.locator('.notification.success')).toBeVisible();
    
    // 检查图表是否更新（通过检查标题包含"上涨趋势"）
    const chartTitle = await page.evaluate(() => {
      // 获取ECharts实例中的标题文本
      const chartDom = document.querySelector('#chartContainer');
      if (!chartDom.__echarts__) return null;
      const option = chartDom.__echarts__.getOption();
      return option.title[0].text;
    });
    
    expect(chartTitle).toContain('上涨趋势');
  });
  
  test('生成K线图 - 下跌趋势', async ({ page }) => {
    await page.goto('/');
    
    // 输入下跌趋势描述
    await page.locator('#userInput').fill('下跌趋势，15天，开盘价100，收盘价80');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查成功通知是否出现
    await expect(page.locator('.notification.success')).toBeVisible();
    
    // 检查图表是否更新（通过检查标题包含"下跌趋势"）
    const chartTitle = await page.evaluate(() => {
      const chartDom = document.querySelector('#chartContainer');
      if (!chartDom.__echarts__) return null;
      const option = chartDom.__echarts__.getOption();
      return option.title[0].text;
    });
    
    expect(chartTitle).toContain('下跌趋势');
  });
  
  test('使用示例芯片', async ({ page }) => {
    await page.goto('/');
    
    // 点击第一个示例芯片
    await page.locator('.chip').first().click();
    
    // 检查输入框是否填充了示例文本
    const inputValue = await page.locator('#userInput').inputValue();
    expect(inputValue).toBe('上涨趋势，30天，开盘价100');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查成功通知是否出现
    await expect(page.locator('.notification.success')).toBeVisible();
  });
  
  test('输入验证 - 空输入', async ({ page }) => {
    await page.goto('/');
    
    // 清空输入框
    await page.locator('#userInput').fill('');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 检查错误通知是否出现
    await expect(page.locator('.notification.error')).toBeVisible();
    await expect(page.locator('.notification.error')).toContainText('请输入K线图描述');
  });
  
  test('输入验证 - 输入太短', async ({ page }) => {
    await page.goto('/');
    
    // 输入太短的文本
    await page.locator('#userInput').fill('短');
    
    // 点击生成按钮
    await page.locator('#generateBtn').click();
    
    // 检查错误通知是否出现
    await expect(page.locator('.notification.error')).toBeVisible();
    await expect(page.locator('.notification.error')).toContainText('描述太短');
  });
  
  test('按回车键生成图表', async ({ page }) => {
    await page.goto('/');
    
    // 输入描述
    await page.locator('#userInput').fill('震荡行情，20天');
    
    // 按回车键
    await page.locator('#userInput').press('Enter');
    
    // 等待加载状态消失
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    
    // 检查成功通知是否出现
    await expect(page.locator('.notification.success')).toBeVisible();
  });
});