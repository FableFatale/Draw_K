// 测试改进的术语识别
console.log('测试改进的术语识别功能...');

// 在页面加载完成后进行测试
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始测试术语识别...');
    
    // 测试输入示例
    const testInputs = [
        '9.30-10.00 金叉',
        '早盘 MACD',
        '午盘 金叉',  
        '上涨趋势 30天 MACD金叉',
        '震荡行情 金叉',
        '9:30-10:00 分时图'
    ];
    
    // 等待一段时间让应用初始化完成
    setTimeout(() => {
        testInputs.forEach((input, index) => {
            setTimeout(() => {
                console.log(`\n=== 测试输入 ${index + 1}: "${input}" ===`);
                
                const userInput = document.getElementById('userInput');
                const generateBtn = document.getElementById('generateBtn');
                
                if (userInput && generateBtn) {
                    userInput.value = input;
                    generateBtn.click();
                    
                    console.log(`已触发生成: ${input}`);
                } else {
                    console.error('找不到输入元素');
                }
            }, index * 3000); // 每3秒测试一个
        });
    }, 2000);
});