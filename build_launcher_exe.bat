@echo off
echo 电池售后管理系统 - 生成独立可执行文件
echo ==================================

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python！请先安装Python 3.6或更高版本。
    pause
    exit /b 1
)

:: 运行打包脚本
echo 正在启动打包程序...
python build_exe.py
if %errorlevel% neq 0 (
    echo 生成过程出现错误！
    pause
    exit /b 1
)

:: 检查生成结果
if exist dist\电池售后管理系统.exe (
    echo.
    echo 生成成功！可执行文件位于 dist\电池售后管理系统.exe
    echo 您可以将此文件复制到任何Windows电脑上运行，无需安装Python
    echo.
)

pause 