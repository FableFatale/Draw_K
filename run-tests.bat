@echo off
echo 正在运行K线图绘制工具测试...
echo.

echo 检查语法错误...
node -c src/main.js
if %errorlevel% neq 0 (
    echo src/main.js 存在语法错误!
    exit /b %errorlevel%
) else (
    echo src/main.js 语法检查通过
)

node -c src/utils/dataProcessor.js
if %errorlevel% neq 0 (
    echo src/utils/dataProcessor.js 存在语法错误!
    exit /b %errorlevel%
) else (
    echo src/utils/dataProcessor.js 语法检查通过
)

echo.
echo 所有文件语法检查通过!
echo.
echo 如需运行单元测试，请使用: npm test
echo.