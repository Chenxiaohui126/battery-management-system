#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub部署脚本
自动化部署电池售后管理系统到GitHub
"""

import os
import subprocess
import sys
import json
from pathlib import Path

def run_command(cmd, cwd=None):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"错误: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"执行命令失败: {e}")
        return False

def check_git():
    """检查Git是否安装"""
    result = subprocess.run(['git', '--version'], capture_output=True, text=True)
    if result.returncode != 0:
        print("错误: 未安装Git或Git不在PATH中")
        return False
    print(f"✓ {result.stdout.strip()}")
    return True

def init_git_repo():
    """初始化Git仓库"""
    print("初始化Git仓库...")
    
    if not os.path.exists('.git'):
        if not run_command('git init'):
            return False
    
    # 设置用户信息（如果未设置）
    run_command('git config user.name "Battery Management System"')
    run_command('git config user.email "battery-system@example.com"')
    
    return True

def create_gitignore():
    """确保.gitignore文件存在且正确"""
    gitignore_path = Path('.gitignore')
    if gitignore_path.exists():
        print("✓ .gitignore文件已存在")
        return True
    
    print("创建.gitignore文件...")
    # .gitignore文件已经在前面创建了
    return True

def clean_for_github():
    """清理不需要提交到GitHub的文件"""
    print("清理临时文件...")
    
    # 删除构建输出
    import shutil
    dirs_to_remove = ['dist', 'build', '__pycache__']
    
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            try:
                shutil.rmtree(dir_name)
                print(f"✓ 删除 {dir_name}")
            except Exception as e:
                print(f"警告: 无法删除 {dir_name}: {e}")
    
    # 删除临时文件
    temp_files = [
        '*.pyc', '*.pyo', '*.log', '*.tmp',
        'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*'
    ]
    
    for pattern in temp_files:
        run_command(f'del /s /q {pattern}' if os.name == 'nt' else f'find . -name "{pattern}" -delete')

def update_package_json():
    """更新package.json信息"""
    print("更新package.json...")
    
    package_file = Path('package.json')
    if not package_file.exists():
        print("警告: package.json不存在")
        return True
    
    try:
        with open(package_file, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        # 更新仓库信息
        package_data.update({
            "repository": {
                "type": "git",
                "url": "git+https://github.com/your-username/battery-management-system.git"
            },
            "bugs": {
                "url": "https://github.com/your-username/battery-management-system/issues"
            },
            "homepage": "https://github.com/your-username/battery-management-system#readme",
            "keywords": [
                "battery", "management", "system", "repair", "maintenance",
                "electron", "desktop", "application", "chinese"
            ]
        })
        
        with open(package_file, 'w', encoding='utf-8') as f:
            json.dump(package_data, f, indent=2, ensure_ascii=False)
        
        print("✓ package.json已更新")
        return True
        
    except Exception as e:
        print(f"更新package.json失败: {e}")
        return False

def commit_and_push():
    """提交代码并推送到GitHub"""
    print("提交代码...")
    
    # 添加所有文件
    if not run_command('git add .'):
        return False
    
    # 检查是否有更改
    result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
    if not result.stdout.strip():
        print("没有需要提交的更改")
        return True
    
    # 提交
    commit_message = "feat: 初始化电池售后管理系统项目\n\n- 添加完整的电池管理功能\n- 支持多平台协作\n- 包含便携版本\n- 添加GitHub Actions自动构建"
    
    if not run_command(f'git commit -m "{commit_message}"'):
        return False
    
    print("代码已提交到本地仓库")
    
    # 询问是否推送到远程仓库
    push_to_remote = input("是否推送到GitHub远程仓库？(y/N): ").lower().strip()
    
    if push_to_remote == 'y':
        # 检查是否设置了远程仓库
        result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True)
        
        if not result.stdout.strip():
            print("\n请先添加GitHub远程仓库:")
            print("git remote add origin https://github.com/your-username/battery-management-system.git")
            print("然后运行: git push -u origin main")
            return True
        
        # 推送到远程仓库
        if not run_command('git push -u origin main'):
            print("推送失败，请检查远程仓库设置")
            return False
        
        print("✓ 代码已推送到GitHub")
    
    return True

def create_release_info():
    """创建发布信息"""
    print("创建发布信息...")
    
    release_notes = """# 电池售后管理系统 v1.1

## 🎉 新功能
- ✅ 维修项目管理功能
- ✅ 便携版本（无需Node.js）
- ✅ 动态配置同步
- ✅ 图片全屏查看
- ✅ 多图片显示优化

## 📦 下载
- **便携版**: 无需安装任何依赖，解压即用
- **标准版**: 需要Node.js环境

## 🚀 快速开始
1. 下载对应版本
2. 解压到任意目录
3. 运行主程序
4. 浏览器自动打开管理界面

## 🔧 技术栈
- 前端: HTML5/CSS3/JavaScript
- 后端: Node.js/Python
- 桌面: Python Tkinter + PyInstaller
"""
    
    with open('RELEASE_NOTES.md', 'w', encoding='utf-8') as f:
        f.write(release_notes)
    
    print("✓ 发布说明已创建")

def main():
    """主函数"""
    print("=" * 60)
    print("电池售后管理系统 - GitHub部署工具")
    print("=" * 60)
    
    # 检查Git
    if not check_git():
        return False
    
    # 初始化Git仓库
    if not init_git_repo():
        return False
    
    # 清理文件
    clean_for_github()
    
    # 更新package.json
    update_package_json()
    
    # 创建发布信息
    create_release_info()
    
    # 提交和推送
    if not commit_and_push():
        return False
    
    print("\n" + "=" * 60)
    print("GitHub部署完成！")
    print("=" * 60)
    print("\n下一步操作:")
    print("1. 在GitHub上创建新仓库: battery-management-system")
    print("2. 添加远程仓库:")
    print("   git remote add origin https://github.com/your-username/battery-management-system.git")
    print("3. 推送代码:")
    print("   git push -u origin main")
    print("4. 在GitHub上创建Release发布版本")
    print("5. 启用GitHub Pages（如果需要在线演示）")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
