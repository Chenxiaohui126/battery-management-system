#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电池售后管理系统 - 独立打包工具
生成不依赖Python环境的可执行文件
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

def check_requirements():
    """检查打包所需的环境"""
    print("检查打包环境...")
    
    # 检查Python版本
    if sys.version_info < (3, 7):
        print("错误: 需要Python 3.7或更高版本")
        return False
    
    # 检查PyInstaller
    try:
        subprocess.run(['pyinstaller', '--version'], 
                      capture_output=True, check=True)
        print("✓ PyInstaller 已安装")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("正在安装 PyInstaller...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller'],
                          check=True)
            print("✓ PyInstaller 安装成功")
        except subprocess.SubprocessError:
            print("错误: 无法安装 PyInstaller")
            return False
    
    return True

def prepare_files():
    """准备打包所需的文件"""
    print("准备打包文件...")
    
    # 确保关键文件存在
    required_files = [
        'launcher.py', 'api.js', 'index.html', 'records.html', 
        'statistics.html', 'settings.html', 'styles.css'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"错误: 缺少必要文件: {', '.join(missing_files)}")
        return False
    
    # 确保数据目录存在
    os.makedirs('data', exist_ok=True)
    
    # 创建默认的数据文件
    create_default_data_files()
    
    # 确保server.js存在
    if not os.path.exists('server.js'):
        create_server_js()
    
    # 确保package.json存在
    if not os.path.exists('package.json'):
        create_package_json()
    
    print("✓ 文件准备完成")
    return True

