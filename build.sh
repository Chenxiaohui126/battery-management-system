#!/bin/bash

# 电池售后管理系统 - 打包脚本 (Linux/Mac)

echo "================================================"
echo "电池售后管理系统 - 一键打包"
echo "================================================"
echo

# 检查Python环境
echo "正在检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3环境"
    echo "请先安装Python 3.7或更高版本"
    exit 1
fi

echo "✓ Python环境检查通过"
echo

# 检查权限
if [ ! -x "$0" ]; then
    echo "设置脚本执行权限..."
    chmod +x "$0"
fi

# 开始打包
echo "开始打包..."
python3 build_standalone.py

if [ $? -ne 0 ]; then
    echo
    echo "打包失败！请检查错误信息"
    exit 1
fi

echo
echo "================================================"
echo "打包成功！"
echo "================================================"
echo
echo "可执行文件位于: dist/电池售后管理系统/"
echo "请将整个文件夹复制到目标电脑上使用"
echo

# 在Mac上打开Finder，在Linux上尝试打开文件管理器
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "dist/电池售后管理系统" ]; then
        open "dist/电池售后管理系统"
    fi
elif command -v xdg-open &> /dev/null; then
    if [ -d "dist/电池售后管理系统" ]; then
        xdg-open "dist/电池售后管理系统"
    fi
fi

echo "打包完成！"
