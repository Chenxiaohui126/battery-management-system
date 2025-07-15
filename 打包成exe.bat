@echo off
chcp 65001 >nul
title 电池售后管理系统 - 打包工具

echo ================================================
echo 电池售后管理系统 - 一键打包成EXE
echo ================================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python环境
    echo 请先安装Python 3.7或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python环境检查通过
echo.

echo 开始打包...
python build_standalone.py

if errorlevel 1 (
    echo.
    echo 打包失败！请检查错误信息
    pause
    exit /b 1
)

echo.
echo ================================================
echo 打包成功！
echo ================================================
echo.
echo 可执行文件位于: dist\电池售后管理系统\
echo 请将整个文件夹复制到目标电脑上使用
echo.
echo 按任意键打开输出目录...
pause >nul

if exist "dist\电池售后管理系统" (
    explorer "dist\电池售后管理系统"
) else (
    echo 输出目录不存在
)

pause
