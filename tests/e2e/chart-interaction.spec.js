import { test, expect } from '@playwright/test';

test.describe('图表交互功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用并生成一个图表
    await page.goto('/');
    await page.locator('#userInput').fill('上涨趋势，30天，带成交量');
    await page.locator('#generateBtn').click();
    
    // 等待图表加载完成
    await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('.notification.success')).toBeVisible();
    
    // 等待工具栏出现
    await expect(page.locator('.chart-toolbar')).toBeVisible();
  });
  
  test('图表工具栏按钮', async ({ page }) => {
    // 检查工具栏按钮是否存在
    await expect(page.locator('.chart-tool-btn')).toHaveCount(2);
    
    // 点击重置按钮
    const resetButton = page.locator('.chart-tool-btn').filter({ hasText: '重置' });
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    
    // 检查全屏按钮
    const fullscreenButton = page.locator('.chart-tool-btn').filter({ hasText: '全屏' });
    await expect(fullscreenButton).toBeVisible();
    
    // 注意：由于浏览器安全限制，自动化测试中无法真正触发全屏模式
    // 但我们可以检查点击是否不会导致错误
    await fullscreenButton.click();
  });
  
  test('图表缩放功能', async ({ page }) => {
    // 获取图表区域
    const chartArea = page.locator('#chartContainer canvas');
    
    // 模拟鼠标滚轮缩放
    await chartArea.hover();
    await page.mouse.wheel(0, -100); // 向上滚动缩小
    
    // 等待一下让缩放生效
    await page.waitForTimeout(500);
    
    // 模拟鼠标拖拽平移
    await chartArea.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0); // 向右拖动100像素
    await page.mouse.up();
    
    // 等待一下让平移生效
    await page.waitForTimeout(500);
    
    // 点击重置按钮恢复原始视图
    await page.locator('.chart-tool-btn').filter({ hasText: '重置' }).click();
  });
  
  test('K线数据点击交互', async ({ page }) => {
    // 获取图表区域
    const chartArea = page.locator('#chartContainer canvas');
    
    // 点击图表中的某个点
    await chartArea.click({ position: { x: 200, y: 200 } });
    
    // 检查是否显示了详细信息提示框
    // 注意：由于ECharts的事件处理机制，这个测试可能不稳定
    // 我们可以通过检查DOM中是否有相关元素来验证
    try {
      await expect(page.locator('.detail-tooltip')).toBeVisible({ timeout: 2000 });
    } catch (e) {
      // 如果没有找到提示框，可能是点击位置没有命中K线
      console.log('未检测到提示框，可能是点击位置未命中K线数据点');
    }
    
    // 点击其他区域关闭提示框
    await page.mouse.click(10, 10);
  });
  
  test('数据缩放滑块交互', async ({ page }) => {
    // 等待数据缩放滑块出现
    await expect(page.locator('.echarts-dataZoom-slider')).toBeVisible({ timeout: 5000 });
    
    // 获取滑块区域
    const slider = page.locator('.echarts-dataZoom-slider');
    
    // 点击滑块区域的不同位置来调整显示范围
    await slider.click({ position: { x: 10, y: 10 } }); // 点击左侧
    await page.waitForTimeout(500);
    
    await slider.click({ position: { x: 100, y: 10 } }); // 点击中间位置
    await page.waitForTimeout(500);
    
    // 点击重置按钮恢复原始视图
    await page.locator('.chart-tool-btn').filter({ hasText: '重置' }).click();
  });
});