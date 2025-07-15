// API工具类，使用localStorage替代后端API服务器

/**
 * 电池数据相关API - 使用localStorage存储
 */
const BatteryAPI = {
    // 获取所有电池
    getAllBatteries: () => {
        return new Promise((resolve) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            resolve(batteries);
        });
    },
    
    // 获取单个电池
    getBatteryById: (id) => {
        return new Promise((resolve, reject) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            const battery = batteries.find(b => b.id === id);
            if (battery) {
                resolve(battery);
            } else {
                reject(new Error('未找到电池数据'));
            }
        });
    },
    
    // 创建新电池
    createBattery: (batteryData) => {
        return new Promise((resolve) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            // 生成唯一ID
            const newBattery = {
                ...batteryData,
                id: Date.now().toString()
            };
            
            batteries.push(newBattery);
            localStorage.setItem('batteries', JSON.stringify(batteries));
            resolve(newBattery);
        });
    },
    
    // 更新电池信息
    updateBattery: (id, batteryData) => {
        return new Promise((resolve, reject) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            const index = batteries.findIndex(b => b.id === id);
            
            if (index !== -1) {
                batteries[index] = { ...batteries[index], ...batteryData };
                localStorage.setItem('batteries', JSON.stringify(batteries));
                resolve(batteries[index]);
            } else {
                reject(new Error('未找到要更新的电池数据'));
            }
        });
    },
    
    // 删除电池
    deleteBattery: (id) => {
        return new Promise((resolve, reject) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            const newBatteries = batteries.filter(b => b.id !== id);
            
            if (batteries.length !== newBatteries.length) {
                localStorage.setItem('batteries', JSON.stringify(newBatteries));
                resolve({ success: true });
            } else {
                reject(new Error('未找到要删除的电池数据'));
            }
        });
    },
};

/**
 * 系统设置相关API - 使用localStorage存储
 */
const SettingsAPI = {
    // 获取所有设置
    getSettings: () => {
        return new Promise((resolve) => {
            // 从localStorage获取设置，如果没有则使用默认设置
            const settings = JSON.parse(localStorage.getItem('settings') || JSON.stringify({
                batteryModels: [
                    { id: 1, code: 'K174', name: 'K174标准电池', description: '标准容量电池，适用于XX型号车型', createdAt: '2023-06-01' },
                    { id: 2, code: 'K175', name: 'K175增强版电池', description: '大容量电池，适用于XX型号车型', createdAt: '2023-07-15' },
                    { id: 3, code: 'K176', name: 'K176高性能电池', description: '高性能电池，适用于XX型号车型', createdAt: '2023-09-10' }
                ],
                repairItems: [
                    { id: 1, code: 'RI001', name: 'BMS维修', description: '电池管理系统相关维修', createdAt: '2023-06-01' },
                    { id: 2, code: 'RI002', name: '电芯更换', description: '电池电芯更换维修', createdAt: '2023-07-15' },
                    { id: 3, code: 'RI003', name: '外壳维修', description: '电池外壳相关维修', createdAt: '2023-08-01' },
                    { id: 4, code: 'RI004', name: '锁扣更换', description: '电池锁扣更换维修', createdAt: '2023-09-01' },
                    { id: 5, code: 'RI005', name: '其他', description: '其他类型维修', createdAt: '2023-09-10' }
                ],
                returnReasons: [
                    { id: 1, code: 'R001', name: '高低温报警', description: '电池温度超过正常范围报警', createdAt: '2023-06-01' },
                    { id: 2, code: 'R002', name: '漏胶', description: '电池外壳漏胶问题', createdAt: '2023-07-15' },
                    { id: 3, code: 'R003', name: '上壳镭雕错误', description: '电池上壳体镭雕信息错误', createdAt: '2023-09-10' },
                    { id: 4, code: 'R004', name: '电池不识别', description: '电池无法被设备识别', createdAt: '2023-10-01' },
                    { id: 5, code: 'R005', name: '锁扣损坏', description: '电池锁扣损坏或断裂', createdAt: '2023-10-15' },
                    { id: 6, code: 'R006', name: '电池离线', description: '电池连接异常离线', createdAt: '2023-11-01' },
                    { id: 7, code: 'R007', name: '压差大', description: '电池单体压差过大', createdAt: '2023-11-15' },
                    { id: 8, code: 'R008', name: 'MOS异常', description: 'MOS管异常故障', createdAt: '2023-12-01' },
                    { id: 9, code: 'R009', name: '单体二级欠压保护', description: '单体电池二级欠压保护', createdAt: '2023-12-15' },
                    { id: 10, code: 'R010', name: '其他', description: '其他返厂原因', createdAt: '2024-01-01' }
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
            }));
            resolve(settings);
        });
    },
    
    // 更新设置
    updateSettings: (settingsData) => {
        return new Promise((resolve) => {
            const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
            const updatedSettings = { ...currentSettings, ...settingsData };
            localStorage.setItem('settings', JSON.stringify(updatedSettings));
            resolve(updatedSettings);
        });
    },
    
    // 备份数据
    backupData: () => {
        return new Promise((resolve) => {
            const batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            
            const backupData = {
                batteries,
                settings,
                timestamp: new Date().toISOString()
            };
            
            resolve(backupData);
        });
    },
    
    // 恢复数据
    restoreData: (backupData) => {
        return new Promise((resolve) => {
            if (backupData.batteries) {
                localStorage.setItem('batteries', JSON.stringify(backupData.batteries));
            }
            
            if (backupData.settings) {
                localStorage.setItem('settings', JSON.stringify(backupData.settings));
            }
            
            resolve({ success: true });
        });
    },
};

// 导出API函数
window.BatteryAPI = BatteryAPI;
window.SettingsAPI = SettingsAPI; 