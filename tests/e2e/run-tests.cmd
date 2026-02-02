@echo off
REM xmemory E2E 测试运行脚本
REM 用法: run-tests.cmd [options]
REM   无参数 - 运行所有测试（有界面）
REM   --ci   - CI 模式（无界面）
REM   --ui   - 打开 Playwright UI
REM   --public - 只运行公开页面测试

cd /d %~dp0\..\..

REM 检查 Playwright 是否安装
where npx >nul 2>nul
if errorlevel 1 (
    echo 错误: 未找到 npx，请先安装 Node.js
    exit /b 1
)

REM 设置默认环境变量
if "%TEST_BASE_URL%"=="" set TEST_BASE_URL=https://xmemory.work

echo.
echo ========================================
echo   xmemory E2E 测试
echo ========================================
echo   目标: %TEST_BASE_URL%
echo   认证: %TEST_SESSION_COOKIE:~0,10%...
echo ========================================
echo.

REM 解析参数
if "%1"=="--ci" (
    echo 运行 CI 模式...
    set CI=true
    npx playwright test --config=tests/e2e/playwright.config.ts
    goto :end
)

if "%1"=="--ui" (
    echo 打开 Playwright UI...
    npx playwright test --config=tests/e2e/playwright.config.ts --ui
    goto :end
)

if "%1"=="--public" (
    echo 只运行公开页面测试...
    npx playwright test --config=tests/e2e/playwright.config.ts --project=public
    goto :end
)

if "%1"=="--api" (
    echo 只运行 API 测试...
    npx playwright test --config=tests/e2e/playwright.config.ts --project=api
    goto :end
)

if "%1"=="--report" (
    echo 打开测试报告...
    npx playwright show-report tests/e2e/test-results/html-report
    goto :end
)

REM 默认运行所有测试
echo 运行所有测试...
npx playwright test --config=tests/e2e/playwright.config.ts

:end
echo.
echo 测试完成！
echo 查看报告: npm run test:e2e:report
