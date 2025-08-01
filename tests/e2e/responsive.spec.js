import { test, expect } from '@playwright/test';

test.describe('响应式布局测试', () => {
  test('桌面布局', async ({ page }) => {
    // 设置桌面尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 访问应用
    await page.goto('/');
    
    // 检查布局元素
    await expect(page.locator('.input-container')).toBeVisible();
    await expect(page.locator('#userInput')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#chartContainer')).toBeVisible();
    
    // 检查输入区域和按钮的布局
    const inputContainer = await page.locator('.input-container').boundingBox();
    const generateBtn = await page.locator('#generateBtn').boundingBox();
    
    // 在桌面布局中，生成按钮应该在输入框的右侧
    expect(generateBtn.x).toBeGreaterThan(inputContainer.x);
  });
  
  test('平板布局', async ({ page }) => {
    // 设置平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 访问应用
    await page.goto('/');
    
    // 检查布局元素
    await expect(page.locator('.input-container')).toBeVisible();
    await expect(page.locator('#userInput')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#chartContainer')).toBeVisible();
    
    // 检查输入区域和按钮的布局
    const inputContainer = await page.locator('.input-container').boundingBox();
    const generateBtn = await page.locator('#generateBtn').boundingBox();
    
    // 在平板布局中，生成按钮应该在输入框下方
    expect(generateBtn.y).toBeGreaterThan(inputContainer.y);
    expect(generateBtn.width).toBeCloseTo(inputContainer.width, -1); // 按钮宽度应接近容器宽度
  });
  
  test('移动设备布局', async ({ page }) => {
    // 设置移动设备尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 访问应用
    await page.goto('/');
    
    // 检查布局元素
    await expect(page.locator('.input-container')).toBeVisible();
    await expect(page.locator('#userInput')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#chartContainer')).toBeVisible();
    
    // 检查输入区域和按钮的布局
    const inputContainer = await page.locator('.input-container').boundingBox();
    const generateBtn = await page.locator('#generateBtn').boundingBox();
    const chartContainer = await page.locator('#chartContainer').boundingBox();
    
    // 在移动设备布局中，生成按钮应该在输入框下方
    expect(generateBtn.y).toBeGreaterThan(inputContainer.y);
    expect(generateBtn.width).toBeCloseTo(inputContainer.width, -1); // 按钮宽度应接近容器宽度
    
    // 图表容器高度应适应移动设备
    expect(chartContainer.height).toBeLessThan(400); // 移动设备上图表高度应该较小
  });
  
  test('生成图表在不同屏幕尺寸下', async ({ page }) => {
    // 测试不同屏幕尺寸下的图表生成
    const viewportSizes = [
      { width: 1280, height: 800, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '移动设备' }
    ];
    
    for (const size of viewportSizes) {
      // 设置视口尺寸
      await page.setViewportSize(size);
      
      // 访问应用
      await page.goto('/');
      
      // 输入描述并生成图表
      await page.locator('#userInput').fill(`上涨趋势，20天，在${size.name}上测试`);
      await page.locator('#generateBtn').click();
      
      // 等待图表加载完成
      await expect(page.locator('#chartContainer.loading')).not.toBeVisible({ timeout: 5000 });
      await expect(page.locator('.notification.success')).toBeVisible();
      
      // 检查图表是否正确渲染
      await expect(page.locator('#chartContainer canvas')).toBeVisible();
      
      // 检查图表容器尺寸是否适应屏幕
      const chartContainer = await page.locator('#chartContainer').boundingBox();
      expect(chartContainer.width).toBeLessThanOrEqual(size.width);
    }
  });
  
  test('通知系统在不同屏幕尺寸下', async ({ page }) => {
    // 测试不同屏幕尺寸下的通知系统
    const viewportSizes = [
      { width: 1280, height: 800, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '移动设备' }
    ];
    
    for (const size of viewportSizes) {
      // 设置视口尺寸
      await page.setViewportSize(size);
      
      // 访问应用
      await page.goto('/');
      
      // 触发错误通知（空输入）
      await page.locator('#userInput').fill('');
      await page.locator('#generateBtn').click();
      
      // 检查通知是否显示
      await expect(page.locator('.notification.error')).toBeVisible();
      
      // 检查通知位置和尺寸
      const notification = await page.locator('.notification.error').boundingBox();
      
      if (size.width <= 768) {
        // 在小屏幕上，通知应该更宽
        expect(notification.width).toBeGreaterThan(size.width * 0.7);
      } else {
        // 在大屏幕上，通知应该更窄
        expect(notification.width).toBeLessThan(size.width * 0.5);
      }
    }
  });
});