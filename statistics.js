document.addEventListener('DOMContentLoaded', async function() {
    // 从API获取真实数据，而不是localStorage
    let records = [];
    try {
        // 使用API获取电池记录
        records = await BatteryAPI.getAllBatteries();
        console.log(`成功加载 ${records.length} 条电池记录`);
    } catch (error) {
        console.error('Error loading battery records:', error);
        alert('加载电池记录失败: ' + error.message);
    }

    // 更新顶部的统计卡片
    const totalCount = records.length || 0;
    
    // 统计不同维修状态的数量
    const statusCounts = {
        '已维修': 0,
        '维修中': 0,
        '待维修': 0,
        '无法维修': 0
    };
    
    records.forEach(record => {
        const status = record.repairStatus || '待维修';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });
    
    // 更新DOM中的数字
    document.querySelector('.card.bg-primary .card-body h3').textContent = totalCount;
    document.querySelector('.card.bg-success .card-body h3').textContent = statusCounts['已维修'];
    document.querySelector('.card.bg-warning .card-body h3').textContent = statusCounts['维修中'];
    document.querySelector('.card.bg-danger .card-body h3').textContent = statusCounts['无法维修'];
    
    // 存储记录到全局变量，供各个图表使用
    window.batteryRecords = records;
    
    // Initialize charts
    initCharts();
});

// Function to initialize all charts
function initCharts() {
    // 费用统计
    createCostCharts();
    
    // 原因统计
    createReasonChart();
    
    // 维修状态分布
    createStatusCharts();
    
    // 客退地区统计
    createAreaChart();
    
    // 快递运费统计
    // createShippingCharts();
    
    // 责任归属统计
    createResponsibilityChart();
    
    // 用户责任统计
    createUserResponsibilityChart();
    
    // 返厂原因统计
    createReturnReasonChart();
    
    // 维修时间统计
    createTimeCharts();
    
    // 超时维修统计
    createOverdueStatistics();
}

// 费用统计
function createCostCharts() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 按电池型号分类费用
    const modelCosts = {};
    let totalAllCosts = 0;
    
    // 添加按月份统计的费用对象
    const monthlyCosts = {};
    
    records.forEach(record => {
        const model = record.batteryModel || '其他';
        const repairCost = parseFloat(record.repairCost) || 0;
        const shippingCost = parseFloat(record.shippingCost) || 0;
        const laborCost = parseFloat(record.laborCost) || 0;
        
        // 累加各型号费用
        if (!modelCosts[model]) {
            modelCosts[model] = { 
                shipping: 0,
                repair: 0,
                labor: 0
            };
        }
        modelCosts[model].shipping += shippingCost;
        modelCosts[model].repair += repairCost;
        modelCosts[model].labor += laborCost;
        
        // 累加所有费用
        totalAllCosts += shippingCost + repairCost + laborCost;
        
        // 按月份统计费用
        // 获取维修日期，如果没有则获取返厂日期，如果都没有则使用当前日期
        let date = null;
        if (record.repairDate && record.repairDate !== "") {
            date = new Date(record.repairDate);
        } else if (record.returnDate && record.returnDate !== "") {
            date = new Date(record.returnDate);
        } else {
            date = new Date(); // 默认当前日期
        }
        
        // 提取年月
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript月份从0开始
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        
        // 初始化月度数据
        if (!monthlyCosts[yearMonth]) {
            monthlyCosts[yearMonth] = {
                repair: 0,
                shipping: 0,
                labor: 0, 
                count: 0
            };
        }
        
        // 累加费用
        monthlyCosts[yearMonth].repair += repairCost;
        monthlyCosts[yearMonth].shipping += shippingCost;
        monthlyCosts[yearMonth].labor += laborCost;
        monthlyCosts[yearMonth].count++;
    });
    
    // 更新总计金额
    document.getElementById('totalCostSummary').textContent = `总计: ¥${totalAllCosts.toFixed(2)}`;
    
    // 准备图表和表格数据
    const models = Object.keys(modelCosts);
    const shippingData = [];
    const repairData = [];
    const laborData = [];
    
    // 如果没有数据，添加默认项
    if (models.length === 0) {
        models.push('K174', 'K175', 'K179', '其他');
        modelCosts['K174'] = { shipping: 0, repair: 0, labor: 0 };
        modelCosts['K175'] = { shipping: 0, repair: 0, labor: 0 };
        modelCosts['K179'] = { shipping: 0, repair: 0, labor: 0 };
        modelCosts['其他'] = { shipping: 0, repair: 0, labor: 0 };
    }
    
    // 填充表格数据
    const tableBody = document.getElementById('modelCostTable');
    tableBody.innerHTML = '';
    let totalCosts = { shipping: 0, repair: 0, labor: 0, total: 0 };
    
    models.forEach(model => {
        const costs = modelCosts[model];
        const total = costs.shipping + costs.repair + costs.labor;
        
        // 将数据添加到图表数组
        shippingData.push(costs.shipping);
        repairData.push(costs.repair);
        laborData.push(costs.labor);
        
        // 累加总费用
        totalCosts.shipping += costs.shipping;
        totalCosts.repair += costs.repair;
        totalCosts.labor += costs.labor;
        totalCosts.total += total;
        
        // 创建表格行
        const row = document.createElement('tr');
        
        // 电池型号
        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        row.appendChild(modelCell);
        
        // 运费总额
        const shippingCell = document.createElement('td');
        shippingCell.textContent = `¥${costs.shipping.toFixed(2)}`;
        row.appendChild(shippingCell);
        
        // 维修费用总额
        const repairCell = document.createElement('td');
        repairCell.textContent = `¥${costs.repair.toFixed(2)}`;
        row.appendChild(repairCell);
        
        // 维修工时费总额
        const laborCell = document.createElement('td');
        laborCell.textContent = `¥${costs.labor.toFixed(2)}`;
        row.appendChild(laborCell);
        
        // 总费用
        const totalCell = document.createElement('td');
        totalCell.textContent = `¥${total.toFixed(2)}`;
        totalCell.classList.add('fw-bold');
        row.appendChild(totalCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 运费总计
    const totalShippingCell = document.createElement('td');
    totalShippingCell.textContent = `¥${totalCosts.shipping.toFixed(2)}`;
    totalShippingCell.classList.add('fw-bold');
    totalRow.appendChild(totalShippingCell);
    
    // 维修费用总计
    const totalRepairCell = document.createElement('td');
    totalRepairCell.textContent = `¥${totalCosts.repair.toFixed(2)}`;
    totalRepairCell.classList.add('fw-bold');
    totalRow.appendChild(totalRepairCell);
    
    // 维修工时费总计
    const totalLaborCell = document.createElement('td');
    totalLaborCell.textContent = `¥${totalCosts.labor.toFixed(2)}`;
    totalLaborCell.classList.add('fw-bold');
    totalRow.appendChild(totalLaborCell);
    
    // 总费用总计
    const totalTotalCell = document.createElement('td');
    totalTotalCell.textContent = `¥${totalCosts.total.toFixed(2)}`;
    totalTotalCell.classList.add('fw-bold');
    totalRow.appendChild(totalTotalCell);
    
    tableBody.appendChild(totalRow);
    
    // 创建电池型号费用统计图表
    const modelCostCtx = document.getElementById('modelCostChart').getContext('2d');
    new Chart(modelCostCtx, {
        type: 'bar',
        data: {
            labels: models,
            datasets: [
                {
                    label: '运费总额',
                    data: shippingData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: '维修费用总额',
                    data: repairData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '维修工时费总额',
                    data: laborData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: '电池型号'
                    }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额(元)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '各型号电池费用统计'
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });

    // 按维修项目分类费用（原有逻辑保留）
    const repairItemCosts = {};
    const costDistribution = {
        '0-100元': 0,
        '101-200元': 0,
        '201-300元': 0,
        '301-500元': 0,
        '500元以上': 0
    };
    
    records.forEach(record => {
        const repairItem = record.repairItem || '其他';
        const cost = parseFloat(record.repairCost) || 0;
        
        // 累加维修项目费用
        if (!repairItemCosts[repairItem]) {
            repairItemCosts[repairItem] = { total: 0, count: 0 };
        }
        repairItemCosts[repairItem].total += cost;
        repairItemCosts[repairItem].count++;
        
        // 统计费用分布
        if (cost <= 100) {
            costDistribution['0-100元']++;
        } else if (cost <= 200) {
            costDistribution['101-200元']++;
        } else if (cost <= 300) {
            costDistribution['201-300元']++;
        } else if (cost <= 500) {
            costDistribution['301-500元']++;
        } else {
            costDistribution['500元以上']++;
        }
    });
    
    // 计算平均费用
    const labels = [];
    const averageCosts = [];
    
    for (const item in repairItemCosts) {
        labels.push(item);
        const avg = repairItemCosts[item].count > 0 ? 
            Math.round(repairItemCosts[item].total / repairItemCosts[item].count) : 0;
        averageCosts.push(avg);
    }
    
    // 如果没有数据，添加一些默认项
    if (labels.length === 0) {
        labels.push('BMS维修', '电芯更换', '外壳维修', '电路维修', '其他');
        averageCosts.push(0, 0, 0, 0, 0);
    }

    // 维修费用统计图表
    const costCtx = document.getElementById('costChart').getContext('2d');
    new Chart(costCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '平均维修费用(元)',
                data: averageCosts,
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '各类型维修平均费用'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '费用(元)'
                    }
                }
            }
        }
    });

    // 维修费用分布图表
    const costDistributionValues = Object.values(costDistribution);
    
    // 如果没有任何费用数据，提供默认数值
    const finalDistributionValues = costDistributionValues.every(value => value === 0) ?
        [1, 1, 1, 1, 1] : costDistributionValues;
    
    const costDistributionCtx = document.getElementById('costDistributionChart').getContext('2d');
    new Chart(costDistributionCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(costDistribution),
            datasets: [{
                data: finalDistributionValues,
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgba(13, 110, 253, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '维修费用区间分布'
                }
            }
        }
    });
    
    // 创建每月维修费用统计图表
    createMonthlyCostChart(monthlyCosts);
}

