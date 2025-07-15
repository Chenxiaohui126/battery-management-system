import sys
import os
import socket
import threading
import webbrowser
import subprocess
import platform
import json
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from tkinter.scrolledtext import ScrolledText

class BatteryManagementLauncher(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.title("电池售后管理系统 - 多平台协作启动器")
        self.geometry("600x450")
        self.minsize(600, 450)
        
        self.server_process = None
        self.is_server_running = False
        
        # 获取程序运行目录（支持打包后的exe）
        if getattr(sys, 'frozen', False):
            # 如果是打包后的exe
            self.app_dir = os.path.dirname(sys.executable)
        else:
            # 如果是源码运行
            self.app_dir = os.path.dirname(os.path.abspath(__file__))

        # 确保数据目录存在
        self.data_dir = os.path.join(self.app_dir, 'data')
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

        # 配置文件路径
        self.config_file = os.path.join(self.data_dir, 'launcher_config.json')
        
        # 加载配置
        self.config = self.load_config()
        
        self.create_widgets()
        self.update_hostname_display()
        
        # 关闭窗口时处理
        self.protocol("WM_DELETE_WINDOW", self.on_closing)

    def load_config(self):
        """加载配置文件，如果不存在则创建默认配置"""
        default_config = {
            "ip": "0.0.0.0",
            "port": "3000",
            "auto_open_browser": True,
            "node_path": self.find_node_path(),
            "startup_mode": "express",  # 'express' 或 'http'
            "last_connections": []
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return default_config
        else:
            self.save_config(default_config)
            return default_config

    def save_config(self, config=None):
        """保存配置到文件"""
        if config is None:
            config = self.config
        
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)

    def find_node_path(self):
        """尝试自动找到Node.js可执行文件路径"""
        try:
            if platform.system() == 'Windows':
                # Windows上查找node.exe
                paths = [
                    r"C:\Program Files\nodejs\node.exe",
                    r"C:\Program Files (x86)\nodejs\node.exe"
                ]
                
                # 也尝试从环境变量找
                if os.environ.get('PATH'):
                    for path_dir in os.environ['PATH'].split(os.pathsep):
                        node_path = os.path.join(path_dir, 'node.exe')
                        if os.path.isfile(node_path):
                            return node_path
                
                for path in paths:
                    if os.path.isfile(path):
                        return path
                
                # 如果找不到，返回简单的命令名称，让系统去找
                return 'node'
            else:
                # Linux/Mac上尝试查找node
                try:
                    result = subprocess.run(['which', 'node'], capture_output=True, text=True)
                    if result.returncode == 0:
                        return result.stdout.strip()
                except:
                    pass
                
                # 如果找不到，返回简单的命令名称
                return 'node'
        except:
            return 'node'  # 默认使用命令名称，让系统去找

    def create_widgets(self):
        """创建UI组件"""
        # 创建主框架
        main_frame = ttk.Frame(self)
        main_frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)
        
        # 标题
        title_label = ttk.Label(
            main_frame, 
            text="电池售后管理系统 - 多平台协作启动器", 
            font=("Arial", 16, "bold")
        )
        title_label.pack(pady=10)
        
        # 创建选项卡控件
        tab_control = ttk.Notebook(main_frame)
        
        # 创建服务器选项卡
        server_tab = ttk.Frame(tab_control)
        tab_control.add(server_tab, text="服务器启动")
        
        # 创建客户端选项卡
        client_tab = ttk.Frame(tab_control)
        tab_control.add(client_tab, text="连接现有服务器")
        
        # 创建设置选项卡
        settings_tab = ttk.Frame(tab_control)
        tab_control.add(settings_tab, text="设置")
        
        tab_control.pack(expand=1, fill="both")
        
        # 设置服务器选项卡内容
        self.setup_server_tab(server_tab)
        
        # 设置客户端选项卡内容
        self.setup_client_tab(client_tab)
        
        # 设置设置选项卡内容
        self.setup_settings_tab(settings_tab)
        
        # 状态栏
        self.status_bar = ttk.Label(self, text="准备就绪", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
    def setup_server_tab(self, parent):
        """设置服务器选项卡内容"""
        # 服务器设置
        settings_frame = ttk.LabelFrame(parent, text="服务器设置")
        settings_frame.pack(fill=tk.X, padx=10, pady=10, ipady=5)
        
        # 启动模式
        mode_frame = ttk.Frame(settings_frame)
        mode_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(mode_frame, text="启动模式:").pack(side=tk.LEFT, padx=5)
        
        self.mode_var = tk.StringVar(value=self.config.get('startup_mode', 'express'))
        
        express_radio = ttk.Radiobutton(
            mode_frame, 
            text="Express服务器 (完整功能)",
            variable=self.mode_var,
            value="express"
        )
        express_radio.pack(side=tk.LEFT, padx=10)
        
        http_radio = ttk.Radiobutton(
            mode_frame, 
            text="HTTP服务器 (仅静态文件)",
            variable=self.mode_var,
            value="http"
        )
        http_radio.pack(side=tk.LEFT, padx=10)
        
        # IP地址选择
        ip_frame = ttk.Frame(settings_frame)
        ip_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(ip_frame, text="IP地址:").pack(side=tk.LEFT, padx=5)
        
        # 获取本机IP地址
        self.ip_addresses = self.get_ip_addresses()
        self.ip_var = tk.StringVar(value=self.config.get('ip', '0.0.0.0'))
        
        self.ip_combo = ttk.Combobox(
            ip_frame, 
            textvariable=self.ip_var, 
            values=["0.0.0.0"] + self.ip_addresses,
            width=25
        )
        self.ip_combo.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # 端口设置
        port_frame = ttk.Frame(settings_frame)
        port_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(port_frame, text="端口:").pack(side=tk.LEFT, padx=5)
        
        self.port_var = tk.StringVar(value=self.config.get('port', '3000'))
        port_entry = ttk.Entry(port_frame, textvariable=self.port_var, width=10)
        port_entry.pack(side=tk.LEFT, padx=5)
        
        # 自动打开浏览器选项
        self.auto_open_var = tk.BooleanVar(value=self.config.get('auto_open_browser', True))
        auto_open_check = ttk.Checkbutton(
            settings_frame, 
            text="启动时自动打开浏览器",
            variable=self.auto_open_var
        )
        auto_open_check.pack(anchor=tk.W, padx=5, pady=5)
        
        # 主机名和IP信息
        host_frame = ttk.LabelFrame(parent, text="网络信息 (供其他电脑连接)")
        host_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.host_info_var = tk.StringVar(value="")
        host_info_label = ttk.Label(
            host_frame,
            textvariable=self.host_info_var,
            font=("Arial", 10)
        )
        host_info_label.pack(padx=5, pady=5)
        
        refresh_btn = ttk.Button(
            host_frame,
            text="刷新网络信息",
            command=self.update_hostname_display
        )
        refresh_btn.pack(padx=5, pady=5, anchor=tk.E)
        
        # 状态显示
        status_frame = ttk.LabelFrame(parent, text="服务器状态")
        status_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.status_var = tk.StringVar(value="服务器未启动")
        status_label = ttk.Label(
            status_frame, 
            textvariable=self.status_var,
            font=("Arial", 10)
        )
        status_label.pack(padx=5, pady=5)
        
        # URL显示
        self.url_var = tk.StringVar(value="")
        self.url_label = ttk.Label(
            status_frame,
            textvariable=self.url_var,
            font=("Arial", 10, "underline"),
            foreground="blue",
            cursor="hand2"
        )
        self.url_label.pack(padx=5, pady=5)
        self.url_label.bind("<Button-1>", self.open_browser)
        
        # 服务器日志
        log_frame = ttk.LabelFrame(parent, text="服务器日志")
        log_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.log_text = ScrolledText(log_frame, height=5)
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 按钮区域
        buttons_frame = ttk.Frame(parent)
        buttons_frame.pack(pady=10, fill=tk.X)
        
        self.start_button = ttk.Button(
            buttons_frame, 
            text="启动服务器", 
            command=self.start_server
        )
        self.start_button.pack(side=tk.LEFT, padx=5, expand=True)
        
        self.stop_button = ttk.Button(
            buttons_frame, 
            text="停止服务器", 
            command=self.stop_server,
            state=tk.DISABLED
        )
        self.stop_button.pack(side=tk.LEFT, padx=5, expand=True)
    
    def setup_client_tab(self, parent):
        """设置客户端选项卡内容"""
        # 最近连接历史
        history_frame = ttk.LabelFrame(parent, text="最近连接")
        history_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.connections_listbox = tk.Listbox(history_frame, height=6)
        self.connections_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.connections_listbox.bind('<Double-1>', self.connect_to_selected)
        
        # 填充最近连接列表
        self.update_connections_list()
        
        # 连接控制区
        connect_frame = ttk.LabelFrame(parent, text="连接到服务器")
        connect_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 服务器地址
        addr_frame = ttk.Frame(connect_frame)
        addr_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(addr_frame, text="服务器地址:").pack(side=tk.LEFT, padx=5)
        
        self.server_addr_var = tk.StringVar()
        addr_entry = ttk.Entry(addr_frame, textvariable=self.server_addr_var, width=30)
        addr_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        # 手动输入格式提示
        ttk.Label(connect_frame, text="格式: http://IP地址:端口", font=('Arial', 8)).pack(anchor=tk.W, padx=10)
        
        # 连接按钮
        connect_btn = ttk.Button(
            connect_frame, 
            text="连接", 
            command=self.connect_to_server
        )
        connect_btn.pack(pady=10)
        
        # 删除历史按钮
        clear_btn = ttk.Button(
            connect_frame, 
            text="清除历史记录", 
            command=self.clear_connection_history
        )
        clear_btn.pack(pady=5)
    
    def setup_settings_tab(self, parent):
        """设置设置选项卡内容"""
        # Node.js设置
        node_frame = ttk.LabelFrame(parent, text="Node.js 设置")
        node_frame.pack(fill=tk.X, padx=10, pady=10)
        
        node_path_frame = ttk.Frame(node_frame)
        node_path_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(node_path_frame, text="Node.js路径:").pack(side=tk.LEFT, padx=5)
        
        self.node_path_var = tk.StringVar(value=self.config.get('node_path', 'node'))
        node_path_entry = ttk.Entry(node_path_frame, textvariable=self.node_path_var, width=40)
        node_path_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        browse_btn = ttk.Button(
            node_path_frame,
            text="浏览...",
            command=self.browse_node_path
        )
        browse_btn.pack(side=tk.LEFT, padx=5)
        
        # 测试Node.js按钮
        test_node_btn = ttk.Button(
            node_frame,
            text="测试Node.js",
            command=self.test_node
        )
        test_node_btn.pack(pady=5, anchor=tk.E, padx=5)
        
        # 保存设置按钮
        save_btn = ttk.Button(
            parent,
            text="保存设置",
            command=self.save_settings
        )
        save_btn.pack(pady=10, anchor=tk.CENTER)
        
        # 关于信息
        about_frame = ttk.LabelFrame(parent, text="关于")
        about_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        about_text = ttk.Label(
            about_frame,
            text="电池售后管理系统 - 多平台协作启动器\n\n"
                 "版本: 1.0.0\n"
                 "支持多台电脑协作编辑和查看数据\n"
                 "支持Windows、Mac和Linux系统\n\n"
                 "© 2023-2024",
            justify=tk.CENTER
        )
        about_text.pack(pady=20)
    
    def get_ip_addresses(self):
        """获取本机所有IP地址"""
        hostname = socket.gethostname()
        addresses = []
        
        # 获取所有网络接口的IP
        try:
            for ip in socket.getaddrinfo(hostname, None):
                if ip[0] == socket.AF_INET:  # 只获取IPv4地址
                    if ip[4][0] != '127.0.0.1':  # 排除本地回环地址
                        addresses.append(ip[4][0])
        except:
            pass
            
        # 如果上面的方法未找到IP，尝试另一种方法
        if not addresses:
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(('8.8.8.8', 80))
                addresses.append(s.getsockname()[0])
                s.close()
            except:
                pass
        
        return list(set(addresses))  # 去重
    
    def update_hostname_display(self):
        """更新主机名和IP显示"""
        hostname = socket.gethostname()
        ip_list = self.get_ip_addresses()
        
        if ip_list:
            ip_text = "\n".join([f"http://{ip}:{self.port_var.get()}" for ip in ip_list])
            self.host_info_var.set(f"主机名: {hostname}\n\n其他电脑可通过以下地址连接:\n{ip_text}")
        else:
            self.host_info_var.set(f"主机名: {hostname}\n\n无法检测网络连接")
    
    def start_server(self):
        """启动服务器"""
        if self.is_server_running:
            messagebox.showinfo("提示", "服务器已经在运行中")
            return
        
        # 保存当前设置
        self.config['ip'] = self.ip_var.get()
        self.config['port'] = self.port_var.get()
        self.config['auto_open_browser'] = self.auto_open_var.get()
        self.config['startup_mode'] = self.mode_var.get()
        self.save_config()
        
        ip = self.ip_var.get()
        port = self.port_var.get()
        
        # 验证端口号
        try:
            port_num = int(port)
            if not (1024 <= port_num <= 65535):
                messagebox.showerror("错误", "端口号必须在1024-65535之间")
                return
        except ValueError:
            messagebox.showerror("错误", "端口号必须是有效的数字")
            return
        
        # 清空日志
        self.log_text.delete(1.0, tk.END)
        
        # 启动服务器进程
        try:
            mode = self.mode_var.get()
            
            if mode == "express":
                # 使用Node.js Express服务器
                node_path = self.node_path_var.get() or 'node'
                
                # 检查server.js文件是否存在
                # 在打包后的环境中，server.js位于_internal目录
                if getattr(sys, 'frozen', False):
                    # 打包后的环境
                    server_js_path = os.path.join(self.app_dir, '_internal', 'server.js')
                else:
                    # 开发环境
                    server_js_path = os.path.join(self.app_dir, 'server.js')

                if not os.path.exists(server_js_path):
                    messagebox.showerror("错误", f"找不到server.js文件，路径：{server_js_path}")
                    return

                cmd = [node_path, server_js_path]
                
                # 设置环境变量以配置服务器
                env = os.environ.copy()
                env['PORT'] = port
                env['HOST'] = ip
                
                self.log_text.insert(tk.END, f"正在启动Express服务器...\n")
                self.log_text.insert(tk.END, f"使用Node.js路径: {node_path}\n")
                self.log_text.insert(tk.END, f"监听地址: {ip}:{port}\n\n")
                
            else:
                # 使用Python的HTTP服务器
                cmd = [sys.executable, "-m", "http.server", port]
                
                # 如果选择了特定IP（非0.0.0.0），添加绑定参数
                if ip != "0.0.0.0":
                    cmd.extend(["--bind", ip])
                
                env = os.environ.copy()
                
                self.log_text.insert(tk.END, f"正在启动Python HTTP服务器...\n")
                self.log_text.insert(tk.END, f"监听地址: {ip}:{port}\n\n")
            
            # 设置工作目录
            if getattr(sys, 'frozen', False):
                # 打包后的环境，使用_internal目录作为工作目录
                work_dir = os.path.join(self.app_dir, '_internal')
            else:
                # 开发环境，使用应用程序目录
                work_dir = self.app_dir

            # 启动进程
            self.server_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=work_dir,
                env=env
            )
            
            # 更新UI状态
            self.is_server_running = True
            server_type = "Express" if mode == "express" else "HTTP"
            self.status_var.set(f"{server_type}服务器已启动，监听 {ip}:{port}")
            
            # 构建访问URL
            display_ip = "localhost" if ip == "0.0.0.0" else ip
            self.url = f"http://{display_ip}:{port}"
            self.url_var.set(self.url)
            
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            self.ip_combo.config(state=tk.DISABLED)
            self.status_bar.config(text="服务器运行中")
            
            # 自动打开浏览器
            if self.auto_open_var.get():
                self.open_browser()
            
            # 启动监控线程
            threading.Thread(target=self.monitor_server, daemon=True).start()
            
        except Exception as e:
            messagebox.showerror("启动失败", f"服务器启动失败: {str(e)}")
    
    def stop_server(self):
        """停止服务器"""
        if not self.is_server_running:
            return
        
        try:
            if self.server_process:
                # 在Windows上使用taskkill终止进程
                if platform.system() == 'win32':
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(self.server_process.pid)])
                else:
                    self.server_process.terminate()
                    self.server_process.wait(timeout=5)
                
                self.server_process = None
            
            # 更新UI状态
            self.is_server_running = False
            self.status_var.set("服务器已停止")
            self.url_var.set("")
            
            self.log_text.insert(tk.END, "服务器已停止\n")
            
            self.start_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.DISABLED)
            self.ip_combo.config(state=tk.NORMAL)
            self.status_bar.config(text="服务器已停止")
            
        except Exception as e:
            messagebox.showerror("停止失败", f"服务器停止失败: {str(e)}")
    
    def monitor_server(self):
        """监控服务器进程"""
        if not self.server_process:
            return
            
        def read_stream(stream, prefix):
            """读取流的输出"""
            for line in iter(stream.readline, ''):
                if not line:
                    break
                self.log_text.insert(tk.END, f"{prefix}: {line}")
                self.log_text.see(tk.END)  # 自动滚动到最新内容
            
        # 创建读取stdout和stderr的线程
        stdout_thread = threading.Thread(
            target=read_stream,
            args=(self.server_process.stdout, "INFO"),
            daemon=True
        )
        stderr_thread = threading.Thread(
            target=read_stream,
            args=(self.server_process.stderr, "ERROR"),
            daemon=True
        )
        
        stdout_thread.start()
        stderr_thread.start()
        
        # 等待进程结束
        while self.is_server_running:
            if self.server_process.poll() is not None:
                # 进程已结束
                self.is_server_running = False
                
                # 在主线程中更新UI
                self.after(0, self.update_ui_after_stop)
                break
    
    def update_ui_after_stop(self):
        """在服务器停止后更新UI"""
        if self.is_server_running:
            return
            
        self.status_var.set("服务器已意外停止")
        self.log_text.insert(tk.END, "服务器已意外停止\n")
        self.log_text.see(tk.END)
        
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.ip_combo.config(state=tk.NORMAL)
        self.status_bar.config(text="服务器已停止")
    
    def open_browser(self, event=None):
        """打开浏览器访问服务器"""
        if self.url_var.get():
            webbrowser.open(self.url_var.get())
    
    def connect_to_server(self):
        """连接到指定的服务器"""
        url = self.server_addr_var.get().strip()
        
        if not url:
            messagebox.showerror("错误", "请输入服务器地址")
            return
            
        # 如果没有http前缀，添加http://
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"http://{url}"
            
        # 添加到最近连接列表
        if url not in self.config.get('last_connections', []):
            self.config.setdefault('last_connections', []).insert(0, url)
            # 最多保存10个历史记录
            self.config['last_connections'] = self.config['last_connections'][:10]
            self.save_config()
            self.update_connections_list()
        
        # 打开浏览器访问
        webbrowser.open(url)
    
    def connect_to_selected(self, event=None):
        """连接到列表中选中的服务器"""
        selection = self.connections_listbox.curselection()
        if selection:
            index = selection[0]
            url = self.config.get('last_connections', [])[index]
            self.server_addr_var.set(url)
            self.connect_to_server()
    
    def update_connections_list(self):
        """更新最近连接列表"""
        self.connections_listbox.delete(0, tk.END)
        
        for conn in self.config.get('last_connections', []):
            self.connections_listbox.insert(tk.END, conn)
    
    def clear_connection_history(self):
        """清除连接历史"""
        if messagebox.askyesno("确认", "确定要清除所有连接历史记录吗?"):
            self.config['last_connections'] = []
            self.save_config()
            self.update_connections_list()
            self.server_addr_var.set("")
    
    def browse_node_path(self):
        """浏览选择Node.js可执行文件路径"""
        if platform.system() == "Windows":
            file_types = [("可执行文件", "*.exe"), ("所有文件", "*.*")]
            initial_dir = os.path.dirname(self.node_path_var.get()) if os.path.exists(self.node_path_var.get()) else None
        else:
            file_types = [("所有文件", "*")]
            initial_dir = "/usr/local/bin" if os.path.exists("/usr/local/bin") else None
            
        path = filedialog.askopenfilename(
            title="选择Node.js可执行文件",
            filetypes=file_types,
            initialdir=initial_dir
        )
        
        if path:
            self.node_path_var.set(path)
    
    def test_node(self):
        """测试Node.js是否可用"""
        node_path = self.node_path_var.get() or 'node'
        
        try:
            result = subprocess.run(
                [node_path, '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                version = result.stdout.strip()
                messagebox.showinfo("测试成功", f"Node.js 可用，版本: {version}")
            else:
                messagebox.showerror("测试失败", f"Node.js 测试失败: {result.stderr}")
        except FileNotFoundError:
            messagebox.showerror("测试失败", f"找不到 Node.js: {node_path}")
        except Exception as e:
            messagebox.showerror("测试失败", f"测试 Node.js 时出错: {str(e)}")
    
    def save_settings(self):
        """保存设置"""
        self.config['node_path'] = self.node_path_var.get()
        self.save_config()
        messagebox.showinfo("成功", "设置已保存")
    
    def on_closing(self):
        """窗口关闭时的处理"""
        if self.is_server_running:
            if messagebox.askyesno("确认", "服务器正在运行，确定要退出吗?"):
                self.stop_server()
                self.save_config()
                self.destroy()
        else:
            self.save_config()
            self.destroy()

if __name__ == "__main__":
    app = BatteryManagementLauncher()
    app.mainloop() 