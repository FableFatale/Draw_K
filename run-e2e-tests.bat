@echo off
echo Running K线图绘制工具 End-to-End Tests...
echo.

npm run test:e2e

echo.
echo Tests completed. Opening report...
npx playwright show-report

pause