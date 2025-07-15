import sys
import os
import socket
import threading
import webbrowser
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox

class ServerLauncher(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.title("电池售后管理系统启动器")
        self.geometry("480x320")
        self.resizable(False, False)
        
        self.server_process = None
        self.is_server_running = False
        
        # 添加图标和标题
        self.main_frame = ttk.Frame(self)
        self.main_frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)
        
        title_label = ttk.Label(
            self.main_frame, 
            text="电池售后管理系统服务器", 
            font=("Arial", 16, "bold")
        )
        title_label.pack(pady=10)
        
        # 创建设置面板
        settings_frame = ttk.LabelFrame(self.main_frame, text="服务器设置")
        settings_frame.pack(fill=tk.X, padx=10, pady=10, ipady=5)
        
        # IP地址选择
        ip_frame = ttk.Frame(settings_frame)
        ip_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(ip_frame, text="IP地址:").pack(side=tk.LEFT, padx=5)
        
        # 获取本机IP地址
        self.ip_addresses = self.get_ip_addresses()
        self.ip_var = tk.StringVar(value="0.0.0.0")  # 默认监听所有接口
        
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
        
        self.port_var = tk.StringVar(value="8000")
        port_entry = ttk.Entry(port_frame, textvariable=self.port_var, width=10)
        port_entry.pack(side=tk.LEFT, padx=5)
        
        # 自动打开浏览器选项
        self.auto_open_var = tk.BooleanVar(value=True)
        auto_open_check = ttk.Checkbutton(
            settings_frame, 
            text="启动时自动打开浏览器",
            variable=self.auto_open_var
        )
        auto_open_check.pack(anchor=tk.W, padx=5, pady=5)
        
        # 状态显示
        self.status_var = tk.StringVar(value="服务器未启动")
        status_frame = ttk.LabelFrame(self.main_frame, text="服务器状态")
        status_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.status_label = ttk.Label(
            status_frame, 
            textvariable=self.status_var,
            font=("Arial", 10)
        )
        self.status_label.pack(padx=5, pady=5)
        
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
        
        # 按钮区域
        buttons_frame = ttk.Frame(self.main_frame)
        buttons_frame.pack(pady=15, fill=tk.X)
        
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
        
        # 状态栏
        self.status_bar = ttk.Label(self, text="准备就绪", relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # 关闭窗口时处理
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
    
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
    
    def start_server(self):
        """启动HTTP服务器"""
        if self.is_server_running:
            messagebox.showinfo("提示", "服务器已经在运行中")
            return
        
        ip = self.ip_var.get()
        port = self.port_var.get()
        
        # 验证端口号
        try:
            port = int(port)
            if not (1024 <= port <= 65535):
                messagebox.showerror("错误", "端口号必须在1024-65535之间")
                return
        except ValueError:
            messagebox.showerror("错误", "端口号必须是有效的数字")
            return
        
        # 启动服务器进程
        try:
            cmd = [sys.executable, "-m", "http.server", str(port)]
            
            # 如果选择了特定IP（非0.0.0.0），添加绑定参数
            if ip != "0.0.0.0":
                cmd.extend(["--bind", ip])
            
            self.server_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.getcwd()
            )
            
            # 更新UI状态
            self.is_server_running = True
            self.status_var.set(f"服务器已启动，监听 {ip}:{port}")
            
            # 构建访问URL
            display_ip = "localhost" if ip == "0.0.0.0" else ip
            self.url_var.set(f"http://{display_ip}:{port}")
            
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
        """停止HTTP服务器"""
        if not self.is_server_running:
            return
        
        try:
            if self.server_process:
                # 在Windows上使用taskkill终止进程
                if sys.platform == 'win32':
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(self.server_process.pid)])
                else:
                    self.server_process.terminate()
                    self.server_process.wait(timeout=5)
                
                self.server_process = None
            
            # 更新UI状态
            self.is_server_running = False
            self.status_var.set("服务器已停止")
            self.url_var.set("")
            
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
            
        # 监控服务器输出
        while self.is_server_running:
            if self.server_process.poll() is not None:
                # 进程已结束
                self.is_server_running = False
                
                # 在主线程中更新UI
                self.after(0, self.update_ui_after_stop)
                break
                
            # 检查是否有错误输出
            error = self.server_process.stderr.readline()
            if error and 'Error' in error:
                print(f"服务器错误: {error}")
    
    def update_ui_after_stop(self):
        """在服务器停止后更新UI"""
        self.status_var.set("服务器异常停止")
        self.url_var.set("")
        
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.ip_combo.config(state=tk.NORMAL)
        self.status_bar.config(text="服务器已停止")
    
    def open_browser(self, event=None):
        """打开浏览器访问服务器"""
        url = self.url_var.get()
        if url:
            webbrowser.open(url)
    
    def on_closing(self):
        """窗口关闭时的处理"""
        if self.is_server_running:
            if messagebox.askyesno("确认", "服务器正在运行，确定要退出吗？"):
                self.stop_server()
                self.destroy()
        else:
            self.destroy()

if __name__ == "__main__":
    app = ServerLauncher()
    # 设置窗口样式
    style = ttk.Style()
    style.theme_use('clam')  # 可选主题: 'clam', 'alt', 'default', 'classic'
    app.mainloop() 