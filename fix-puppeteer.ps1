# Fix Puppeteer Dependencies for Windows
# Run this script in PowerShell as Administrator if needed

Write-Host "🔧 Fixing Puppeteer Dependencies for Windows..." -ForegroundColor Green

# Check current Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check current npm packages
Write-Host "📦 Checking current Puppeteer packages..." -ForegroundColor Yellow
try {
    $puppeteerPackages = npm list puppeteer puppeteer-core @sparticuz/chromium 2>$null
    Write-Host "Current packages:" -ForegroundColor Cyan
    Write-Host $puppeteerPackages -ForegroundColor White
} catch {
    Write-Host "No Puppeteer packages found." -ForegroundColor Yellow
}

# Remove problematic packages
Write-Host "🗑️ Removing problematic packages..." -ForegroundColor Yellow
try {
    npm uninstall puppeteer-core @sparticuz/chromium
    Write-Host "✅ Removed puppeteer-core and @sparticuz/chromium" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Some packages may not have been installed" -ForegroundColor Yellow
}

# Install full Puppeteer package
Write-Host "📥 Installing full Puppeteer package..." -ForegroundColor Yellow
try {
    npm install puppeteer
    Write-Host "✅ Installed puppeteer successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install puppeteer" -ForegroundColor Red
    Write-Host "Try running: npm install puppeteer --force" -ForegroundColor Yellow
    exit 1
}

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
try {
    $finalPackages = npm list puppeteer
    Write-Host "✅ Final packages:" -ForegroundColor Green
    Write-Host $finalPackages -ForegroundColor White
} catch {
    Write-Host "⚠️ Could not verify installation" -ForegroundColor Yellow
}

# Check if Chrome/Edge is available as backup
Write-Host "🌐 Checking for system browsers..." -ForegroundColor Yellow
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$browserFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found browser at: $path" -ForegroundColor Green
        $browserFound = $true
        break
    }
}

if (-not $browserFound) {
    Write-Host "⚠️ No system browsers found. Consider installing Chrome or Edge." -ForegroundColor Yellow
    Write-Host "   Chrome: https://www.google.com/chrome/" -ForegroundColor Cyan
    Write-Host "   Edge: https://www.microsoft.com/edge/" -ForegroundColor Cyan
}

# Final instructions
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Restart your development server (Ctrl+C, then npm run dev)" -ForegroundColor Cyan
Write-Host "2. Test the webhook at /webhook-test" -ForegroundColor Cyan
Write-Host "3. The webhook should now generate PDFs successfully" -ForegroundColor Cyan

Write-Host "`n📚 For more help, see:" -ForegroundColor White
Write-Host "   - WINDOWS_TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host "   - WEBHOOK_README.md" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
