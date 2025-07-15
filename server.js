const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BATTERY_DATA_FILE = path.join(DATA_DIR, 'batteries.json');
const SETTINGS_DATA_FILE = path.join(DATA_DIR, 'settings.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
if (!fs.existsSync(BATTERY_DATA_FILE)) {
    fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify([]));
}
if (!fs.existsSync(SETTINGS_DATA_FILE)) {
    const defaultSettings = {
        batteryModels: [
            { id: 1, code: 'K174', name: 'K174标准电池', description: '标准容量电池，适用于XX型号车型', createdAt: '2023-06-01' },
            { id: 2, code: 'K175', name: 'K175增强版电池', description: '大容量电池，适用于XX型号车型', createdAt: '2023-07-15' },
            { id: 3, code: 'K176', name: 'K176高性能电池', description: '高性能电池，适用于XX型号车型', createdAt: '2023-09-10' }
        ],
        returnReasons: [
            { id: 1, code: 'R001', name: '高低温报警', description: '电池温度超过正常范围报警', createdAt: '2023-06-01' },
            { id: 2, code: 'R002', name: '漏胶', description: '电池外壳漏胶问题', createdAt: '2023-07-15' },
            { id: 3, code: 'R003', name: '上壳镭雕错误', description: '电池上壳体镭雕信息错误', createdAt: '2023-09-10' }
        ],
        responsibilities: [
            { id: 1, code: 'RS01', name: '日升质', description: '日升质生产问题', createdAt: '2023-06-01' },
            { id: 2, code: 'RS02', name: '菲尼基', description: '菲尼基生产问题', createdAt: '2023-07-15' },
            { id: 3, code: 'RS03', name: '用户', description: '用户使用不当', createdAt: '2023-09-10' },
            { id: 4, code: 'RS04', name: '立方', description: '立方责任问题', createdAt: '2023-10-05' }
        ],
        expressCompanies: [
            { id: 1, code: 'EX01', name: '跨越', contactPhone: '95338', createdAt: '2023-06-01' },
            { id: 2, code: 'EX02', name: '顺丰', contactPhone: '95338', createdAt: '2023-07-15' },
            { id: 3, code: 'EX03', name: '中通', contactPhone: '95311', createdAt: '2023-09-10' },
            { id: 4, code: 'EX04', name: '圆通', contactPhone: '95554', createdAt: '2023-10-05' },
            { id: 5, code: 'EX05', name: '韵达', contactPhone: '95546', createdAt: '2023-11-03' }
        ]
    };
    fs.writeFileSync(SETTINGS_DATA_FILE, JSON.stringify(defaultSettings));
}

// 允许跨域请求，方便局域网内其他电脑访问
app.use(cors());

// 解析JSON请求体
app.use(bodyParser.json());

// 静态文件服务
app.use(express.static(__dirname));

// API路由：获取所有电池数据
app.get('/api/batteries', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: '无法读取电池数据' });
    }
});

// API路由：获取单个电池数据
app.get('/api/batteries/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const battery = data.find(b => b.id === req.params.id);
        if (battery) {
            res.json(battery);
        } else {
            res.status(404).json({ error: '未找到电池数据' });
        }
    } catch (err) {
        res.status(500).json({ error: '无法读取电池数据' });
    }
});

// API路由：保存电池数据
app.post('/api/batteries', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const newBattery = req.body;
        
        // 生成唯一ID
        newBattery.id = Date.now().toString();
        
        data.push(newBattery);
        fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(data));
        res.status(201).json(newBattery);
    } catch (err) {
        res.status(500).json({ error: '无法保存电池数据' });
    }
});

// API路由：更新电池数据
app.put('/api/batteries/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const batteryId = req.params.id;
        const updatedBattery = req.body;
        
        const index = data.findIndex(b => b.id === batteryId);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedBattery };
            fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(data));
            res.json(data[index]);
        } else {
            res.status(404).json({ error: '未找到要更新的电池数据' });
        }
    } catch (err) {
        res.status(500).json({ error: '无法更新电池数据' });
    }
});

// API路由：删除电池数据
app.delete('/api/batteries/:id', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const batteryId = req.params.id;
        
        const filteredData = data.filter(b => b.id !== batteryId);
        if (data.length !== filteredData.length) {
            fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(filteredData));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '未找到要删除的电池数据' });
        }
    } catch (err) {
        res.status(500).json({ error: '无法删除电池数据' });
    }
});

// API路由：获取系统设置
app.get('/api/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_DATA_FILE));
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: '无法读取系统设置' });
    }
});

// API路由：更新系统设置
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

// API路由：备份数据
app.get('/api/backup', (req, res) => {
    try {
        const batteries = JSON.parse(fs.readFileSync(BATTERY_DATA_FILE));
        const settings = JSON.parse(fs.readFileSync(SETTINGS_DATA_FILE));
        
        const backupData = {
            batteries,
            settings,
            timestamp: new Date().toISOString()
        };
        
        res.json(backupData);
    } catch (err) {
        res.status(500).json({ error: '无法创建数据备份' });
    }
});

// API路由：恢复数据
app.post('/api/restore', (req, res) => {
    try {
        const backupData = req.body;
        
        if (backupData.batteries) {
            fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(backupData.batteries));
        }
        
        if (backupData.settings) {
            fs.writeFileSync(SETTINGS_DATA_FILE, JSON.stringify(backupData.settings));
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: '无法恢复数据' });
    }
});

// 监听服务器端口
app.listen(port, host, () => {
    console.log(`电池售后管理系统服务器运行在 http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`在局域网内，其他电脑可通过 http://[本机IP]:${port} 访问`);
}); 