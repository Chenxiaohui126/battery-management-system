# 电池售后管理系统

一个专业的电池售后维修管理系统，支持多平台协作和完整的维修流程管理。

## 🌟 主要特性

### 📋 核心功能
- **电池信息管理** - 完整的电池基本信息录入和管理
- **维修记录管理** - 详细的维修过程记录和跟踪
- **图片管理** - 维修前后图片上传、预览和全屏查看
- **数据统计分析** - 维修统计报表和数据分析
- **系统设置** - 灵活的配置管理

### 🔧 高级特性
- **多平台协作** - 支持多台电脑同时访问和操作
- **动态配置** - 电池型号、维修项目、返厂原因等可动态配置
- **数据备份还原** - 完整的数据备份和还原功能
- **便携版本** - 无需安装Node.js的独立运行版本
- **响应式设计** - 适配不同屏幕尺寸

## 🚀 快速开始

### 方式一：使用便携版（推荐）

1. 下载便携版压缩包
2. 解压到任意目录
3. 双击运行 `电池售后管理系统_便携版.exe`
4. 点击"启动系统"按钮
5. 浏览器自动打开管理界面

### 方式二：源码运行

#### 环境要求
- Node.js 16.0+ 
- Python 3.8+（可选，用于便携版）

#### 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-username/battery-management-system.git
cd battery-management-system

# 安装依赖
npm install

# 启动服务器
npm start
# 或者
node server.js

# 访问系统
# 浏览器打开 http://localhost:3000
```

#### 使用启动器（推荐）

```bash
# 运行图形化启动器
python launcher.py
```

## 📖 使用说明

### 基本操作

1. **添加电池记录**
   - 点击"添加电池"按钮
   - 填写电池基本信息
   - 上传维修前图片
   - 保存记录

2. **维修记录管理**
   - 选择维修项目和费用
   - 填写维修措施
   - 上传维修后图片
   - 更新记录状态

3. **数据查询**
   - 使用搜索功能快速查找
   - 按条件筛选记录
   - 查看详细信息

### 系统设置

在设置页面可以管理：
- 电池型号列表
- 维修项目类型
- 返厂原因选项
- 责任归属设置
- 快递公司信息

## 🏗️ 项目结构

```
battery-management-system/
├── 📁 data/                    # 数据文件
│   ├── batteries.json          # 电池记录数据
│   └── settings.json           # 系统设置
├── 📁 dist/                    # 打包输出目录
├── 📁 template/                # 模板文件
├── 📄 index.html               # 主页面
├── 📄 records.html             # 记录管理页面
├── 📄 settings.html            # 设置页面
├── 📄 statistics.html          # 统计页面
├── 📄 server.js                # Node.js服务器
├── 📄 python_server.py         # Python服务器（便携版）
├── 📄 launcher.py              # 图形化启动器
├── 📄 package.json             # 项目配置
└── 📄 README.md                # 项目说明
```

## 🔧 技术栈

### 前端
- **HTML5/CSS3** - 现代化界面设计
- **JavaScript (ES6+)** - 交互逻辑
- **Bootstrap** - 响应式布局
- **Font Awesome** - 图标库

### 后端
- **Node.js + Express** - 主服务器
- **Python HTTP Server** - 便携版服务器
- **JSON文件存储** - 轻量级数据存储

### 桌面应用
- **Python Tkinter** - 图形化启动器
- **PyInstaller** - 可执行文件打包

## 📦 版本说明

### v1.1 (当前版本)
- ✅ 新增维修项目管理功能
- ✅ 优化下拉菜单动态同步
- ✅ 新增便携版本（无需Node.js）
- ✅ 改进图片全屏查看功能
- ✅ 优化多图片显示布局

### v1.0
- ✅ 基础电池管理功能
- ✅ 图片上传和管理
- ✅ 数据统计和导出
- ✅ 多平台协作支持

## 🌐 多平台协作

### 设置主服务器
1. 在主电脑上启动系统
2. 记录显示的IP地址（如：192.168.1.100:3000）
3. 确保防火墙允许3000端口访问

### 其他电脑访问
1. 打开浏览器
2. 输入主电脑的IP地址和端口
3. 开始协作使用

## 📊 数据管理

### 数据存储
- 所有数据保存在 `data/` 目录
- `batteries.json` - 电池维修记录
- `settings.json` - 系统配置信息

### 备份建议
- 定期备份整个 `data/` 目录
- 使用系统内置的备份还原功能
- 重要数据建议多地备份

## 🛠️ 开发指南

### 本地开发

```bash
# 安装开发依赖
npm install

# 启动开发服务器
npm run dev

# 或使用nodemon自动重启
npx nodemon server.js
```

### 构建打包

```bash
# 构建Windows可执行文件
python build_exe.py

# 构建便携版
python build_portable.py
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持与反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看 [使用说明](使用说明_便携版.txt)
2. 提交 [Issue](https://github.com/your-username/battery-management-system/issues)
3. 发送邮件至：your-email@example.com

## 🎯 路线图

### 计划中的功能
- [ ] 用户权限管理
- [ ] 数据库支持（MySQL/PostgreSQL）
- [ ] 移动端适配
- [ ] API接口文档
- [ ] 自动化测试
- [ ] Docker部署支持

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
