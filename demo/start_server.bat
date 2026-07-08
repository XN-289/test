@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🚀 ViaSurg AI CMO - 启动服务器                          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/2] 启动服务器...
echo.
echo 📍 访问地址: http://localhost:3000
echo 📡 API 接口: http://localhost:3000/api/
echo.
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause
