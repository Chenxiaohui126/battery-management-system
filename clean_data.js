const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BATTERY_DATA_FILE = path.join(DATA_DIR, 'batteries.json');
const BACKUP_FILE = path.join(DATA_DIR, 'batteries_backup.json');

// 备份当前数据
console.log('备份当前数据...');
fs.copyFileSync(BATTERY_DATA_FILE, BACKUP_FILE);
console.log(`数据已备份至 ${BACKUP_FILE}`);

// 读取当前数据
console.log('读取当前数据...');
const rawData = fs.readFileSync(BATTERY_DATA_FILE);
const batteries = JSON.parse(rawData);
console.log(`当前共有 ${batteries.length} 条数据`);

// 根据电池BT码去重
console.log('根据电池BT码去重...');
const uniqueBatteries = [];
const seenBTCodes = new Set();

// 从数据库的最后往前遍历，保留最新的记录
for (let i = batteries.length - 1; i >= 0; i--) {
    const battery = batteries[i];
    const btCode = battery.batteryBtCode;
    
    // 如果这个BT码之前没见过，就保留这条记录
    if (btCode && !seenBTCodes.has(btCode)) {
        seenBTCodes.add(btCode);
        uniqueBatteries.unshift(battery); // 添加到结果列表的开头
    }
}

// 如果用户想要保留特定数量的记录
const targetCount = 366; // 根据用户提到的数据量
const finalBatteries = uniqueBatteries.length > targetCount 
    ? uniqueBatteries.slice(0, targetCount) 
    : uniqueBatteries;

console.log(`去重后剩余 ${uniqueBatteries.length} 条数据`);
console.log(`最终保留 ${finalBatteries.length} 条数据`);

// 保存最终数据
console.log('保存清理后的数据...');
fs.writeFileSync(BATTERY_DATA_FILE, JSON.stringify(finalBatteries));
console.log('数据清理完成！');

// 初始化和清理数据脚本

// 添加示例数据到localStorage
function addSampleData() {
    // 示例电池数据
    const sampleBatteries = [
        {
            id: "1686549001234",
            batteryBtCode: "BT106005115RZPY241130437",
            bmsNumber: "7850731234567",
            batteryModel: "K174",
            cycleCount: "111",
            returnDate: "2023-05-11",
            returnArea: "广东深圳",
            repairStatus: "已维修",
            repairItem: "BMS维修",
            repairCost: "130",
            repairDate: "2023-05-12",
            expressCompany: "顺丰",
            shippingCost: "25",
            responsibility: "日升质",
            laborCost: "20",
            returnReason: "高低温报警",
            causeAnalysis: "BMS损坏",
            improvements: "优化设计",
            repairMeasures: "更换BMS"
        },
        {
            id: "1686549002345",
            batteryBtCode: "BT106005116RZPY24113042",
            bmsNumber: "7850731234568",
            batteryModel: "K175",
            cycleCount: "120",
            returnDate: "2023-05-10",
            returnArea: "江苏无锡",
            repairStatus: "维修中",
            repairItem: "电芯更换",
            repairCost: "220",
            repairDate: "2023-05-13",
            expressCompany: "中通",
            shippingCost: "30",
            responsibility: "菲尼基",
            laborCost: "30",
            returnReason: "漏胶",
            causeAnalysis: "电芯老化",
            improvements: "提高质检",
            repairMeasures: "更换电芯"
        },
        {
            id: "1686549003456",
            batteryBtCode: "BT106005117RZPY24113043",
            bmsNumber: "7850731234569",
            batteryModel: "K176",
            cycleCount: "95",
            returnDate: "2023-05-15",
            returnArea: "浙江杭州",
            repairStatus: "待维修",
            repairItem: "外壳维修",
            repairCost: "50",
            repairDate: "2023-05-20",
            expressCompany: "韵达",
            shippingCost: "22",
            responsibility: "用户",
            laborCost: "15",
            returnReason: "锁扣损坏",
            causeAnalysis: "使用不当",
            improvements: "增强锁扣强度",
            repairMeasures: "更换外壳"
        }
    ];

    // 将示例数据保存到localStorage
    localStorage.setItem('batteries', JSON.stringify(sampleBatteries));
    console.log('示例电池数据已添加到localStorage');
}

// 调用函数添加示例数据
addSampleData(); 