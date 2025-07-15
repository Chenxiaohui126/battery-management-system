# 贡献指南

感谢您对电池售后管理系统的关注！我们欢迎各种形式的贡献。

## 🤝 如何贡献

### 报告问题
如果您发现了bug或有功能建议，请：

1. 检查是否已有相关的Issue
2. 如果没有，请创建新的Issue
3. 详细描述问题或建议
4. 如果是bug，请提供复现步骤

### 提交代码

1. **Fork项目**
   ```bash
   # 点击GitHub页面右上角的Fork按钮
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/your-username/battery-management-system.git
   cd battery-management-system
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **安装依赖**
   ```bash
   npm install
   pip install pyinstaller  # 如果需要构建exe
   ```

5. **进行开发**
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保功能正常工作

6. **测试更改**
   ```bash
   # 启动开发服务器测试
   node server.js
   # 或
   python launcher.py
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复bug描述"
   ```

8. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建Pull Request**
   - 在GitHub上创建Pull Request
   - 详细描述您的更改
   - 等待代码审查

## 📝 代码规范

### JavaScript
- 使用ES6+语法
- 使用2空格缩进
- 函数和变量使用驼峰命名
- 添加适当的注释

```javascript
// 好的示例
function addBatteryRecord(batteryData) {
    // 验证数据
    if (!batteryData.id) {
        throw new Error('电池ID不能为空');
    }
    
    // 保存记录
    return saveBattery(batteryData);
}
```

### Python
- 遵循PEP 8规范
- 使用4空格缩进
- 函数和变量使用下划线命名
- 添加文档字符串

```python
def create_backup(data_dir):
    """
    创建数据备份
    
    Args:
        data_dir (str): 数据目录路径
        
    Returns:
        bool: 备份是否成功
    """
    pass
```

### HTML/CSS
- 使用2空格缩进
- 语义化HTML标签
- CSS类名使用kebab-case

## 🏗️ 项目结构

```
battery-management-system/
├── 📁 .github/workflows/    # GitHub Actions
├── 📁 data/                 # 数据文件
├── 📁 template/             # 模板文件
├── 📄 *.html               # 页面文件
├── 📄 *.js                 # JavaScript文件
├── 📄 *.css                # 样式文件
├── 📄 server.js            # Node.js服务器
├── 📄 python_server.py     # Python服务器
├── 📄 launcher.py          # 启动器
└── 📄 build_*.py           # 构建脚本
```

## 🧪 测试

在提交代码前，请确保：

1. **功能测试**
   - 所有现有功能正常工作
   - 新功能按预期工作
   - 没有明显的UI问题

2. **兼容性测试**
   - 在不同浏览器中测试
   - 测试响应式布局
   - 确保多平台协作正常

3. **数据测试**
   - 测试数据的增删改查
   - 验证数据备份还原
   - 确保数据格式正确

## 📋 提交信息规范

使用以下格式的提交信息：

```
<类型>: <描述>

[可选的正文]

[可选的脚注]
```

### 类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```
feat: 添加电池型号管理功能

- 新增电池型号的增删改查
- 支持动态更新下拉菜单
- 添加数据验证

Closes #123
```

## 🐛 Bug报告模板

报告bug时，请包含以下信息：

```markdown
**描述**
简要描述bug的现象

**复现步骤**
1. 打开...
2. 点击...
3. 输入...
4. 看到错误

**预期行为**
描述您期望发生的情况

**实际行为**
描述实际发生的情况

**环境信息**
- 操作系统: [如 Windows 10]
- 浏览器: [如 Chrome 91]
- 版本: [如 v1.1]

**截图**
如果适用，添加截图来帮助解释问题

**附加信息**
添加任何其他相关信息
```

## 💡 功能建议模板

提出功能建议时，请包含：

```markdown
**功能描述**
简要描述建议的功能

**使用场景**
描述什么情况下需要这个功能

**解决方案**
描述您希望的解决方案

**替代方案**
描述您考虑过的其他解决方案

**附加信息**
添加任何其他相关信息或截图
```

## 📞 联系方式

如果您有任何问题，可以通过以下方式联系：

- 创建Issue
- 发送邮件至：your-email@example.com
- 在Pull Request中留言

感谢您的贡献！🎉
