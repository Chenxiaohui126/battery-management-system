import os
import sys
import shutil
import subprocess
import platform
from tkinter import Tk, Label, Button, StringVar, OptionMenu, Frame, messagebox

def check_pyinstaller():
    """检查是否已安装PyInstaller"""
    try:
        subprocess.run(['pyinstaller', '--version'], 
                      capture_output=True, 
                      text=True, 
                      check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False

def install_pyinstaller():
    """安装PyInstaller"""
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller'],
                      check=True)
        return True
    except subprocess.SubprocessError:
        return False

def build_exe(icon_path=None, one_file=True, console=False):
    """构建EXE文件"""

    # 使用spec文件进行打包，这样更可控
    spec_file = '电池售后管理系统.spec'

    if not os.path.exists(spec_file):
        print("错误: 找不到spec文件，请确保电池售后管理系统.spec文件存在")
        return False

    # 确保关键文件存在
    ensure_required_files()

    # 构建命令
    cmd = ['pyinstaller', '--clean', spec_file]

    # 执行打包命令
    print(f"执行命令: {' '.join(cmd)}")
    print("正在打包，请稍候...")

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("打包成功！")

        # 复制额外的文件到输出目录
        copy_additional_files()

        return True
    except subprocess.SubprocessError as e:
        print(f"打包过程出错: {e}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"错误详情: {e.stderr}")
        return False

def ensure_required_files():
    """确保所有必需的文件都存在"""

    # 确保server.js存在
    if not os.path.exists('server.js'):
        print("警告: server.js文件不存在，正在创建基本版本...")
        create_server_js()

    # 确保package.json存在
    if not os.path.exists('package.json'):
        print("警告: package.json文件不存在，正在创建基本版本...")
        create_package_json()

    # 确保data目录存在
    if not os.path.exists('data'):
        os.makedirs('data', exist_ok=True)
        print("已创建data目录")

    # 确保data目录中有基本的配置文件
    ensure_data_files()

def create_server_js():
    """创建基本的server.js文件"""
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
    console.log(`在局域网内，其他电脑可通过 http://[本机IP]:${port} 访问`);
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
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "body-parser": "^1.20.2"
        },
        "keywords": ["battery", "management", "system"],
        "author": "",
        "license": "MIT"
    }

    with open('package.json', 'w', encoding='utf-8') as f:
        import json
        json.dump(package_content, f, indent=2, ensure_ascii=False)

