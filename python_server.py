#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电池售后管理系统 - Python服务器
不依赖Node.js的独立服务器
"""

import os
import json
import threading
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import socketserver

class BatteryServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 设置服务器根目录
        if getattr(sys, 'frozen', False):
            # 打包后的环境
            self.server_root = os.path.dirname(sys.executable)
        else:
            # 开发环境
            self.server_root = os.path.dirname(os.path.abspath(__file__))
        
        self.data_dir = os.path.join(self.server_root, 'data')
        self.ensure_data_files()
        
        super().__init__(*args, directory=self.server_root, **kwargs)
    
    def ensure_data_files(self):
        """确保数据文件存在"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        # 创建默认的batteries.json
        batteries_file = os.path.join(self.data_dir, 'batteries.json')
        if not os.path.exists(batteries_file):
            with open(batteries_file, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
        
        # 创建默认的settings.json
        settings_file = os.path.join(self.data_dir, 'settings.json')
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
                    {"id": 3, "code": "EX03", "name": "中通", "contactPhone": "95311", "createdAt": "2023-09-10"},
                    {"id": 4, "code": "EX04", "name": "圆通", "contactPhone": "95554", "createdAt": "2023-10-05"},
                    {"id": 5, "code": "EX05", "name": "韵达", "contactPhone": "95546", "createdAt": "2023-11-03"}
                ]
            }
            
            with open(settings_file, 'w', encoding='utf-8') as f:
                json.dump(default_settings, f, ensure_ascii=False, indent=2)
    
    def do_GET(self):
        """处理GET请求"""
        parsed_path = urlparse(self.path)
        
        # API请求处理
        if parsed_path.path.startswith('/api/'):
            self.handle_api_get(parsed_path)
        else:
            # 静态文件请求
            super().do_GET()
    
    def do_POST(self):
        """处理POST请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_post(parsed_path)
        else:
            self.send_error(404)
    
    def do_PUT(self):
        """处理PUT请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_put(parsed_path)
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        """处理DELETE请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/api/'):
            self.handle_api_delete(parsed_path)
        else:
            self.send_error(404)
    
    def handle_api_get(self, parsed_path):
        """处理API GET请求"""
        try:
            if parsed_path.path == '/api/batteries':
                batteries_file = os.path.join(self.data_dir, 'batteries.json')
                with open(batteries_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.send_json_response(data)
            
            elif parsed_path.path == '/api/settings':
                settings_file = os.path.join(self.data_dir, 'settings.json')
                with open(settings_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.send_json_response(data)
            
            else:
                self.send_error(404)
                
        except Exception as e:
            self.send_error(500, str(e))
    
    def handle_api_post(self, parsed_path):
        """处理API POST请求"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            if parsed_path.path == '/api/batteries':
                batteries_file = os.path.join(self.data_dir, 'batteries.json')

                # 读取现有数据
                with open(batteries_file, 'r', encoding='utf-8') as f:
                    batteries = json.load(f)

                # 生成新ID
                import time
                new_id = str(int(time.time() * 1000))
                new_battery = {**data, 'id': new_id}
                batteries.append(new_battery)

                # 保存数据
                with open(batteries_file, 'w', encoding='utf-8') as f:
                    json.dump(batteries, f, ensure_ascii=False, indent=2)

                self.send_json_response(new_battery)

            else:
                self.send_error(404)

        except Exception as e:
            self.send_error(500, str(e))
    
    def handle_api_put(self, parsed_path):
        """处理API PUT请求"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            if parsed_path.path == '/api/settings':
                settings_file = os.path.join(self.data_dir, 'settings.json')

                # 保存设置
                with open(settings_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_json_response(data)

            elif parsed_path.path.startswith('/api/batteries/'):
                # 更新电池数据
                battery_id = parsed_path.path.split('/')[-1]
                batteries_file = os.path.join(self.data_dir, 'batteries.json')

                with open(batteries_file, 'r', encoding='utf-8') as f:
                    batteries = json.load(f)

                # 查找并更新电池
                for i, battery in enumerate(batteries):
                    if battery.get('id') == battery_id:
                        batteries[i] = {**battery, **data}
                        break

                # 保存数据
                with open(batteries_file, 'w', encoding='utf-8') as f:
                    json.dump(batteries, f, ensure_ascii=False, indent=2)

                self.send_json_response({"success": True})

            else:
                self.send_error(404)

        except Exception as e:
            self.send_error(500, str(e))

    def handle_api_delete(self, parsed_path):
        """处理API DELETE请求"""
        try:
            if parsed_path.path.startswith('/api/batteries/'):
                # 删除电池数据
                battery_id = parsed_path.path.split('/')[-1]
                batteries_file = os.path.join(self.data_dir, 'batteries.json')

                with open(batteries_file, 'r', encoding='utf-8') as f:
                    batteries = json.load(f)

                # 过滤掉要删除的电池
                batteries = [b for b in batteries if b.get('id') != battery_id]

                # 保存数据
                with open(batteries_file, 'w', encoding='utf-8') as f:
                    json.dump(batteries, f, ensure_ascii=False, indent=2)

                self.send_json_response({"success": True})
            else:
                self.send_error(404)
        except Exception as e:
            self.send_error(500, str(e))
    
    def send_json_response(self, data):
        """发送JSON响应"""
        response = json.dumps(data, ensure_ascii=False, indent=2)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))

def start_server(host='0.0.0.0', port=3000):
    """启动服务器"""
    import sys
    
    print(f"启动电池售后管理系统服务器...")
    print(f"服务器地址: http://{host}:{port}")
    
    # 启动服务器
    with socketserver.TCPServer((host, port), BatteryServerHandler) as httpd:
        print(f"服务器运行在 http://{host}:{port}")
        
        # 自动打开浏览器
        def open_browser():
            import time
            time.sleep(2)
            webbrowser.open(f"http://localhost:{port}")
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")

if __name__ == "__main__":
    import sys
    
    # 从环境变量或命令行参数获取配置
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', '3000'))
    
    start_server(host, port)
