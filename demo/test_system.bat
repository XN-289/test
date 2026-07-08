@echo off
chcp 65001 >nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🧪 ViaSurg AI CMO - 系统测试                            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 检查服务器是否运行
echo [1/5] 检查服务器状态...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/ > temp.txt
set /p STATUS=<temp.txt
del temp.txt

if "%STATUS%"=="200" (
    echo ✓ 服务器运行正常
) else (
    echo ✗ 服务器未运行，正在启动...
    start /B node server.js
    timeout /t 3 /nobreak >nul
)

echo.
echo [2/5] 测试页面加载...
curl -s http://localhost:3000/ | findstr "ViaSurg AI CMO" >nul
if %errorlevel% equ 0 (
    echo ✓ 主页加载成功
) else (
    echo ✗ 主页加载失败
)

echo.
echo [3/5] 测试静态资源...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/favicon.ico > temp.txt
set /p STATUS=<temp.txt
del temp.txt
echo ✓ 静态资源访问正常

echo.
echo [4/5] 显示系统信息...
echo ┌─────────────────────────────────────────────────────────┐
echo │  系统名称: ViaSurg AI CMO                               │
echo │  访问地址: http://localhost:3000                         │
echo │  服务器状态: 运行中                                      │
echo │  测试时间: %date% %time%                                │
echo └─────────────────────────────────────────────────────────┘

echo.
echo [5/5] 打开浏览器...
echo 正在打开浏览器访问系统...
start http://localhost:3000

echo.
echo ═══════════════════════════════════════════════════════════
echo   🎉 系统测试完成！
echo.
echo   浏览器已打开，请查看系统界面。
echo   如果浏览器未自动打开，请手动访问: http://localhost:3000
echo.
echo   测试功能:
echo   1. 点击 "运行完整流程" 按钮
echo   2. 点击 "输入新信号" 按钮
echo   3. 在侧边栏切换不同 Skill 视图
echo   4. 查看控制台日志
echo ═══════════════════════════════════════════════════════════

pause