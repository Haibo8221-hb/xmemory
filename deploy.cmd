@echo off
REM xmemory 部署脚本
REM 用法: deploy.cmd

cd /d %~dp0

echo [1/3] 本地构建...
call npm run build
if errorlevel 1 (
    echo 构建失败!
    exit /b 1
)

echo [2/3] 上传 .next 文件夹...
scp -r .next root@213.250.150.208:/var/www/xmemory/
if errorlevel 1 (
    echo 上传失败!
    exit /b 1
)

echo [3/3] 重启服务...
ssh root@213.250.150.208 "cd /var/www/xmemory && pm2 restart xmemory"

echo.
echo === 部署完成! ===
echo https://xmemory.work
