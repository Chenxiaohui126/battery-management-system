#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电池售后管理系统 - 修复版启动器
"""

import sys
import os
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import webbrowser

class FixedLauncher(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.title("电池售后管理系统")
        self.geometry("400x300")
        self.resizable(False, False)
        
        # 获取程序目录
        if getattr(sys, 'frozen', False):
            self.app_dir = os.path.dirname(sys.executable)
        else:
            self.app_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.server_process = None
        self.create_widgets()
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def create_widgets(self):
        """创建界面"""
        # 标题
        title_label = ttk.Label(self, text="电池售后管理系统", font=("Arial", 16, "bold"))
        title_label.pack(pady=30)
        
        # 说明
        info_label = ttk.Label(self, text="点击下方按钮启动系统", font=("Arial", 10))
        info_label.pack(pady=10)
        
        # 启动按钮
        self.start_button = ttk.Button(self, text="启动系统", command=self.start_system, width=20)
        self.start_button.pack(pady=20)
        
        # 状态标签
        self.status_label = ttk.Label(self, text="系统未启动", foreground="red")
        self.status_label.pack(pady=10)
        
        # 打开浏览器按钮
        self.browser_button = ttk.Button(self, text="打开网页", command=self.open_browser, width=20, state=tk.DISABLED)
        self.browser_button.pack(pady=10)
    
    def start_system(self):
        """启动系统"""
        try:
            # 启动Python服务器
            # 在打包后的环境中，python_server.py位于_internal目录
            if getattr(sys, 'frozen', False):
                # 打包后的环境
                server_script = os.path.join(self.app_dir, "_internal", "python_server.py")
            else:
                # 开发环境
                server_script = os.path.join(self.app_dir, "python_server.py")
            
            if not os.path.exists(server_script):
                # 尝试其他可能的路径
                possible_paths = [
                    os.path.join(self.app_dir, "python_server.py"),
                    os.path.join(self.app_dir, "_internal", "python_server.py"),
                    os.path.join(os.path.dirname(self.app_dir), "python_server.py")
                ]
                
                server_script = None
                for path in possible_paths:
                    if os.path.exists(path):
                        server_script = path
                        break
                
                if not server_script:
                    messagebox.showerror("错误", f"找不到服务器文件。\n搜索路径:\n" + "\n".join(possible_paths))
                    return
            
            # 设置工作目录为包含网页文件的目录
            if getattr(sys, 'frozen', False):
                work_dir = os.path.join(self.app_dir, "_internal")
            else:
                work_dir = self.app_dir
            
            self.server_process = subprocess.Popen(
                [sys.executable, server_script],
                cwd=work_dir,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            
            self.start_button.config(state=tk.DISABLED)
            self.browser_button.config(state=tk.NORMAL)
            self.status_label.config(text="系统运行中", foreground="green")
            
            # 延迟打开浏览器
            threading.Timer(3.0, self.open_browser).start()
            
        except Exception as e:
            messagebox.showerror("错误", f"启动失败: {str(e)}")
    
    def open_browser(self):
        """打开浏览器"""
        webbrowser.open("http://localhost:3000")
    
    def on_closing(self):
        """关闭程序"""
        if self.server_process:
            self.server_process.terminate()
        self.destroy()

if __name__ == "__main__":
    app = FixedLauncher()
    app.mainloop()
