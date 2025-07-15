// 修复维修记录数据加载问题
console.log('开始修复维修记录数据加载问题');

// 确保在页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    console.log('维修记录页面DOM加载完成');
    
    // 检查并初始化数据
    initializeRecordsData();
});

async function initializeRecordsData() {
    console.log('开始初始化维修记录数据');
    
    try {
        // 检查localStorage中是否有数据
        const existingBatteries = localStorage.getItem('batteries');
        let batteries = [];
        
        if (existingBatteries) {
            batteries = JSON.parse(existingBatteries);
            console.log(`localStorage中已有 ${batteries.length} 条记录`);
        }
        
        // 如果没有数据或数据很少，创建示例数据
        if (!batteries || batteries.length < 5) {
            console.log('创建示例数据');
            batteries = createSampleBatteries();
            localStorage.setItem('batteries', JSON.stringify(batteries));
            console.log(`已创建 ${batteries.length} 条示例记录`);
        }
        
        // 验证BatteryAPI是否可用
        if (typeof BatteryAPI !== 'undefined') {
            console.log('BatteryAPI可用');
            
            // 测试API调用
            const testRecords = await BatteryAPI.getAllBatteries();
            console.log(`API返回 ${testRecords.length} 条记录`);
            
            // 如果API返回的数据为空，重新设置
            if (testRecords.length === 0) {
                localStorage.setItem('batteries', JSON.stringify(batteries));
                console.log('重新设置localStorage数据');
            }
        } else {
            console.error('BatteryAPI未定义');
        }
        
    } catch (error) {
        console.error('初始化数据时出错:', error);
        
        // 出错时创建基本示例数据
        const basicBatteries = createSampleBatteries();
        localStorage.setItem('batteries', JSON.stringify(basicBatteries));
        console.log('已创建基本示例数据');
    }
}

function createSampleBatteries() {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return [
        {
            id: Date.now().toString(),
            batteryBtCode: "BT106005115RZPY241130437",
            bmsNumber: "7850731234567",
            batteryModel: "K174",
            cycleCount: 111,
            returnDate: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)), // 7天前
            returnArea: "广东深圳",
            repairStatus: "已维修",
            repairItem: "BMS维修",
            repairCost: 130,
            repairDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5天前
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
            id: (Date.now() + 1).toString(),
            batteryBtCode: "BT106005116RZPY24113042",
            bmsNumber: "7850731234568",
            batteryModel: "K175",
            cycleCount: 120,
            returnDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)), // 10天前
            returnArea: "江苏无锡",
            repairStatus: "维修中",
            repairItem: "电芯更换",
            repairCost: 220,
            repairDate: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3天前
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
            id: (Date.now() + 2).toString(),
            batteryBtCode: "BT106005117RZPY24113043",
            bmsNumber: "7850731234569",
            batteryModel: "K179",
            cycleCount: 95,
            returnDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), // 15天前
            returnArea: "浙江杭州",
            repairStatus: "已维修",
            repairItem: "锁扣更换",
            repairCost: 45,
            repairDate: formatDate(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)), // 12天前
            expressCompany: "跨越",
            shippingCost: 20,
            responsibility: "用户",
            laborCost: 15,
            returnReason: "锁扣损坏",
            causeAnalysis: "使用不当导致锁扣断裂",
            improvements: "加强用户使用指导",
            repairMeasures: "更换新锁扣",
            beforeRepairImages: [],
            afterRepairImages: []
        },
        {
            id: (Date.now() + 3).toString(),
            batteryBtCode: "BT106005118RZPY24113044",
            bmsNumber: "7850731234570",
            batteryModel: "K174",
            cycleCount: 200,
            returnDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)), // 20天前
            returnArea: "上海",
            repairStatus: "无法维修",
            repairItem: "其他",
            repairCost: 0,
            repairDate: formatDate(new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000)), // 18天前
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
            id: (Date.now() + 4).toString(),
            batteryBtCode: "BT106005119RZPY24113045",
            bmsNumber: "7850731234571",
            batteryModel: "K175",
            cycleCount: 150,
            returnDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), // 2天前
            returnArea: "北京",
            repairStatus: "已维修",
            repairItem: "BMS维修",
            repairCost: 150,
            repairDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)), // 1天前
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
        },
        {
            id: (Date.now() + 5).toString(),
            batteryBtCode: "BT106005120RZPY24113046",
            bmsNumber: "7850731234572",
            batteryModel: "K179",
            cycleCount: 80,
            returnDate: formatDate(today), // 今天
            returnArea: "广州",
            repairStatus: "待维修",
            repairItem: "电芯更换",
            repairCost: 0,
            repairDate: "",
            expressCompany: "顺丰",
            shippingCost: 32,
            responsibility: "菲尼基",
            laborCost: 0,
            returnReason: "MOS异常",
            causeAnalysis: "待分析",
            improvements: "待确定",
            repairMeasures: "待确定",
            beforeRepairImages: [],
            afterRepairImages: []
        }
    ];
}

// 导出函数供其他脚本使用
window.initializeRecordsData = initializeRecordsData;
window.createSampleBatteries = createSampleBatteries;

console.log('维修记录修复脚本加载完成');
