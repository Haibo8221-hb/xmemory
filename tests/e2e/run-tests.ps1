# xmemory E2E Test Runner (PowerShell)
# Usage: .\run-tests.ps1 [-Url URL] [-Auth COOKIE] [-Headed] [-Debug] [-Spec FILE] [-Report]

param(
    [string]$Url = "https://xmemory.work",
    [string]$Auth = "",
    [switch]$Headed,
    [switch]$Debug,
    [string]$Spec = "",
    [switch]$Report
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "xmemory E2E Tests"
Write-Host "=========================================="
Write-Host "Target URL: $Url"
Write-Host "Headed: $Headed"
Write-Host "Debug: $Debug"
Write-Host "Auth: $(if($Auth) {'provided'} else {'not provided'})"
Write-Host "=========================================="

# Set environment variables
$env:TEST_URL = $Url
if ($Auth) {
    $env:TEST_SESSION_COOKIE = $Auth
}

# Change to script directory
Push-Location $PSScriptRoot

try {
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..."
        npm install
    }

    # Install Playwright browsers
    Write-Host "Ensuring Playwright browsers are installed..."
    npx playwright install chromium 2>$null

    # Build command arguments
    $args = @()
    if ($Headed) { $args += "--headed" }
    if ($Debug) { $args += "--debug" }
    $args += "--config=playwright.config.ts"

    Write-Host ""
    Write-Host "Running tests..."
    Write-Host ""

    if ($Spec) {
        npx playwright test $Spec @args
    } else {
        npx playwright test @args
    }

    # Open report if requested
    if ($Report) {
        npx playwright show-report
    }

    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Tests completed!"
    Write-Host "=========================================="
}
finally {
    Pop-Location
}
