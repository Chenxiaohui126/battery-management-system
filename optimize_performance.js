// 性能优化脚本
console.log('加载性能优化脚本');

// 优化localStorage操作
const StorageOptimizer = {
    // 缓存数据，避免重复解析
    cache: new Map(),
    
    // 获取数据（带缓存）
    getData(key) {
        if (this.cache.has(key)) {
            console.log(`从缓存获取 ${key}`);
            return this.cache.get(key);
        }
        
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.cache.set(key, parsed);
                console.log(`从localStorage获取并缓存 ${key}，数据量: ${parsed.length}`);
                return parsed;
            } catch (error) {
                console.error(`解析 ${key} 数据出错:`, error);
                return [];
            }
        }
        return [];
    },
    
    // 设置数据（更新缓存）
    setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        this.cache.set(key, data);
        console.log(`保存并缓存 ${key}，数据量: ${data.length}`);
    },
    
    // 清除缓存
    clearCache() {
        this.cache.clear();
        console.log('缓存已清除');
    }
};

// 优化的BatteryAPI
const OptimizedBatteryAPI = {
    // 获取所有电池数据（优化版）
    async getAllBatteries() {
        console.log('获取所有电池数据（优化版）');
        
        // 先尝试从缓存获取
        let batteries = StorageOptimizer.getData('batteries');
        
        // 如果没有数据，创建默认数据
        if (!batteries || batteries.length === 0) {
            console.log('没有数据，创建默认数据');
            batteries = this.createDefaultData();
            StorageOptimizer.setData('batteries', batteries);
        }
        
        return batteries;
    },
    
    // 创建默认数据（性能优化版）
    createDefaultData() {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        return [
            {
                id: "1",
                batteryBtCode: "BT106005115RZPY241130437",
                bmsNumber: "7850731234567",
                batteryModel: "K174",
                cycleCount: 111,
                returnDate: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
                returnArea: "广东深圳",
                repairStatus: "已维修",
                repairItem: "BMS维修",
                repairCost: 130,
                repairDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
                expressCompany: "顺丰",
                shippingCost: 25,
                responsibility: "日升质",
                laborCost: 20,
                returnReason: "高低温报警",
                causeAnalysis: "BMS损坏",
                improvements: "优化设计",
                repairMeasures: "更换BMS",
                beforeRepairImages: [],
                afterRepairImages: []
            },
            {
                id: "2",
                batteryBtCode: "BT106005116RZPY24113042",
                bmsNumber: "7850731234568",
                batteryModel: "K175",
                cycleCount: 120,
                returnDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
                returnArea: "江苏无锡",
                repairStatus: "维修中",
                repairItem: "电芯更换",
                repairCost: 220,
                repairDate: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
                expressCompany: "中通",
                shippingCost: 30,
                responsibility: "菲尼基",
                laborCost: 30,
                returnReason: "漏胶",
                causeAnalysis: "电芯老化",
                improvements: "提高质检",
                repairMeasures: "更换电芯",
                beforeRepairImages: [],
                afterRepairImages: []
            },
            {
                id: "3",
                batteryBtCode: "BT106005117RZPY24113043",
                bmsNumber: "7850731234569",
                batteryModel: "K179",
                cycleCount: 95,
                returnDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
                returnArea: "浙江杭州",
                repairStatus: "待维修",
                repairItem: "外壳维修",
                repairCost: 80,
                repairDate: "",
                expressCompany: "跨越",
                shippingCost: 20,
                responsibility: "用户",
                laborCost: 15,
                returnReason: "锁扣损坏",
                causeAnalysis: "使用不当",
                improvements: "用户培训",
                repairMeasures: "更换外壳",
                beforeRepairImages: [],
                afterRepairImages: []
            },
            {
                id: "4",
                batteryBtCode: "BT106005118RZPY24113044",
                bmsNumber: "7850731234570",
                batteryModel: "K174",
                cycleCount: 200,
                returnDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
                returnArea: "上海",
                repairStatus: "无法维修",
                repairItem: "其他",
                repairCost: 0,
                repairDate: formatDate(new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000)),
                expressCompany: "圆通",
                shippingCost: 35,
                responsibility: "立方",
                laborCost: 0,
                returnReason: "电池离线",
                causeAnalysis: "硬件故障",
                improvements: "设计改进",
                repairMeasures: "无法修复",
                beforeRepairImages: [],
                afterRepairImages: []
            },
            {
                id: "5",
                batteryBtCode: "BT106005119RZPY24113045",
                bmsNumber: "7850731234571",
                batteryModel: "K175",
                cycleCount: 150,
                returnDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
                returnArea: "北京",
                repairStatus: "已维修",
                repairItem: "BMS维修",
                repairCost: 150,
                repairDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
                expressCompany: "韵达",
                shippingCost: 28,
                responsibility: "日升质",
                laborCost: 25,
                returnReason: "压差大",
                causeAnalysis: "电芯不平衡",
                improvements: "改进均衡算法",
                repairMeasures: "重新校准BMS",
                beforeRepairImages: [],
                afterRepairImages: []
            }
        ];
    },
    
    // 添加电池记录
    async addBattery(batteryData) {
        const batteries = await this.getAllBatteries();
        batteryData.id = Date.now().toString();
        batteries.push(batteryData);
        StorageOptimizer.setData('batteries', batteries);
        return batteryData;
    },
    
    // 更新电池记录
    async updateBattery(id, batteryData) {
        const batteries = await this.getAllBatteries();
        const index = batteries.findIndex(b => b.id === id);
        if (index !== -1) {
            batteries[index] = { ...batteries[index], ...batteryData };
            StorageOptimizer.setData('batteries', batteries);
            return batteries[index];
        }
        throw new Error('记录不存在');
    },
    
    // 删除电池记录
    async deleteBattery(id) {
        const batteries = await this.getAllBatteries();
        const filteredBatteries = batteries.filter(b => b.id !== id);
        StorageOptimizer.setData('batteries', filteredBatteries);
        return true;
    }
};

// 性能监控
const PerformanceMonitor = {
    startTime: Date.now(),
    
    // 记录性能指标
    mark(label) {
        const now = Date.now();
        const elapsed = now - this.startTime;
        console.log(`⏱️ ${label}: ${elapsed}ms`);
        return elapsed;
    },
    
    // 重置计时器
    reset() {
        this.startTime = Date.now();
    }
};

// 替换原有的BatteryAPI
if (typeof window !== 'undefined') {
    window.BatteryAPI = OptimizedBatteryAPI;
    window.StorageOptimizer = StorageOptimizer;
    window.PerformanceMonitor = PerformanceMonitor;
}

console.log('性能优化脚本加载完成');