def ensure_data_files():
    """确保数据目录中有必要的文件"""
    data_dir = 'data'

    # 创建默认的batteries.json
    batteries_file = os.path.join(data_dir, 'batteries.json')
    if not os.path.exists(batteries_file):
        with open(batteries_file, 'w', encoding='utf-8') as f:
            f.write('[]')

    # 创建默认的settings.json
    settings_file = os.path.join(data_dir, 'settings.json')
    if not os.path.exists(settings_file):
        default_settings = {
            "batteryModels": [
                {"id": 1, "code": "K174", "name": "K174标准电池", "description": "标准容量电池", "createdAt": "2023-06-01"},
                {"id": 2, "code": "K175", "name": "K175增强版电池", "description": "大容量电池", "createdAt": "2023-07-15"},
                {"id": 3, "code": "K179", "name": "K179高性能电池", "description": "高性能电池", "createdAt": "2023-09-10"}
            ],
            "returnReasons": [
                {"id": 1, "code": "R001", "name": "高低温报警", "description": "电池温度超过正常范围报警", "createdAt": "2023-06-01"},
                {"id": 2, "code": "R002", "name": "漏胶", "description": "电池外壳漏胶问题", "createdAt": "2023-07-15"},
                {"id": 3, "code": "R003", "name": "锁扣损坏", "description": "电池锁扣损坏", "createdAt": "2023-09-10"}
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
            import json
            json.dump(default_settings, f, indent=2, ensure_ascii=False)

def copy_additional_files():
    """复制额外的文件到输出目录"""
    dist_dir = os.path.join('dist', '电池售后管理系统')

    if not os.path.exists(dist_dir):
        print("警告: 输出目录不存在")
        return

    # 创建使用说明文件
    readme_content = '''电池售后管理系统 - 使用说明

1. 运行方式：
   - 双击"电池售后管理系统.exe"启动程序
   - 程序会自动打开启动器界面

2. 功能说明：
   - 服务器启动：在本机启动服务器，可供多台电脑访问
   - 连接现有服务器：连接到其他电脑上的服务器
   - 数据存储：所有数据保存在data文件夹中

3. 多电脑协作：
   - 在一台电脑上启动服务器
   - 其他电脑通过"连接现有服务器"功能连接
   - 所有电脑可以同时查看和编辑数据

4. 数据备份：
   - 定期备份data文件夹
   - 可通过系统设置进行数据导入导出

5. 注意事项：
   - 确保防火墙允许程序访问网络
   - 多台电脑需要在同一局域网内
   - 建议定期备份数据

技术支持：请联系系统管理员
版本：1.0.0
'''

    readme_file = os.path.join(dist_dir, '使用说明.txt')
    with open(readme_file, 'w', encoding='utf-8') as f:
        f.write(readme_content)

    print(f"已创建使用说明文件: {readme_file}")

class BuildExeApp(Tk):
    """打包EXE的图形界面应用"""
    def __init__(self):
        super().__init__()
        self.title("生成独立可执行文件")
        self.geometry("500x350")
        self.resizable(False, False)
        
        self.icon_path = None
        self.one_file = True
        self.console = False
        
        self.create_widgets()
        
    def create_widgets(self):
        # 标题
        Label(self, text="电池售后管理系统 - 生成EXE工具", font=("Arial", 14, "bold")).pack(pady=20)
        
        # 框架容器
        frame = Frame(self)
        frame.pack(pady=10, fill='both', expand=True)
        
        # 单文件/文件夹选项
        Label(frame, text="打包方式:").grid(row=0, column=0, sticky='w', padx=20, pady=10)
        self.package_type = StringVar(value="单文件")
        package_options = OptionMenu(frame, self.package_type, "单文件", "文件夹")
        package_options.grid(row=0, column=1, sticky='w', pady=10)
        
        # 是否显示控制台
        Label(frame, text="显示控制台:").grid(row=1, column=0, sticky='w', padx=20, pady=10)
        self.console_type = StringVar(value="隐藏")
        console_options = OptionMenu(frame, self.console_type, "隐藏", "显示")
        console_options.grid(row=1, column=1, sticky='w', pady=10)
        
        # 选择图标按钮
        Label(frame, text="程序图标:").grid(row=2, column=0, sticky='w', padx=20, pady=10)
        self.icon_label = Label(frame, text="默认图标")
        self.icon_label.grid(row=2, column=1, sticky='w', pady=10)
        Button(frame, text="选择图标", command=self.choose_icon).grid(row=2, column=2, pady=10, padx=10)
        
        # 状态显示
        self.status_var = StringVar(value="准备就绪")
        status_label = Label(self, textvariable=self.status_var, font=("Arial", 10))
        status_label.pack(pady=5)
        
        # 构建按钮
        Button(self, text="开始生成", width=15, height=2, command=self.start_build).pack(pady=20)
        
    def choose_icon(self):
        """选择图标文件"""
        from tkinter import filedialog
        filetypes = [("图标文件", "*.ico"), ("所有文件", "*.*")]
        icon = filedialog.askopenfilename(title="选择图标文件", filetypes=filetypes)
        
        if icon:
            self.icon_path = icon
            self.icon_label.config(text=os.path.basename(icon))
    
    def start_build(self):
        """开始构建过程"""
        # 更新设置
        self.one_file = self.package_type.get() == "单文件"
        self.console = self.console_type.get() == "显示"
        
        # 检查PyInstaller
        self.status_var.set("检查 PyInstaller...")
        self.update()
        
        if not check_pyinstaller():
            self.status_var.set("正在安装 PyInstaller...")
            self.update()
            
            if not install_pyinstaller():
                messagebox.showerror("错误", "无法安装 PyInstaller，请手动安装:\npip install pyinstaller")
                self.status_var.set("安装失败")
                return
        
        # 开始构建
        self.status_var.set("正在生成可执行文件...")
        self.update()
        
        success = build_exe(
            icon_path=self.icon_path,
            one_file=self.one_file,
            console=self.console
        )
        
        if success:
            self.status_var.set("生成成功！文件保存在 dist 目录中")
            messagebox.showinfo("成功", "EXE文件已生成！\n可在dist目录找到电池售后管理系统.exe")
        else:
            self.status_var.set("生成失败")
            messagebox.showerror("错误", "生成EXE文件失败，请检查日志")

def main():
    """命令行主函数"""
    if len(sys.argv) > 1:
        # 命令行模式
        print("开始生成独立可执行文件...")
        
        # 检查PyInstaller
        if not check_pyinstaller():
            print("正在安装PyInstaller...")
            if not install_pyinstaller():
                print("错误: 无法安装PyInstaller")
                return False
        
        # 查找默认图标
        icon_path = 'favicon.ico' if os.path.exists('favicon.ico') else None
        
        # 构建EXE
        print("正在生成可执行文件...")
        success = build_exe(icon_path=icon_path)
        
        if success:
            print("成功: EXE文件已生成！文件保存在 dist 目录中")
            return True
        else:
            print("错误: 生成EXE文件失败")
            return False
    else:
        # 图形界面模式
        app = BuildExeApp()
        app.mainloop()
        return True

if __name__ == "__main__":
    main() 