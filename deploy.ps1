# xmemory 部署脚本
# 用法: .\deploy.ps1

$ErrorActionPreference = "Stop"
$Server = "root@213.250.150.208"
$RemotePath = "/var/www/xmemory"

Write-Host "🔨 Step 1: 本地构建..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Step 2: 上传 .next 文件夹..." -ForegroundColor Cyan
scp -r .next ${Server}:${RemotePath}/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传失败" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Step 3: 重启服务..." -ForegroundColor Cyan
ssh $Server "cd $RemotePath && pm2 restart xmemory"

Write-Host "✅ 部署完成!" -ForegroundColor Green
Write-Host "🌐 https://xmemory.work" -ForegroundColor Yellow
