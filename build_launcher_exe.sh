#!/bin/bash

echo "电池售后管理系统 - 生成独立可执行文件"
echo "=================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python！请先安装Python 3.6或更高版本。"
    read -p "按Enter键退出..."
    exit 1
fi

# 运行打包脚本
echo "正在启动打包程序..."
python3 build_exe.py command_line
if [ $? -ne 0 ]; then
    echo "生成过程出现错误！"
    read -p "按Enter键退出..."
    exit 1
fi

# 检查生成结果
if [ -f "dist/电池售后管理系统" ]; then
    echo ""
    echo "生成成功！可执行文件位于 dist/电池售后管理系统"
    echo "您可以将此文件复制到任何同架构的系统上运行，无需安装Python"
    echo ""
fi

read -p "按Enter键退出..." 