def create_default_data_files():
    """创建默认的数据文件"""
    
    # 创建默认的batteries.json
    batteries_file = 'data/batteries.json'
    if not os.path.exists(batteries_file):
        with open(batteries_file, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
    
    # 创建默认的settings.json
    settings_file = 'data/settings.json'
    if not os.path.exists(settings_file):
        default_settings = {
            "batteryModels": [
                {"id": 1, "code": "K174", "name": "K174标准电池", "description": "标准容量电池，适用于XX型号车型", "createdAt": "2023-06-01"},
                {"id": 2, "code": "K175", "name": "K175增强版电池", "description": "大容量电池，适用于XX型号车型", "createdAt": "2023-07-15"},
                {"id": 3, "code": "K176", "name": "K176高性能电池", "description": "高性能电池，适用于XX型号车型", "createdAt": "2023-09-10"}
            ],
            "repairItems": [
                {"id": 1, "code": "RI001", "name": "BMS维修", "description": "电池管理系统相关维修", "createdAt": "2023-06-01"},
                {"id": 2, "code": "RI002", "name": "电芯更换", "description": "电池电芯更换维修", "createdAt": "2023-07-15"},
                {"id": 3, "code": "RI003", "name": "外壳维修", "description": "电池外壳相关维修", "createdAt": "2023-08-01"},
                {"id": 4, "code": "RI004", "name": "锁扣更换", "description": "电池锁扣更换维修", "createdAt": "2023-09-01"},
                {"id": 5, "code": "RI005", "name": "其他", "description": "其他类型维修", "createdAt": "2023-09-10"}
            ],
            "returnReasons": [
                {"id": 1, "code": "R001", "name": "高低温报警", "description": "电池温度超过正常范围报警", "createdAt": "2023-06-01"},
                {"id": 2, "code": "R002", "name": "漏胶", "description": "电池外壳漏胶问题", "createdAt": "2023-07-15"},
                {"id": 3, "code": "R003", "name": "上壳镭雕错误", "description": "电池上壳体镭雕信息错误", "createdAt": "2023-09-10"},
                {"id": 4, "code": "R004", "name": "电池不识别", "description": "电池无法被设备识别", "createdAt": "2023-10-01"},
                {"id": 5, "code": "R005", "name": "锁扣损坏", "description": "电池锁扣损坏或断裂", "createdAt": "2023-10-15"},
                {"id": 6, "code": "R006", "name": "电池离线", "description": "电池连接异常离线", "createdAt": "2023-11-01"},
                {"id": 7, "code": "R007", "name": "压差大", "description": "电池单体压差过大", "createdAt": "2023-11-15"},
                {"id": 8, "code": "R008", "name": "MOS异常", "description": "MOS管异常故障", "createdAt": "2023-12-01"},
                {"id": 9, "code": "R009", "name": "单体二级欠压保护", "description": "单体电池二级欠压保护", "createdAt": "2023-12-15"},
                {"id": 10, "code": "R010", "name": "其他", "description": "其他返厂原因", "createdAt": "2024-01-01"}
            ],
            "responsibilities": [
                {"id": 1, "code": "RS01", "name": "日升质", "description": "日升质生产问题", "createdAt": "2023-06-01"},
                {"id": 2, "code": "RS02", "name": "菲尼基", "description": "菲尼基生产问题", "createdAt": "2023-07-15"},
                {"id": 3, "code": "RS03", "name": "用户", "description": "用户使用不当", "createdAt": "2023-09-10"},
                {"id": 4, "code": "RS04", "name": "立方", "description": "立方责任问题", "createdAt": "2023-10-05"}
            ],
            "expressCompanies": [
                {"id": 1, "code": "EX01", "name": "跨越", "contactPhone": "95338", "createdAt": "2023-06-01"},
                {"id": 2, "code": "EX02", "name": "顺丰", "contactPhone": "95338", "createdAt": "2023-07-15"},
                {"id": 3, "code": "EX03", "name": "中通", "contactPhone": "95311", "createdAt": "2023-09-10"}
            ]
        }
        
        with open(settings_file, 'w', encoding='utf-8') as f:
            json.dump(default_settings, f, ensure_ascii=False, indent=2)

def create_server_js():
    """创建server.js文件"""
    server_content = '''const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(__dirname));

// 数据文件路径
const BATTERY_DATA_FILE = path.join(__dirname, 'data', 'batteries.json');
const SETTINGS_DATA_FILE = path.join(__dirname, 'data', 'settings.json');

// 确保数据文件存在
function ensureDataFiles() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(BATTERY_DATA_FILE)) {
        fs.writeFileSync(BATTERY_DATA_FILE, '[]');
    }
    
    if (!fs.existsSync(SETTINGS_DATA_FILE)) {
        const defaultSettings = {
            "batteryModels": [],
            "returnReasons": [],
            "responsibilities": [],
            "expressCompanies": []
        };
        fs.writeFileSync(SETTINGS_DATA_FILE, JSON.stringify(defaultSettings, null, 2));
    }
}

// 初始化数据文件
ensureDataFiles();

// API路由
app.get('/api/batteries', (req, res) => {
    try {
        const batteries = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        res.json(batteries);
    } catch (err) {
        res.status(500).json({ error: '无法读取电池数据' });
    }
});

app.post('/api/batteries', (req, res) => {
    try {
        const batteries = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const newBattery = { ...req.body, id: Date.now().toString() };
        batteries.push(newBattery);
        fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(batteries));
        res.json(newBattery);
    } catch (err) {
        res.status(500).json({ error: '无法保存电池数据' });
    }
});

app.put('/api/batteries/:id', (req, res) => {
    try {
        const batteries = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const index = batteries.findIndex(b => b.id === req.params.id);
        if (index !== -1) {
            batteries[index] = { ...batteries[index], ...req.body };
            fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(batteries));
            res.json(batteries[index]);
        } else {
            res.status(404).json({ error: '未找到电池数据' });
        }
    } catch (err) {
        res.status(500).json({ error: '无法更新电池数据' });
    }
});

app.delete('/api/batteries/:id', (req, res) => {
    try {
        const batteries = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const filteredBatteries = batteries.filter(b => b.id !== req.params.id);
        fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(filteredBatteries));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '无法删除电池数据' });
    }
});

// 设置相关API
app.get('/api/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_DATA_FILE));
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: '无法读取系统设置' });
    }
});

app.put('/api/settings', (req, res) => {
    try {
        const currentSettings = JSON.parse(fs.readFileSync(SETTINGS_DATA_FILE));
        const updatedSettings = { ...currentSettings, ...req.body };
        fs.writeFileSync(SETTINGS_DATA_FILE, JSON.stringify(updatedSettings));
        res.json(updatedSettings);
    } catch (err) {
        res.status(500).json({ error: '无法更新系统设置' });
    }
});

// 启动服务器
app.listen(port, host, () => {
    console.log(`电池售后管理系统服务器运行在 http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});
'''
    
    with open('server.js', 'w', encoding='utf-8') as f:
        f.write(server_content)

def create_package_json():
    """创建package.json文件"""
    package_content = {
        "name": "battery-management-system",
        "version": "1.0.0",
        "description": "电池售后管理系统",
        "main": "server.js",
        "scripts": {
            "start": "node server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "cors": "^2.8.5"
        },
        "keywords": ["battery", "management", "system"],
        "author": "",
        "license": "MIT"
    }
    
    with open('package.json', 'w', encoding='utf-8') as f:
        json.dump(package_content, f, indent=2, ensure_ascii=False)

def build_executable():
    """构建可执行文件"""
    print("开始构建可执行文件...")

    # 使用简化的命令行参数构建，避免spec文件的复杂性
    cmd = [
        'pyinstaller',
        '--clean',
        '--name=电池售后管理系统',
        '--onedir',
        '--noconsole',
        '--add-data=*.js;.',
        '--add-data=*.html;.',
        '--add-data=*.css;.',
        '--add-data=data;data',
        'launcher.py'
    ]

    try:
        print(f"执行命令: {' '.join(cmd)}")
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✓ 构建成功！")
        return True
    except subprocess.SubprocessError as e:
        print(f"构建失败: {e}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"错误详情: {e.stderr}")
        return False

def post_build_setup():
    """构建后的设置"""
    print("进行构建后设置...")
    
    dist_dir = Path('dist/电池售后管理系统')
    
    if not dist_dir.exists():
        print("错误: 构建输出目录不存在")
        return False
    
    # 创建使用说明
    readme_content = '''电池售后管理系统 - 使用说明

1. 运行方式：
   双击"电池售后管理系统.exe"启动程序

2. 功能说明：
   - 服务器启动：在本机启动服务器，可供多台电脑访问
   - 连接现有服务器：连接到其他电脑上的服务器
   - 数据存储：所有数据保存在data文件夹中

3. 多电脑协作：
   - 在一台电脑上启动服务器
   - 其他电脑通过"连接现有服务器"功能连接
   - 所有电脑可以同时查看和编辑数据

4. 数据备份：
   定期备份data文件夹中的数据

5. 注意事项：
   - 确保防火墙允许程序访问网络
   - 多台电脑需要在同一局域网内

版本：1.0.0
'''
    
    readme_file = dist_dir / '使用说明.txt'
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"✓ 已创建使用说明: {readme_file}")
    print(f"✓ 构建完成！可执行文件位于: {dist_dir}")
    
    return True

def main():
    """主函数"""
    print("=" * 50)
    print("电池售后管理系统 - 独立打包工具")
    print("=" * 50)
    
    # 检查环境
    if not check_requirements():
        return False
    
    # 准备文件
    if not prepare_files():
        return False
    
    # 构建可执行文件
    if not build_executable():
        return False
    
    # 构建后设置
    if not post_build_setup():
        return False
    
    print("\n" + "=" * 50)
    print("打包完成！")
    print("可执行文件位于: dist/电池售后管理系统/")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
