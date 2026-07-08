@echo off
chcp 65001 >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🚀 ViaSurg AI CMO - 智能营销引擎                          ║
echo ║                                                            ║
echo ║   正在启动本地服务器...                                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 显示 Node.js 版本
echo ✓ Node.js 版本:
node --version
echo.

:: 启动服务器
echo 🎯 启动服务器...
echo.
echo 📍 访问地址: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause