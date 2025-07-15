// 初始化数据脚本 - 添加电池数据到localStorage

/**
 * 从JSON文件加载全部电池数据
 */
async function loadAllBatteriesFromJSON() {
    try {
        const response = await fetch('data/batteries.json');
        if (!response.ok) {
            throw new Error('无法加载电池数据文件');
        }
        const batteries = await response.json();
        console.log(`已从JSON文件加载 ${batteries.length} 条记录`);
        return batteries;
    } catch (error) {
        console.error('加载电池数据文件出错:', error);
        return null;
    }
}

// 添加电池数据到localStorage
async function addBatteryData() {
    // 检查localStorage中是否已有数据
    const existingBatteries = localStorage.getItem('batteries');
    if (existingBatteries && JSON.parse(existingBatteries).length > 0) {
        console.log('localStorage中已有电池数据，不重新加载');
        return;
    }

    try {
        // 先尝试从JSON文件加载数据
        const batteries = await loadAllBatteriesFromJSON();
        
        if (batteries && batteries.length > 0) {
            // 将数据保存到localStorage
            localStorage.setItem('batteries', JSON.stringify(batteries));
            console.log(`成功导入 ${batteries.length} 条电池记录到localStorage`);
            return;
        }
        
        // 如果无法从文件加载，使用示例数据
        useSampleData();
    } catch (error) {
        console.error('导入电池数据出错:', error);
        // 出错时使用示例数据
        useSampleData();
    }
}

// 使用示例数据
function useSampleData() {
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
    console.log('已添加示例电池数据到localStorage');
}

// 清除localStorage数据并重新加载页面
function resetData() {
    if (confirm('确定要重置所有数据吗？这将清除所有已保存的记录！')) {
        localStorage.removeItem('batteries');
        localStorage.removeItem('settings');
        alert('数据已重置，即将重新加载页面');
        window.location.reload();
    }
}

// 添加重置按钮到页面
function addResetButton() {
    // 如果已存在重置按钮，则不添加
    if (document.getElementById('resetDataBtn')) {
        return;
    }

    // 创建重置按钮
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetDataBtn';
    resetBtn.className = 'btn btn-danger btn-sm position-fixed';
    resetBtn.style.bottom = '20px';
    resetBtn.style.right = '20px';
    resetBtn.style.zIndex = '1000';
    resetBtn.innerHTML = '<i class="bi bi-trash"></i> 重置数据';
    resetBtn.addEventListener('click', resetData);
    
    // 添加到body
    document.body.appendChild(resetBtn);
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加重置按钮
    addResetButton();
    // 加载电池数据
    addBatteryData();
}); 