// 创建每月维修费用统计图表
function createMonthlyCostChart(monthlyCosts) {
    // 提取月份，按时间排序
    let months = Object.keys(monthlyCosts);
    months.sort(); // 按年月排序
    
    // 如果没有数据，添加示例数据
    if (months.length === 0) {
        // 创建最近6个月的示例数据
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;
            const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
            
            months.push(yearMonth);
            monthlyCosts[yearMonth] = {
                repair: Math.floor(Math.random() * 1000) + 500,
                shipping: Math.floor(Math.random() * 500) + 200,
                labor: Math.floor(Math.random() * 300) + 100,
                count: Math.floor(Math.random() * 10) + 5
            };
        }
        
        // 重新排序
        months.sort();
    }
    
    // 准备图表数据
    const labels = months.map(month => {
        // 转换为更友好的显示格式 "2023-01" => "2023年1月"
        const [year, monthNum] = month.split('-');
        return `${year}年${parseInt(monthNum)}月`;
    });
    
    const repairData = months.map(month => monthlyCosts[month].repair);
    const shippingData = months.map(month => monthlyCosts[month].shipping);
    const laborData = months.map(month => monthlyCosts[month].labor);
    const totalData = months.map(month => {
        const monthData = monthlyCosts[month];
        return monthData.repair + monthData.shipping + monthData.labor;
    });
    
    // 创建图表
    const monthlyCostCtx = document.getElementById('monthlyCostChart').getContext('2d');
    new Chart(monthlyCostCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '维修费用',
                    data: repairData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: '运费',
                    data: shippingData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: '维修工时费',
                    data: laborData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: '总费用',
                    data: totalData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '每月维修费用趋势'
                },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        footer: function(tooltipItems) {
                            // 计算所有数据集在此索引处的总和
                            let sum = tooltipItems.reduce((total, tooltipItem) => {
                                return total + tooltipItem.parsed.y;
                            }, 0);
                            return `总计: ¥${sum.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '费用(元)'
                    }
                }
            }
        }
    });
    
    // 填充月度费用明细表
    const monthlyTableBody = document.getElementById('monthlyCostTable');
    monthlyTableBody.innerHTML = '';
    
    let totalMonthlyCosts = {
        repair: 0,
        shipping: 0,
        labor: 0,
        total: 0,
        count: 0
    };
    
    // 添加每个月份的行
    months.forEach((month, index) => {
        const monthData = monthlyCosts[month];
        const total = monthData.repair + monthData.shipping + monthData.labor;
        const avgCost = monthData.count > 0 ? total / monthData.count : 0;
        
        // 累加总计
        totalMonthlyCosts.repair += monthData.repair;
        totalMonthlyCosts.shipping += monthData.shipping;
        totalMonthlyCosts.labor += monthData.labor;
        totalMonthlyCosts.total += total;
        totalMonthlyCosts.count += monthData.count;
        
        const row = document.createElement('tr');
        
        // 月份
        const monthCell = document.createElement('td');
        monthCell.textContent = labels[index];
        row.appendChild(monthCell);
        
        // 维修费用
        const repairCell = document.createElement('td');
        repairCell.textContent = `¥${monthData.repair.toFixed(2)}`;
        row.appendChild(repairCell);
        
        // 运费
        const shippingCell = document.createElement('td');
        shippingCell.textContent = `¥${monthData.shipping.toFixed(2)}`;
        row.appendChild(shippingCell);
        
        // 维修工时费
        const laborCell = document.createElement('td');
        laborCell.textContent = `¥${monthData.labor.toFixed(2)}`;
        row.appendChild(laborCell);
        
        // 总费用
        const totalCell = document.createElement('td');
        totalCell.textContent = `¥${total.toFixed(2)}`;
        row.appendChild(totalCell);
        
        // 维修数量
        const countCell = document.createElement('td');
        countCell.textContent = monthData.count;
        row.appendChild(countCell);
        
        // 平均费用
        const avgCell = document.createElement('td');
        avgCell.textContent = `¥${avgCost.toFixed(2)}`;
        row.appendChild(avgCell);
        
        monthlyTableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 维修费用总计
    const totalRepairCell = document.createElement('td');
    totalRepairCell.textContent = `¥${totalMonthlyCosts.repair.toFixed(2)}`;
    totalRepairCell.classList.add('fw-bold');
    totalRow.appendChild(totalRepairCell);
    
    // 运费总计
    const totalShippingCell = document.createElement('td');
    totalShippingCell.textContent = `¥${totalMonthlyCosts.shipping.toFixed(2)}`;
    totalShippingCell.classList.add('fw-bold');
    totalRow.appendChild(totalShippingCell);
    
    // 维修工时费总计
    const totalLaborCell = document.createElement('td');
    totalLaborCell.textContent = `¥${totalMonthlyCosts.labor.toFixed(2)}`;
    totalLaborCell.classList.add('fw-bold');
    totalRow.appendChild(totalLaborCell);
    
    // 总费用总计
    const totalTotalCell = document.createElement('td');
    totalTotalCell.textContent = `¥${totalMonthlyCosts.total.toFixed(2)}`;
    totalTotalCell.classList.add('fw-bold');
    totalRow.appendChild(totalTotalCell);
    
    // 维修数量总计
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalMonthlyCosts.count;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 平均费用总计
    const totalAvgCell = document.createElement('td');
    const totalAvg = totalMonthlyCosts.count > 0 ? totalMonthlyCosts.total / totalMonthlyCosts.count : 0;
    totalAvgCell.textContent = `¥${totalAvg.toFixed(2)}`;
    totalAvgCell.classList.add('fw-bold');
    totalRow.appendChild(totalAvgCell);
    
    monthlyTableBody.appendChild(totalRow);
}

// 原因统计
function createReasonChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 统计不同电池型号和返厂原因的组合
    const modelReasonMap = {};
    const reasonCounts = {};
    
    records.forEach(record => {
        const reason = record.returnReason || '未知原因';
        const model = record.batteryModel || '其他';
        
        // 统计每种原因的总数
        if (!reasonCounts[reason]) {
            reasonCounts[reason] = 1;
        } else {
            reasonCounts[reason]++;
        }
        
        // 统计每种原因与型号的组合
        if (!modelReasonMap[reason]) {
            modelReasonMap[reason] = {
                'K174': 0,
                'K175': 0,
                'K179': 0,
                '其他': 0
            };
        }
        
        // 增加对应型号的计数
        if (model === 'K174' || model === 'K175' || model === 'K179') {
            modelReasonMap[reason][model]++;
        } else {
            modelReasonMap[reason]['其他']++;
        }
    });
    
    // 转换为数组并按总数排序，获取前5个故障原因
    let reasonEntries = Object.entries(reasonCounts);
    reasonEntries.sort((a, b) => b[1] - a[1]); // 按数量降序排序
    const top5Reasons = reasonEntries.slice(0, 5);
    
    // 如果没有足够的数据，添加默认项
    if (top5Reasons.length === 0) {
        top5Reasons.push(
            ['螺钉掉落', 0],
            ['电池漏液', 0],
            ['电池不识别', 0],
            ['电池压差', 0],
            ['其他原因', 0]
        );
        
        modelReasonMap['螺钉掉落'] = {'K174': 0, 'K175': 0, 'K179': 0, '其他': 0};
        modelReasonMap['电池漏液'] = {'K174': 0, 'K175': 0, 'K179': 0, '其他': 0};
        modelReasonMap['电池不识别'] = {'K174': 0, 'K175': 0, 'K179': 0, '其他': 0};
        modelReasonMap['电池压差'] = {'K174': 0, 'K175': 0, 'K179': 0, '其他': 0};
        modelReasonMap['其他原因'] = {'K174': 0, 'K175': 0, 'K179': 0, '其他': 0};
    }
    
    // 计算总数
    let totalCount = top5Reasons.reduce((sum, entry) => sum + entry[1], 0);
    document.getElementById('totalReasonCount').textContent = `总计: ${totalCount}`;
    
    // 准备图表数据
    const reasonLabels = top5Reasons.map(entry => entry[0]);
    
    // 创建分组柱状图数据
    const k174Data = reasonLabels.map(reason => modelReasonMap[reason]['K174']);
    const k175Data = reasonLabels.map(reason => modelReasonMap[reason]['K175']);
    const k179Data = reasonLabels.map(reason => modelReasonMap[reason]['K179']);
    const otherData = reasonLabels.map(reason => modelReasonMap[reason]['其他']);
    
    // 创建分组柱状图
    const reasonModelCtx = document.getElementById('reasonModelChart').getContext('2d');
    const reasonModelChart = new Chart(reasonModelCtx, {
        type: 'bar',
        data: {
            labels: reasonLabels,
            datasets: [
                {
                    label: 'K174',
                    data: k174Data,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'K175',
                    data: k175Data,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'K179',
                    data: k179Data,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: '其他',
                    data: otherData,
                    backgroundColor: 'rgba(255, 159, 64, 0.7)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '返厂原因'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '电池数量'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'TOP5返厂原因及对应电池型号分布'
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const reason = context[0].label;
                            const total = top5Reasons.find(r => r[0] === reason)[1];
                            return `总计: ${total}`;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'custom-labels',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                
                // 为每组柱状图添加总计标签
                for (let i = 0; i < reasonLabels.length; i++) {
                    const reason = reasonLabels[i];
                    const meta = chart.getDatasetMeta(0); // 获取第一个数据集的元数据
                    const xPos = meta.data[i].x;
                    const total = top5Reasons.find(r => r[0] === reason)[1];
                    
                    // 绘制总计标签
                    if (total > 0) {
                        const yPos = meta.data[i].y - 15; // 在组的上方显示
                        ctx.fillText(`总计: ${total}`, xPos, yPos);
                    }
                }
                ctx.restore();
            }
        }]
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('reasonModelTable');
    tableBody.innerHTML = '';
    
    // 添加每个原因的行
    reasonLabels.forEach(reason => {
        const row = document.createElement('tr');
        
        // 原因名称
        const reasonCell = document.createElement('td');
        reasonCell.textContent = reason;
        row.appendChild(reasonCell);
        
        // K174数量
        const k174Cell = document.createElement('td');
        k174Cell.textContent = modelReasonMap[reason]['K174'];
        row.appendChild(k174Cell);
        
        // K175数量
        const k175Cell = document.createElement('td');
        k175Cell.textContent = modelReasonMap[reason]['K175'];
        row.appendChild(k175Cell);
        
        // K179数量
        const k179Cell = document.createElement('td');
        k179Cell.textContent = modelReasonMap[reason]['K179'];
        row.appendChild(k179Cell);
        
        // 其他数量
        const otherCell = document.createElement('td');
        otherCell.textContent = modelReasonMap[reason]['其他'];
        row.appendChild(otherCell);
        
        // 总计
        const totalCell = document.createElement('td');
        const total = modelReasonMap[reason]['K174'] + 
                      modelReasonMap[reason]['K175'] + 
                      modelReasonMap[reason]['K179'] + 
                      modelReasonMap[reason]['其他'];
        totalCell.textContent = total;
        totalCell.classList.add('fw-bold');
        row.appendChild(totalCell);
        
        tableBody.appendChild(row);
    });

    // 原有的故障原因分布图表（保留）
    const reasonData = reasonEntries.map(entry => entry[1]);
    const reasonLabelsAll = reasonEntries.map(entry => entry[0]);
    
    // 如果没有足够的数据，添加默认项
    if (reasonLabelsAll.length === 0) {
        reasonLabelsAll.push('高低温报警', '漏胶', '上壳镭雕错误', '电池不识别', '其他原因');
        reasonData.push(0, 0, 0, 0, 0);
    } else if (reasonLabelsAll.length > 7) {
        // 如果原因太多，只保留前6个，其他归为"其他"
        const topReasons = reasonLabelsAll.slice(0, 6);
        const topData = reasonData.slice(0, 6);
        const otherCount = reasonData.slice(6).reduce((sum, val) => sum + val, 0);
        
        reasonLabelsAll.length = 0;
        reasonData.length = 0;
        
        reasonLabelsAll.push(...topReasons, '其他原因');
        reasonData.push(...topData, otherCount);
    }

    const reasonCtx = document.getElementById('reasonChart').getContext('2d');
    new Chart(reasonCtx, {
        type: 'bar',
        data: {
            labels: reasonLabelsAll,
            datasets: [{
                label: '故障数量',
                data: reasonData,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '故障原因分布'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 维修状态分布
function createStatusCharts() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 按电池型号和维修状态统计
    const modelStatusMap = {
        'K174': {'待维修': 0, '维修中': 0, '已维修': 0, '无法维修': 0, 'total': 0},
        'K175': {'待维修': 0, '维修中': 0, '已维修': 0, '无法维修': 0, 'total': 0},
        'K179': {'待维修': 0, '维修中': 0, '已维修': 0, '无法维修': 0, 'total': 0},
        '其他': {'待维修': 0, '维修中': 0, '已维修': 0, '无法维修': 0, 'total': 0}
    };
    
    // 统计不同维修状态的数量
    const statusCounts = {
        '已维修': 0,
        '维修中': 0, 
        '待维修': 0,
        '无法维修': 0
    };
    
    let totalCount = 0;
    
    records.forEach(record => {
        const status = record.repairStatus || '待维修';
        const model = record.batteryModel || '其他';
        
        // 增加对应状态的计数
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
            totalCount++;
        }
        
        // 按电池型号和状态进行分类统计
        let modelCategory = '其他';
        if (model === 'K174' || model === 'K175' || model === 'K179') {
            modelCategory = model;
        }
        
        if (modelStatusMap[modelCategory] && 
            modelStatusMap[modelCategory].hasOwnProperty(status)) {
            modelStatusMap[modelCategory][status]++;
            modelStatusMap[modelCategory]['total']++;
        }
    });
    
    // 更新总计数量
    document.getElementById('totalStatusCount').textContent = `总计: ${totalCount}`;
    
    // 准备图表数据
    const models = Object.keys(modelStatusMap);
    const waitingData = models.map(model => modelStatusMap[model]['待维修']);
    const inProgressData = models.map(model => modelStatusMap[model]['维修中']);
    const completedData = models.map(model => modelStatusMap[model]['已维修']);
    const impossibleData = models.map(model => modelStatusMap[model]['无法维修']);
    
    // 创建分组柱状图
    const statusModelCtx = document.getElementById('statusModelChart').getContext('2d');
    new Chart(statusModelCtx, {
        type: 'bar',
        data: {
            labels: models,
            datasets: [
                {
                    label: '待维修',
                    data: waitingData,
                    backgroundColor: 'rgba(108, 117, 125, 0.7)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderWidth: 1
                },
                {
                    label: '维修中',
                    data: inProgressData,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                },
                {
                    label: '已维修',
                    data: completedData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: '无法维修',
                    data: impossibleData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '电池型号'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '电池数量'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '各型号电池维修状态分布'
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const model = context[0].label;
                            const total = modelStatusMap[model]['total'];
                            return `总计: ${total}`;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'custom-status-labels',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                
                // 为每组柱状图添加总计标签
                for (let i = 0; i < models.length; i++) {
                    const model = models[i];
                    const meta = chart.getDatasetMeta(0); // 获取第一个数据集的元数据
                    const xPos = meta.data[i].x;
                    const total = modelStatusMap[model]['total'];
                    
                    // 绘制总计标签
                    if (total > 0) {
                        const yPos = chart.scales.y.getPixelForValue(
                            waitingData[i] + inProgressData[i] + completedData[i] + impossibleData[i] + 5
                        );
                        ctx.fillText(`${total}`, xPos, yPos);
                    }
                }
                ctx.restore();
            }
        }]
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('statusModelTable');
    tableBody.innerHTML = '';
    
    // 添加每个电池型号的行
    models.forEach(model => {
        const row = document.createElement('tr');
        
        // 电池型号
        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        row.appendChild(modelCell);
        
        // 待维修
        const waitingCell = document.createElement('td');
        waitingCell.textContent = modelStatusMap[model]['待维修'];
        row.appendChild(waitingCell);
        
        // 维修中
        const inProgressCell = document.createElement('td');
        inProgressCell.textContent = modelStatusMap[model]['维修中'];
        row.appendChild(inProgressCell);
        
        // 已维修
        const completedCell = document.createElement('td');
        completedCell.textContent = modelStatusMap[model]['已维修'];
        row.appendChild(completedCell);
        
        // 无法维修
        const impossibleCell = document.createElement('td');
        impossibleCell.textContent = modelStatusMap[model]['无法维修'];
        row.appendChild(impossibleCell);
        
        // 总计
        const totalCell = document.createElement('td');
        totalCell.textContent = modelStatusMap[model]['total'];
        totalCell.classList.add('fw-bold');
        row.appendChild(totalCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 添加各状态总计
    const waitingTotal = Object.values(modelStatusMap).reduce((sum, val) => sum + val['待维修'], 0);
    const inProgressTotal = Object.values(modelStatusMap).reduce((sum, val) => sum + val['维修中'], 0);
    const completedTotal = Object.values(modelStatusMap).reduce((sum, val) => sum + val['已维修'], 0);
    const impossibleTotal = Object.values(modelStatusMap).reduce((sum, val) => sum + val['无法维修'], 0);
    const grandTotal = waitingTotal + inProgressTotal + completedTotal + impossibleTotal;
    
    // 待维修总计
    const waitingTotalCell = document.createElement('td');
    waitingTotalCell.textContent = waitingTotal;
    waitingTotalCell.classList.add('fw-bold');
    totalRow.appendChild(waitingTotalCell);
    
    // 维修中总计
    const inProgressTotalCell = document.createElement('td');
    inProgressTotalCell.textContent = inProgressTotal;
    inProgressTotalCell.classList.add('fw-bold');
    totalRow.appendChild(inProgressTotalCell);
    
    // 已维修总计
    const completedTotalCell = document.createElement('td');
    completedTotalCell.textContent = completedTotal;
    completedTotalCell.classList.add('fw-bold');
    totalRow.appendChild(completedTotalCell);
    
    // 无法维修总计
    const impossibleTotalCell = document.createElement('td');
    impossibleTotalCell.textContent = impossibleTotal;
    impossibleTotalCell.classList.add('fw-bold');
    totalRow.appendChild(impossibleTotalCell);
    
    // 总计总计
    const grandTotalCell = document.createElement('td');
    grandTotalCell.textContent = grandTotal;
    grandTotalCell.classList.add('fw-bold');
    totalRow.appendChild(grandTotalCell);
    
    tableBody.appendChild(totalRow);

    // 原有的维修状态分布图
    // 准备图表数据
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    
    // 确保即使没有数据时，图表也不为空
    const finalStatusData = statusData.every(value => value === 0) ? 
        [1, 1, 1, 1] : statusData;

    // 维修状态分布图
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: statusLabels,
            datasets: [{
                data: finalStatusData,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(108, 117, 125, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(108, 117, 125, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '维修状态分布'
                }
            }
        }
    });

    // 状态趋势变化图（保持不变）
    const statusTrendCtx = document.getElementById('statusTrendChart').getContext('2d');
    new Chart(statusTrendCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [
                {
                    label: '已维修',
                    data: [5, 8, 12, 6, 8, 3],
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.3
                },
                {
                    label: '维修中',
                    data: [2, 1, 3, 1, 0, 1],
                    borderColor: 'rgba(255, 193, 7, 1)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.3
                },
                {
                    label: '无法维修',
                    data: [1, 2, 0, 1, 1, 1],
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '各状态维修数量趋势'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '维修数量'
                    }
                }
            }
        }
    });
}

// 客退地区统计
function createAreaChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 按地区和电池型号统计
    const areaModelMap = {};
    const areaCounts = {};
    let totalCount = 0;
    
    records.forEach(record => {
        const area = record.customerArea || '未知地区';
        const model = record.batteryModel || '其他';
        
        // 累计地区总数
        if (!areaCounts[area]) {
            areaCounts[area] = 1;
            areaModelMap[area] = {
                'K174': 0,
                'K175': 0,
                'K179': 0,
                '其他': 0
            };
        } else {
            areaCounts[area]++;
        }
        
        // 按电池型号分类统计
        if (model === 'K174' || model === 'K175' || model === 'K179') {
            areaModelMap[area][model]++;
        } else {
            areaModelMap[area]['其他']++;
        }
        
        totalCount++;
    });
    
    // 更新总计数
    document.getElementById('totalAreaCount').textContent = `总计: ${totalCount}台`;
    
    // 排序获取前15个地区
    let areaEntries = Object.entries(areaCounts);
    areaEntries.sort((a, b) => b[1] - a[1]); // 按数量降序排序
    const top15Areas = areaEntries.slice(0, 15).map(entry => entry[0]);
    
    // 如果没有数据，添加默认地区
    if (top15Areas.length === 0) {
        top15Areas.push('合肥', '上海', '北京', '广州', '深圳', '杭州', '南京', '武汉', '成都', '其他');
        
        top15Areas.forEach(area => {
            areaCounts[area] = 0;
            areaModelMap[area] = {
                'K174': 0,
                'K175': 0,
                'K179': 0,
                '其他': 0
            };
        });
    }
    
    // 准备图表数据
    const k174Data = [];
    const k175Data = [];
    const k179Data = [];
    const otherData = [];
    const totalData = [];
    
    top15Areas.forEach(area => {
        k174Data.push(areaModelMap[area]['K174']);
        k175Data.push(areaModelMap[area]['K175']);
        k179Data.push(areaModelMap[area]['K179']);
        otherData.push(areaModelMap[area]['其他']);
        totalData.push(areaCounts[area]);
    });
    
    // 创建客退地区电池型号分布图
    const areaModelCtx = document.getElementById('areaModelChart').getContext('2d');
    new Chart(areaModelCtx, {
        type: 'bar',
        data: {
            labels: top15Areas,
            datasets: [
                {
                    label: 'K174',
                    data: k174Data,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'K175',
                    data: k175Data,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'K179',
                    data: k179Data,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: '其他',
                    data: otherData,
                    backgroundColor: 'rgba(255, 159, 64, 0.7)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: '客退地区'
                    }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '电池数量'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '客退地区电池型号分布'
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const area = context[0].label;
                            const total = areaCounts[area];
                            return `总计: ${total}`;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'custom-area-labels',
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.save();
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#000';
                
                // 为每组柱状图添加总计标签
                for (let i = 0; i < top15Areas.length; i++) {
                    const area = top15Areas[i];
                    const meta = chart.getDatasetMeta(0); // 获取第一个数据集的元数据
                    if (meta.data[i]) {
                        const xPos = meta.data[i].x;
                        const total = areaCounts[area];
                        const percent = (total / totalCount * 100).toFixed(1);
                        
                        // 绘制总计标签
                        if (total > 0) {
                            const yOffset = 15;
                            const yPos = chart.scales.y.getPixelForValue(
                                Math.max(
                                    k174Data[i] + k175Data[i] + k179Data[i] + otherData[i],
                                    chart.scales.y.max * 0.05
                                )
                            ) - yOffset;
                            
                            ctx.fillText(`总计: ${total}`, xPos, yPos);
                            ctx.fillText(`(${percent}%)`, xPos, yPos + 15);
                        }
                    }
                }
                ctx.restore();
            }
        }]
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('areaModelTable');
    tableBody.innerHTML = '';
    
    // 添加每个地区的行
    let grandTotals = {
        'K174': 0,
        'K175': 0,
        'K179': 0,
        '其他': 0,
        'total': 0
    };
    
    top15Areas.forEach(area => {
        const row = document.createElement('tr');
        
        // 地区名称
        const areaCell = document.createElement('td');
        areaCell.textContent = area;
        row.appendChild(areaCell);
        
        // K174数量
        const k174Count = areaModelMap[area]['K174'];
        const k174Cell = document.createElement('td');
        k174Cell.textContent = k174Count;
        row.appendChild(k174Cell);
        grandTotals['K174'] += k174Count;
        
        // K175数量
        const k175Count = areaModelMap[area]['K175'];
        const k175Cell = document.createElement('td');
        k175Cell.textContent = k175Count;
        row.appendChild(k175Cell);
        grandTotals['K175'] += k175Count;
        
        // K179数量
        const k179Count = areaModelMap[area]['K179'];
        const k179Cell = document.createElement('td');
        k179Cell.textContent = k179Count;
        row.appendChild(k179Cell);
        grandTotals['K179'] += k179Count;
        
        // 其他数量
        const otherCount = areaModelMap[area]['其他'];
        const otherCell = document.createElement('td');
        otherCell.textContent = otherCount;
        row.appendChild(otherCell);
        grandTotals['其他'] += otherCount;
        
        // 总计
        const total = areaCounts[area];
        const totalCell = document.createElement('td');
        totalCell.textContent = total;
        totalCell.classList.add('fw-bold');
        row.appendChild(totalCell);
        grandTotals['total'] += total;
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = (total / totalCount * 100).toFixed(1);
        percentCell.textContent = percent + '%';
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 添加各型号总计
    const k174TotalCell = document.createElement('td');
    k174TotalCell.textContent = grandTotals['K174'];
    k174TotalCell.classList.add('fw-bold');
    totalRow.appendChild(k174TotalCell);
    
    const k175TotalCell = document.createElement('td');
    k175TotalCell.textContent = grandTotals['K175'];
    k175TotalCell.classList.add('fw-bold');
    totalRow.appendChild(k175TotalCell);
    
    const k179TotalCell = document.createElement('td');
    k179TotalCell.textContent = grandTotals['K179'];
    k179TotalCell.classList.add('fw-bold');
    totalRow.appendChild(k179TotalCell);
    
    const otherTotalCell = document.createElement('td');
    otherTotalCell.textContent = grandTotals['其他'];
    otherTotalCell.classList.add('fw-bold');
    totalRow.appendChild(otherTotalCell);
    
    // 总计总计
    const grandTotalCell = document.createElement('td');
    grandTotalCell.textContent = grandTotals['total'];
    grandTotalCell.classList.add('fw-bold');
    totalRow.appendChild(grandTotalCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);
    
    // 原有的客退地区分布图表
    const areaCtx = document.getElementById('areaChart').getContext('2d');
    new Chart(areaCtx, {
        type: 'bar',
        data: {
            labels: top15Areas,
            datasets: [{
                label: '客退数量',
                data: top15Areas.map(area => areaCounts[area]),
                backgroundColor: 'rgba(23, 162, 184, 0.7)',
                borderColor: 'rgba(23, 162, 184, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '客退地区分布'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '客退数量'
                    }
                }
            }
        }
    });
}

// 快递运费统计
function createShippingCharts() {
    // 快递公司运费对比
    const shippingCompanyCtx = document.getElementById('shippingCompanyChart').getContext('2d');
    new Chart(shippingCompanyCtx, {
        type: 'bar',
        data: {
            labels: ['跨越', '顺丰', '中通', '圆通', '韵达'],
            datasets: [{
                label: '平均运费(元)',
                data: [15, 25, 12, 10, 11],
                backgroundColor: 'rgba(102, 16, 242, 0.7)',
                borderColor: 'rgba(102, 16, 242, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '各快递公司平均运费'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '运费(元)'
                    }
                }
            }
        }
    });

    // 月度运费趋势
    const shippingTrendCtx = document.getElementById('shippingTrendChart').getContext('2d');
    new Chart(shippingTrendCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '总运费(元)',
                data: [150, 180, 240, 120, 200, 160],
                borderColor: 'rgba(102, 16, 242, 1)',
                backgroundColor: 'rgba(102, 16, 242, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '月度总运费趋势'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '运费(元)'
                    }
                }
            }
        }
    });
}

// 责任归属统计
function createResponsibilityChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 统计不同责任归属的数量
    const responsibilityCounts = {};
    let totalCount = 0;
    
    records.forEach(record => {
        const responsibility = record.responsibility || '未确定';
        if (!responsibilityCounts[responsibility]) {
            responsibilityCounts[responsibility] = 1;
        } else {
            responsibilityCounts[responsibility]++;
        }
        totalCount++;
    });
    
    // 更新总计数
    document.getElementById('totalResponsibilityCount').textContent = `总计: ${totalCount}`;
    
    // 准备图表数据
    let responsibilityEntries = Object.entries(responsibilityCounts);
    
    // 按数量降序排序
    responsibilityEntries.sort((a, b) => b[1] - a[1]);
    
    // 确保有数据显示
    if (responsibilityEntries.length === 0) {
        responsibilityEntries = [
            ['日升质', 0],
            ['菲尼基', 0],
            ['用户', 0],
            ['立方', 0],
            ['未确定', 0]
        ];
    }
    
    const responsibilityLabels = responsibilityEntries.map(entry => entry[0]);
    const responsibilityData = responsibilityEntries.map(entry => entry[1]);
    
    // 获取颜色
    const backgroundColor = [
        'rgba(13, 110, 253, 0.7)',  // 蓝色
        'rgba(102, 16, 242, 0.7)',   // 紫色
        'rgba(253, 126, 20, 0.7)',   // 橙色
        'rgba(40, 167, 69, 0.7)',    // 绿色
        'rgba(220, 53, 69, 0.7)',    // 红色
        'rgba(108, 117, 125, 0.7)'   // 灰色
    ];
    
    const borderColor = [
        'rgba(13, 110, 253, 1)',
        'rgba(102, 16, 242, 1)',
        'rgba(253, 126, 20, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(220, 53, 69, 1)',
        'rgba(108, 117, 125, 1)'
    ];
    
    // 裁剪颜色数组以匹配数据长度
    const bgColors = backgroundColor.slice(0, responsibilityLabels.length);
    const bdColors = borderColor.slice(0, responsibilityLabels.length);

    const responsibilityCtx = document.getElementById('responsibilityChart').getContext('2d');
    new Chart(responsibilityCtx, {
        type: 'bar',  // 改为柱状图
        data: {
            labels: responsibilityLabels,
            datasets: [{
                label: '数量',
                data: responsibilityData,
                backgroundColor: bgColors,
                borderColor: bdColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '责任归属分布'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = totalCount > 0 ? (value / totalCount * 100).toFixed(1) : 0;
                            return `${value} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量'
                    }
                }
            }
        }
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('responsibilityTable');
    tableBody.innerHTML = '';
    
    // 添加每个责任归属的行
    responsibilityEntries.forEach(entry => {
        const [responsibility, count] = entry;
        const row = document.createElement('tr');
        
        // 责任归属
        const responsibilityCell = document.createElement('td');
        responsibilityCell.textContent = responsibility;
        row.appendChild(responsibilityCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = totalCount > 0 ? (count / totalCount * 100).toFixed(1) : 0;
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);
}

// 用户责任统计
function createUserResponsibilityChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 用户责任故障类型数据
    const userDataLabels = ['使用不当', '外力损坏', '私自拆卸', '过度充电', '其他'];
    const userDataValues = [40, 25, 15, 12, 8];
    const totalCount = userDataValues.reduce((sum, val) => sum + val, 0);
    
    // 更新总计数
    document.getElementById('totalUserCount').textContent = `总计: ${totalCount}`;
    
    // 颜色设置
    const backgroundColor = [
        'rgba(220, 53, 69, 0.7)',   // 红色
        'rgba(255, 193, 7, 0.7)',   // 黄色
        'rgba(40, 167, 69, 0.7)',   // 绿色
        'rgba(13, 110, 253, 0.7)',  // 蓝色
        'rgba(108, 117, 125, 0.7)'  // 灰色
    ];
    
    const borderColor = [
        'rgba(220, 53, 69, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(13, 110, 253, 1)',
        'rgba(108, 117, 125, 1)'
    ];
    
    // 创建柱状图
    const userCtx = document.getElementById('userResponsibilityChart').getContext('2d');
    new Chart(userCtx, {
        type: 'bar',  // 改为柱状图
        data: {
            labels: userDataLabels,
            datasets: [{
                label: '故障数量',
                data: userDataValues,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '用户责任故障类型分布'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = (value / totalCount * 100).toFixed(1);
                            return `${value} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量'
                    }
                }
            }
        }
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('userResponsibilityTable');
    tableBody.innerHTML = '';
    
    // 添加每个故障类型的行
    userDataLabels.forEach((label, index) => {
        const count = userDataValues[index];
        const row = document.createElement('tr');
        
        // 故障类型
        const typeCell = document.createElement('td');
        typeCell.textContent = label;
        row.appendChild(typeCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = (count / totalCount * 100).toFixed(1);
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);

    // 添加日升质责任统计
    createSpecificResponsibilityChart('rishenCause', '日升质责任统计', [
        '品质问题', '设计缺陷', '工艺不良', '材料问题', '其他'
    ], [28, 20, 15, 12, 5]);

    // 添加立方责任统计
    createSpecificResponsibilityChart('lifangCause', '立方责任统计', [
        'BMS故障', '连接器问题', '生产缺陷', '测试不良', '其他'
    ], [22, 18, 14, 10, 6]);

    // 添加菲尼基责任统计
    createSpecificResponsibilityChart('feinijyCause', '菲尼基责任统计', [
        '电芯问题', '密封不良', '正负极故障', '绝缘性能', '其他'
    ], [25, 19, 16, 12, 8]);
}

// 责任分类统计
function createResponsibilityClassificationChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 各责任分类故障类型数据
    const responsibilityData = {
        '用户责任': {
            labels: ['使用不当', '外力损坏', '私自拆卸', '过度充电', '其他'],
            values: [40, 25, 15, 12, 8],
            color: 'rgba(253, 126, 20, 0.7)',    // 橙色
            borderColor: 'rgba(253, 126, 20, 1)'
        },
        '日升质责任': {
            labels: ['品质问题', '设计缺陷', '工艺不良', '材料问题', '其他'],
            values: [28, 20, 15, 12, 5],
            color: 'rgba(13, 110, 253, 0.7)',   // 蓝色
            borderColor: 'rgba(13, 110, 253, 1)'
        },
        '立方责任': {
            labels: ['BMS故障', '连接器问题', '生产缺陷', '测试不良', '其他'],
            values: [22, 18, 14, 10, 6],
            color: 'rgba(40, 167, 69, 0.7)',    // 绿色
            borderColor: 'rgba(40, 167, 69, 1)'
        },
        '菲尼基责任': {
            labels: ['电芯问题', '密封不良', '正负极故障', '绝缘性能', '其他'],
            values: [25, 19, 16, 12, 8],
            color: 'rgba(111, 66, 193, 0.7)',   // 紫色
            borderColor: 'rgba(111, 66, 193, 1)'
        }
    };
    
    // 计算总数
    let totalResponsibilityCount = 0;
    Object.values(responsibilityData).forEach(data => {
        totalResponsibilityCount += data.values.reduce((sum, val) => sum + val, 0);
    });
    
    // 更新总计数
    document.getElementById('totalUserCount').textContent = `总计: ${totalResponsibilityCount}`;
    
    // 创建责任分类比例饼图
    createResponsibilityPieChart(responsibilityData, totalResponsibilityCount);
    
    // 为每个责任分类创建详细统计
    Object.entries(responsibilityData).forEach(([category, data]) => {
        createResponsibilityCategoryChart(category, data);
    });
}

// 创建责任分类比例饼图
function createResponsibilityPieChart(responsibilityData, totalCount) {
    // 准备饼图数据
    const labels = Object.keys(responsibilityData);
    const values = labels.map(label => 
        responsibilityData[label].values.reduce((sum, val) => sum + val, 0)
    );
    const backgroundColor = labels.map(label => responsibilityData[label].color);
    const borderColor = labels.map(label => responsibilityData[label].borderColor);
    
    // 创建饼图
    const userCtx = document.getElementById('userResponsibilityChart').getContext('2d');
    new Chart(userCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '责任分类占比'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = (value / totalCount * 100).toFixed(1);
                            return `${context.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // 填充表格数据
    const tableBody = document.getElementById('userResponsibilityTable');
    tableBody.innerHTML = '';
    
    // 添加每个责任分类的行
    labels.forEach((label, index) => {
        const count = values[index];
        const row = document.createElement('tr');
        
        // 责任分类
        const typeCell = document.createElement('td');
        typeCell.textContent = label;
        row.appendChild(typeCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = (count / totalCount * 100).toFixed(1);
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);
}

// 创建责任分类详细统计
function createResponsibilityCategoryChart(category, data) {
    // 将id格式化为有效的HTML id
    const formattedId = category.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    const elementId = formattedId + 'Cause';
    
    // 创建容器
    let chartContainer = document.getElementById(elementId + 'ChartContainer');
    if (!chartContainer) {
        // 创建图表容器
        chartContainer = document.createElement('div');
        chartContainer.id = elementId + 'ChartContainer';
        chartContainer.className = 'row mt-4';
        
        chartContainer.innerHTML = `
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        ${category}统计
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <canvas id="${elementId}Chart" height="250"></canvas>
                            </div>
                            <div class="col-md-6">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>故障类型</th>
                                                <th>数量</th>
                                                <th>百分比</th>
                                            </tr>
                                        </thead>
                                        <tbody id="${elementId}Table">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 将容器添加到用户责任tab内容区域
        const userTab = document.getElementById('user');
        userTab.appendChild(chartContainer);
    }

    const totalCount = data.values.reduce((sum, val) => sum + val, 0);
    
    // 创建图表
    const ctx = document.getElementById(elementId + 'Chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: Array(data.labels.length).fill(data.color),
                borderColor: Array(data.labels.length).fill(data.borderColor),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${category}故障类型分布`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = (value / totalCount * 100).toFixed(1);
                            return `${context.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    // 填充表格
    const tableBody = document.getElementById(elementId + 'Table');
    tableBody.innerHTML = '';
    
    // 添加每个故障类型的行
    data.labels.forEach((label, index) => {
        const count = data.values[index];
        const row = document.createElement('tr');
        
        // 故障类型
        const typeCell = document.createElement('td');
        typeCell.textContent = label;
        row.appendChild(typeCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = (count / totalCount * 100).toFixed(1);
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);
}

// 创建指定责任方的统计图表
function createSpecificResponsibilityChart(elementId, title, labels, values) {
    // 首先创建容器
    let chartContainer = document.getElementById(elementId + 'ChartContainer');
    if (!chartContainer) {
        // 创建图表容器
        chartContainer = document.createElement('div');
        chartContainer.id = elementId + 'ChartContainer';
        chartContainer.className = 'row mt-5';
        
        chartContainer.innerHTML = `
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        ${title}
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <canvas id="${elementId}Chart" height="250"></canvas>
                            </div>
                            <div class="col-md-6">
                                <div class="table-responsive">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>故障类型</th>
                                                <th>数量</th>
                                                <th>百分比</th>
                                            </tr>
                                        </thead>
                                        <tbody id="${elementId}Table">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 将容器添加到用户责任tab内容区域
        const userTab = document.getElementById('user');
        userTab.appendChild(chartContainer);
    }

    const totalCount = values.reduce((sum, val) => sum + val, 0);
    
    // 颜色设置
    const backgroundColor = [
        'rgba(13, 110, 253, 0.7)',   // 蓝色
        'rgba(40, 167, 69, 0.7)',     // 绿色
        'rgba(255, 193, 7, 0.7)',     // 黄色
        'rgba(220, 53, 69, 0.7)',     // 红色
        'rgba(108, 117, 125, 0.7)'    // 灰色
    ];
    
    const borderColor = [
        'rgba(13, 110, 253, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(220, 53, 69, 1)',
        'rgba(108, 117, 125, 1)'
    ];

    // 创建图表
    const ctx = document.getElementById(elementId + 'Chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = (value / totalCount * 100).toFixed(1);
                            return `${context.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    // 填充表格
    const tableBody = document.getElementById(elementId + 'Table');
    tableBody.innerHTML = '';
    
    // 添加每个故障类型的行
    labels.forEach((label, index) => {
        const count = values[index];
        const row = document.createElement('tr');
        
        // 故障类型
        const typeCell = document.createElement('td');
        typeCell.textContent = label;
        row.appendChild(typeCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        const percent = (count / totalCount * 100).toFixed(1);
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    tableBody.appendChild(totalRow);
}

// 返厂原因统计
function createReturnReasonChart() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 统计返厂原因
    const returnReasonCounts = {};
    
    // 统计电池型号分布
    const modelCounts = {
        'K174': 0,
        'K175': 0,
        'K179': 0,
        '其他': 0
    };
    
    // 记录每个型号的主要返厂原因
    const modelMainReasons = {
        'K174': {},
        'K175': {},
        'K179': {},
        '其他': {}
    };
    
    // 按电池型号统计各种返厂原因
    const reasonByModelMap = {};
    
    let totalCount = 0;
    
    records.forEach(record => {
        const reason = record.returnReason || '其他';
        const model = record.batteryModel || '其他';
        
        // 累计返厂原因
        if (!returnReasonCounts[reason]) {
            returnReasonCounts[reason] = 1;
        } else {
            returnReasonCounts[reason]++;
        }
        
        // 确保reasonByModelMap中有此原因的记录
        if (!reasonByModelMap[reason]) {
            reasonByModelMap[reason] = {
                'K174': 0,
                'K175': 0,
                'K179': 0,
                '其他': 0,
                'total': 0
            };
        }
        
        // 累计电池型号
        if (model === 'K174' || model === 'K175' || model === 'K179') {
            modelCounts[model]++;
            
            // 累计该型号的返厂原因
            if (!modelMainReasons[model][reason]) {
                modelMainReasons[model][reason] = 1;
            } else {
                modelMainReasons[model][reason]++;
            }
            
            // 累计该原因对应的电池型号
            reasonByModelMap[reason][model]++;
            reasonByModelMap[reason]['total']++;
            
        } else {
            modelCounts['其他']++;
            
            // 累计其他型号的返厂原因
            if (!modelMainReasons['其他'][reason]) {
                modelMainReasons['其他'][reason] = 1;
            } else {
                modelMainReasons['其他'][reason]++;
            }
            
            // 累计该原因对应的其他电池型号
            reasonByModelMap[reason]['其他']++;
            reasonByModelMap[reason]['total']++;
        }
        
        totalCount++;
    });
    
    // 更新总计数
    document.getElementById('totalReturnReasonCount').textContent = `总计: ${totalCount}`;
    
    // 准备返厂原因图表数据
    let reasonEntries = Object.entries(returnReasonCounts);
    
    // 按数量降序排序
    reasonEntries.sort((a, b) => b[1] - a[1]);
    
    // 如果没有数据，添加默认项
    if (reasonEntries.length === 0) {
        reasonEntries = [
            ['质量问题', 0],
            ['损坏', 0],
            ['保修', 0],
            ['外观问题', 0],
            ['性能下降', 0],
            ['锁扣损坏', 0],
            ['其他', 0]
        ];
    }
    
    // 限制显示的返厂原因数量，避免图表过于拥挤
    if (reasonEntries.length > 7) {
        const top6Reasons = reasonEntries.slice(0, 6);
        const otherReasonsCount = reasonEntries.slice(6)
            .reduce((sum, entry) => sum + entry[1], 0);
        
        if (otherReasonsCount > 0) {
            top6Reasons.push(['其他原因', otherReasonsCount]);
        }
        
        reasonEntries = top6Reasons;
    }
    
    const reasonLabels = reasonEntries.map(entry => entry[0]);
    const reasonData = reasonEntries.map(entry => entry[1]);
    
    // 创建返厂原因柱状图
    const returnReasonCtx = document.getElementById('returnReasonChart').getContext('2d');
    new Chart(returnReasonCtx, {
        type: 'bar',
        data: {
            labels: reasonLabels,
            datasets: [{
                label: '数量',
                data: reasonData,
                backgroundColor: 'rgba(255, 193, 7, 0.7)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '返厂原因分布'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = totalCount > 0 ? (value / totalCount * 100).toFixed(1) : 0;
                            return `${value} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量'
                    }
                }
            }
        }
    });
    
    // 准备电池型号分布图表数据
    const modelLabels = Object.keys(modelCounts);
    const modelData = Object.values(modelCounts);
    
    // 获取电池型号的百分比数据
    const modelPercents = modelLabels.map((model, index) => {
        return totalCount > 0 ? (modelData[index] / totalCount * 100).toFixed(1) : 0;
    });
    
    // 颜色设置
    const modelColors = [
        'rgba(255, 99, 132, 0.7)',  // 红色 - K174
        'rgba(54, 162, 235, 0.7)',  // 蓝色 - K175
        'rgba(75, 192, 192, 0.7)',  // 青色 - K179
        'rgba(255, 159, 64, 0.7)'   // 橙色 - 其他
    ];
    
    const modelBorders = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    
    // 创建电池型号分布图
    const batteryModelCtx = document.getElementById('batteryModelDistributionChart').getContext('2d');
    new Chart(batteryModelCtx, {
        type: 'bar',
        data: {
            labels: modelLabels,
            datasets: [{
                label: '数量',
                data: modelData,
                backgroundColor: modelColors,
                borderColor: modelBorders,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '电池型号分布'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = modelPercents[context.dataIndex];
                            return `${value} (${percent}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量'
                    }
                }
            }
        },
        plugins: [{
            id: 'modelDataLabels',
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (!meta.hidden) {
                        meta.data.forEach((element, index) => {
                            // 显示数值
                            const value = dataset.data[index];
                            const percent = modelPercents[index];
                            
                            ctx.fillStyle = '#000';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.font = 'bold 12px Arial';
                            
                            // 计算位置
                            const position = element.getCenterPoint();
                            const x = position.x;
                            const y = element.y - 10;
                            
                            // 绘制数值和百分比
                            if (value > 0) {
                                ctx.fillText(`${value}`, x, y);
                                ctx.fillText(`${percent}%`, x, y - 15);
                            }
                        });
                    }
                });
            }
        }]
    });
    
    // 创建各返厂原因电池型号分布图表和表格
    const createReasonByModelCharts = () => {
        // 根据总数排序返厂原因，只展示前5种原因
        const topReasons = Object.entries(reasonByModelMap)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .map(entry => entry[0]);
        
        // 如果没有足够的数据，保持不处理
        if (topReasons.length === 0) return;
        
        // 查找或创建容器
        let chartContainer = document.getElementById('reasonByModelChartContainer');
        if (!chartContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'reasonByModelChartContainer';
            chartContainer.className = 'row mt-4';
            
            chartContainer.innerHTML = `
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            TOP5返厂原因电池型号分布
                        </div>
                        <div class="card-body">
                            <canvas id="reasonByModelChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
            `;
            
            const returnReasonTab = document.getElementById('return-reason');
            returnReasonTab.appendChild(chartContainer);
        }
        
        // 创建表格容器
        let tableContainer = document.getElementById('reasonByModelTableContainer');
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.id = 'reasonByModelTableContainer';
            tableContainer.className = 'row mt-4';
            
            tableContainer.innerHTML = `
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            返厂原因与电池型号分布详情
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>返厂原因</th>
                                            <th>K174</th>
                                            <th>K175</th>
                                            <th>K179</th>
                                            <th>其他</th>
                                            <th>总计</th>
                                            <th>占比</th>
                                        </tr>
                                    </thead>
                                    <tbody id="reasonByModelTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const returnReasonTab = document.getElementById('return-reason');
            returnReasonTab.appendChild(tableContainer);
        }
        
        // 准备图表数据
        const datasets = [
            {
                label: 'K174',
                data: topReasons.map(reason => reasonByModelMap[reason]['K174']),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'K175',
                data: topReasons.map(reason => reasonByModelMap[reason]['K175']),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'K179',
                data: topReasons.map(reason => reasonByModelMap[reason]['K179']),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: '其他',
                data: topReasons.map(reason => reasonByModelMap[reason]['其他']),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }
        ];
        
        // 创建图表
        const reasonByModelCtx = document.getElementById('reasonByModelChart').getContext('2d');
        new Chart(reasonByModelCtx, {
            type: 'bar',
            data: {
                labels: topReasons,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'TOP5返厂原因电池型号分布'
                    },
                    tooltip: {
                        callbacks: {
                            afterTitle: function(context) {
                                const reason = context[0].label;
                                const total = reasonByModelMap[reason].total;
                                return `总计: ${total}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '返厂原因'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '数量'
                        }
                    }
                }
            }
        });
        
        // 填充表格数据
        const tableBody = document.getElementById('reasonByModelTableBody');
        tableBody.innerHTML = '';
        
        // 添加所有返厂原因行
        const allReasons = Object.keys(reasonByModelMap).sort((a, b) => 
            reasonByModelMap[b].total - reasonByModelMap[a].total);
        
        allReasons.forEach(reason => {
            const reasonData = reasonByModelMap[reason];
            const total = reasonData.total;
            const row = document.createElement('tr');
            
            // 返厂原因
            const reasonCell = document.createElement('td');
            reasonCell.textContent = reason;
            row.appendChild(reasonCell);
            
            // K174
            const k174Cell = document.createElement('td');
            k174Cell.textContent = reasonData['K174'];
            row.appendChild(k174Cell);
            
            // K175
            const k175Cell = document.createElement('td');
            k175Cell.textContent = reasonData['K175'];
            row.appendChild(k175Cell);
            
            // K179
            const k179Cell = document.createElement('td');
            k179Cell.textContent = reasonData['K179'];
            row.appendChild(k179Cell);
            
            // 其他
            const otherCell = document.createElement('td');
            otherCell.textContent = reasonData['其他'];
            row.appendChild(otherCell);
            
            // 总计
            const totalCell = document.createElement('td');
            totalCell.textContent = total;
            row.appendChild(totalCell);
            
            // 占比
            const percentCell = document.createElement('td');
            const percent = totalCount > 0 ? (total / totalCount * 100).toFixed(1) : 0;
            percentCell.textContent = `${percent}%`;
            row.appendChild(percentCell);
            
            tableBody.appendChild(row);
        });
        
        // 添加总计行
        const totalRow = document.createElement('tr');
        totalRow.classList.add('table-dark');
        
        // 总计标签
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = '总计';
        totalLabelCell.classList.add('fw-bold');
        totalRow.appendChild(totalLabelCell);
        
        // 计算各型号总数
        const k174Total = allReasons.reduce((sum, reason) => sum + reasonByModelMap[reason]['K174'], 0);
        const k175Total = allReasons.reduce((sum, reason) => sum + reasonByModelMap[reason]['K175'], 0);
        const k179Total = allReasons.reduce((sum, reason) => sum + reasonByModelMap[reason]['K179'], 0);
        const otherTotal = allReasons.reduce((sum, reason) => sum + reasonByModelMap[reason]['其他'], 0);
        
        // K174总数
        const k174TotalCell = document.createElement('td');
        k174TotalCell.textContent = k174Total;
        k174TotalCell.classList.add('fw-bold');
        totalRow.appendChild(k174TotalCell);
        
        // K175总数
        const k175TotalCell = document.createElement('td');
        k175TotalCell.textContent = k175Total;
        k175TotalCell.classList.add('fw-bold');
        totalRow.appendChild(k175TotalCell);
        
        // K179总数
        const k179TotalCell = document.createElement('td');
        k179TotalCell.textContent = k179Total;
        k179TotalCell.classList.add('fw-bold');
        totalRow.appendChild(k179TotalCell);
        
        // 其他总数
        const otherTotalCell = document.createElement('td');
        otherTotalCell.textContent = otherTotal;
        otherTotalCell.classList.add('fw-bold');
        totalRow.appendChild(otherTotalCell);
        
        // 所有总数
        const allTotalCell = document.createElement('td');
        allTotalCell.textContent = totalCount;
        allTotalCell.classList.add('fw-bold');
        totalRow.appendChild(allTotalCell);
        
        // 100%
        const allPercentCell = document.createElement('td');
        allPercentCell.textContent = '100%';
        allPercentCell.classList.add('fw-bold');
        totalRow.appendChild(allPercentCell);
        
        tableBody.appendChild(totalRow);
    };
    
    // 调用创建各返厂原因电池型号分布图表和表格函数
    createReasonByModelCharts();
    
    // 填充表格数据
    const tableBody = document.getElementById('returnReasonDetailTable');
    tableBody.innerHTML = '';
    
    // 找出每个型号的主要返厂原因
    const getMainReason = (model) => {
        const reasons = modelMainReasons[model];
        let mainReason = '无';
        let maxCount = 0;
        
        for (const [reason, count] of Object.entries(reasons)) {
            if (count > maxCount) {
                maxCount = count;
                mainReason = reason;
            }
        }
        
        return mainReason;
    };
    
    // 添加每个电池型号的行
    modelLabels.forEach((model, index) => {
        const count = modelData[index];
        const percent = modelPercents[index];
        const mainReason = getMainReason(model);
        
        const row = document.createElement('tr');
        
        // 电池型号
        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        row.appendChild(modelCell);
        
        // 数量
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);
        
        // 百分比
        const percentCell = document.createElement('td');
        percentCell.textContent = `${percent}%`;
        row.appendChild(percentCell);
        
        // 主要返厂原因
        const reasonCell = document.createElement('td');
        reasonCell.textContent = mainReason;
        row.appendChild(reasonCell);
        
        tableBody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.classList.add('table-dark');
    
    // 总计标签
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '总计';
    totalLabelCell.classList.add('fw-bold');
    totalRow.appendChild(totalLabelCell);
    
    // 总数
    const totalCountCell = document.createElement('td');
    totalCountCell.textContent = totalCount;
    totalCountCell.classList.add('fw-bold');
    totalRow.appendChild(totalCountCell);
    
    // 总百分比
    const totalPercentCell = document.createElement('td');
    totalPercentCell.textContent = '100%';
    totalPercentCell.classList.add('fw-bold');
    totalRow.appendChild(totalPercentCell);
    
    // 空白单元格(主要返厂原因)
    const emptyCell = document.createElement('td');
    emptyCell.textContent = '-';
    emptyCell.classList.add('fw-bold');
    totalRow.appendChild(emptyCell);
    
    tableBody.appendChild(totalRow);
}

// 维修时间统计
function createTimeCharts() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 维修时长分布
    const repairTimeCtx = document.getElementById('repairTimeChart').getContext('2d');
    new Chart(repairTimeCtx, {
        type: 'pie',
        data: {
            labels: ['1天内', '1-3天', '3-7天', '7-15天', '15天以上'],
            datasets: [{
                data: [10, 25, 35, 20, 10],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(253, 126, 20, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(13, 110, 253, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(253, 126, 20, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '维修时长分布'
                }
            }
        }
    });

    // 月度维修数量
    const monthlyRepairCtx = document.getElementById('monthlyRepairChart').getContext('2d');
    new Chart(monthlyRepairCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '维修数量',
                data: [5, 8, 12, 10, 15, 6],
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '月度维修数量趋势'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '维修数量'
                    }
                }
            }
        }
    });
}

// 超时维修统计
function createOverdueStatistics() {
    // 使用全局变量中的记录，而不是从localStorage获取
    const records = window.batteryRecords || [];
    
    // 计算维修天数并筛选出超时的记录
    const currentDate = new Date();
    const overdue7Days = [];
    const overdue15Days = [];
    
    records.forEach(record => {
        // 只处理非"已维修"状态的记录
        if (record.repairStatus !== '已维修') {
            let receiveDate;
            
            // 尝试解析返厂日期
            if (record.returnDate && record.returnDate !== '请选择时间' && record.returnDate !== 'yyyy/mm/日') {
                receiveDate = new Date(record.returnDate);
            } else {
                // 如果没有有效的返厂日期，则使用创建记录的日期或当前日期减去30天
                receiveDate = record.createdAt ? new Date(record.createdAt) : new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            // 计算维修天数
            const diffTime = currentDate.getTime() - receiveDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // 添加维修天数到记录
            const recordWithDays = {...record, repairDays: diffDays};
            
            // 筛选超时维修
            if (diffDays >= 15) {
                overdue15Days.push(recordWithDays);
                overdue7Days.push(recordWithDays);
            } else if (diffDays >= 7) {
                overdue7Days.push(recordWithDays);
            }
        }
    });
    
    // 按维修天数降序排序
    overdue7Days.sort((a, b) => b.repairDays - a.repairDays);
    overdue15Days.sort((a, b) => b.repairDays - a.repairDays);

    // 存储数据到全局变量以供分页使用
    window.overdue7DaysData = overdue7Days;
    window.overdue15DaysData = overdue15Days;

    // 初始化分页
    initOverduePagination('overdue7', overdue7Days);
    initOverduePagination('overdue15', overdue15Days);

    // 创建超时维修统计图表
    createOverdueChart(overdue7Days, overdue15Days);
}

// 填充超时维修表格（已弃用，现在使用分页渲染）
function fillOverdueTable(tableId, records) {
    // 这个函数现在由分页系统处理，保留以防兼容性问题
    console.log(`fillOverdueTable called for ${tableId} with ${records.length} records`);
}

// 创建超时维修统计图表
function createOverdueChart(overdue7Days, overdue15Days) {
    // 统计电池型号分布
    const modelCounts = {};
    
    overdue7Days.forEach(record => {
        const model = record.batteryModel || '未知型号';
        if (!modelCounts[model]) {
            modelCounts[model] = { total: 1, over15: 0 };
        } else {
            modelCounts[model].total++;
        }
        
        // 标记超过15天的记录
        if (record.repairDays >= 15) {
            modelCounts[model].over15++;
        }
    });
    
    // 转换为图表数据
    const modelLabels = Object.keys(modelCounts);
    const totalData = modelLabels.map(label => modelCounts[label].total);
    const over15Data = modelLabels.map(label => modelCounts[label].over15);
    
    // 如果没有数据，添加一个默认项
    if (modelLabels.length === 0) {
        modelLabels.push('没有数据');
        totalData.push(0);
        over15Data.push(0);
    }
    
    const overdueCtx = document.getElementById('overdueChart').getContext('2d');
    new Chart(overdueCtx, {
        type: 'bar',
        data: {
            labels: modelLabels,
            datasets: [
                {
                    label: '超过7天',
                    data: totalData,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                },
                {
                    label: '超过15天',
                    data: over15Data,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '超时维修电池型号分布'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量'
                    }
                }
            }
        }
    });
}

// 初始化超时维修分页
function initOverduePagination(type, data) {
    const pageSize = parseInt(document.getElementById(`${type}PageSize`).value) || 50;
    const currentPage = 1;

    // 存储分页状态
    window[`${type}PaginationState`] = {
        data: data,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: Math.ceil(data.length / pageSize)
    };

    // 更新记录数量显示
    document.getElementById(`${type}Count`).textContent = data.length;

    // 渲染当前页数据
    renderOverduePage(type);

    // 渲染分页控件
    renderOverduePagination(type);

    // 绑定每页显示数量变化事件
    document.getElementById(`${type}PageSize`).addEventListener('change', function() {
        const newPageSize = parseInt(this.value);
        window[`${type}PaginationState`].pageSize = newPageSize;
        window[`${type}PaginationState`].currentPage = 1;
        window[`${type}PaginationState`].totalPages = Math.ceil(data.length / newPageSize);

        renderOverduePage(type);
        renderOverduePagination(type);
    });
}

// 渲染超时维修表格页面
function renderOverduePage(type) {
    const state = window[`${type}PaginationState`];
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = Math.min(startIndex + state.pageSize, state.data.length);
    const pageData = state.data.slice(startIndex, endIndex);

    const tableBody = document.getElementById(`${type}Table`);
    tableBody.innerHTML = '';

    if (pageData.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = '没有符合条件的记录';
        cell.classList.add('text-center');
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    pageData.forEach((record, index) => {
        const row = document.createElement('tr');

        // 序号
        const indexCell = document.createElement('td');
        indexCell.textContent = startIndex + index + 1;
        indexCell.classList.add('text-center');
        row.appendChild(indexCell);

        // 电池型号
        const modelCell = document.createElement('td');
        modelCell.textContent = record.batteryModel || '未知型号';
        row.appendChild(modelCell);

        // BT码
        const btCell = document.createElement('td');
        btCell.textContent = record.batteryBtCode || '未知BT码';
        row.appendChild(btCell);

        // 返厂原因
        const reasonCell = document.createElement('td');
        reasonCell.textContent = record.returnReason || '未知原因';
        row.appendChild(reasonCell);

        // 维修天数
        const daysCell = document.createElement('td');
        daysCell.classList.add('text-center');

        const daysSpan = document.createElement('span');
        daysSpan.textContent = record.repairDays + '天';

        if (record.repairDays >= 15) {
            daysSpan.classList.add('repair-days-critical');
        } else if (record.repairDays >= 7) {
            daysSpan.classList.add('repair-days-warning');
        } else {
            daysSpan.classList.add('fw-bold');
        }

        daysCell.appendChild(daysSpan);
        row.appendChild(daysCell);

        // 维修状态
        const statusCell = document.createElement('td');
        statusCell.classList.add('text-center');

        // 添加状态样式
        const statusBadge = document.createElement('span');
        statusBadge.textContent = record.repairStatus || '待维修';
        statusBadge.classList.add('badge', 'status-badge');

        switch (record.repairStatus) {
            case '已维修':
                statusBadge.classList.add('bg-success');
                break;
            case '维修中':
                statusBadge.classList.add('bg-warning', 'text-dark');
                break;
            case '无法维修':
                statusBadge.classList.add('bg-danger');
                break;
            case '待维修':
                statusBadge.classList.add('bg-info');
                break;
            default:
                statusBadge.classList.add('bg-secondary');
        }

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

// 渲染超时维修分页控件
function renderOverduePagination(type) {
    const state = window[`${type}PaginationState`];
    const paginationContainer = document.querySelector(`#${type}Pagination .pagination`);
    paginationContainer.innerHTML = '';

    if (state.totalPages <= 1) {
        return;
    }

    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.classList.add('page-item');
    if (state.currentPage === 1) {
        prevLi.classList.add('disabled');
    }

    const prevLink = document.createElement('a');
    prevLink.classList.add('page-link');
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentPage > 1) {
            state.currentPage--;
            renderOverduePage(type);
            renderOverduePagination(type);
        }
    });

    prevLi.appendChild(prevLink);
    paginationContainer.appendChild(prevLi);

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 第一页
    if (startPage > 1) {
        const firstLi = createPageButton(1, state.currentPage === 1, type);
        paginationContainer.appendChild(firstLi);

        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.classList.add('page-item', 'disabled');
            const ellipsisLink = document.createElement('span');
            ellipsisLink.classList.add('page-link');
            ellipsisLink.textContent = '...';
            ellipsisLi.appendChild(ellipsisLink);
            paginationContainer.appendChild(ellipsisLi);
        }
    }

    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = createPageButton(i, state.currentPage === i, type);
        paginationContainer.appendChild(pageLi);
    }

    // 最后一页
    if (endPage < state.totalPages) {
        if (endPage < state.totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.classList.add('page-item', 'disabled');
            const ellipsisLink = document.createElement('span');
            ellipsisLink.classList.add('page-link');
            ellipsisLink.textContent = '...';
            ellipsisLi.appendChild(ellipsisLink);
            paginationContainer.appendChild(ellipsisLi);
        }

        const lastLi = createPageButton(state.totalPages, state.currentPage === state.totalPages, type);
        paginationContainer.appendChild(lastLi);
    }

    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.classList.add('page-item');
    if (state.currentPage === state.totalPages) {
        nextLi.classList.add('disabled');
    }

    const nextLink = document.createElement('a');
    nextLink.classList.add('page-link');
    nextLink.href = '#';
    nextLink.textContent = '下一页';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            renderOverduePage(type);
            renderOverduePagination(type);
        }
    });

    nextLi.appendChild(nextLink);
    paginationContainer.appendChild(nextLi);
}

// 创建页码按钮
function createPageButton(pageNumber, isActive, type) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (isActive) {
        li.classList.add('active');
    }

    const link = document.createElement('a');
    link.classList.add('page-link');
    link.href = '#';
    link.textContent = pageNumber;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const state = window[`${type}PaginationState`];
        state.currentPage = pageNumber;
        renderOverduePage(type);
        renderOverduePagination(type);
    });

    li.appendChild(link);
    return li;
}