document.addEventListener('DOMContentLoaded', async function() {
    // 分页配置
    window.paginationConfig = {
        itemsPerPage: 20, // 减少每页显示数量，提高性能
        currentPage: 1,
        totalPages: 1
    };

    // 初始化日期选择器
    initDatePicker();

    // 加载所有电池记录
    await loadAllRecords();
    
    // 设置导出按钮事件
    document.getElementById('exportBtn').addEventListener('click', function() {
        const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
        exportModal.show();
    });
    
    // 设置导入按钮事件
    document.getElementById('importBtn').addEventListener('click', function() {
        const importModal = new bootstrap.Modal(document.getElementById('importModal'));
        importModal.show();
    });
    
    // 确认导出按钮
    document.getElementById('confirmExportBtn').addEventListener('click', exportData);
    
    // 确认导入按钮
    document.getElementById('confirmImportBtn').addEventListener('click', importData);
    
    // 搜索按钮
    document.getElementById('searchBtn').addEventListener('click', filterRecords);
    
    // 搜索输入框事件 - 按Enter键触发搜索
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterRecords();
        }
    });

    // 维修状态筛选器事件
    document.getElementById('statusFilter').addEventListener('change', filterRecords);

    // 快捷日期按钮
    document.getElementById('thisMonthBtn').addEventListener('click', function() {
        setDateRange('thisMonth');
    });
    
    document.getElementById('lastMonthBtn').addEventListener('click', function() {
        setDateRange('lastMonth');
    });
    
    document.getElementById('thisWeekBtn').addEventListener('click', function() {
        setDateRange('thisWeek');
    });

    // 添加分页事件监听
    document.querySelector('.pagination').addEventListener('click', function(e) {
        e.preventDefault();
        const target = e.target.closest('.page-link');
        if (!target) return;
        
        if (target.textContent === '上一页') {
            if (window.paginationConfig.currentPage > 1) {
                window.paginationConfig.currentPage--;
                renderRecords();
                renderPagination();
            }
        } else if (target.textContent === '下一页') {
            if (window.paginationConfig.currentPage < window.paginationConfig.totalPages) {
                window.paginationConfig.currentPage++;
                renderRecords();
                renderPagination();
            }
        } else {
            const page = parseInt(target.textContent);
            if (!isNaN(page)) {
                window.paginationConfig.currentPage = page;
                renderRecords();
                renderPagination();
            }
        }
    });
});



// 初始化日期选择器
function initDatePicker() {
    try {
        if (typeof $ !== 'undefined' && $.fn.daterangepicker) {
            $('#dateFilter').daterangepicker({
                autoUpdateInput: false,
                locale: {
                    format: 'YYYY-MM-DD',
                    separator: ' ~ ',
                    applyLabel: '确定',
                    cancelLabel: '清除',
                    fromLabel: '从',
                    toLabel: '至',
                    customRangeLabel: '自定义',
                    weekLabel: '周',
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                },
                opens: 'right'
            });

            // 添加事件处理函数
            $('#dateFilter').on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format('YYYY-MM-DD') + ' ~ ' + picker.endDate.format('YYYY-MM-DD'));
                // 应用日期过滤
                filterRecords();
            });

            $('#dateFilter').on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');
                // 清除日期过滤
                filterRecords();
            });
            
            console.log('日期选择器初始化成功');
        } else {
            console.error('日期选择器库未加载。请检查jQuery和daterangepicker是否正确引入。');
        }
    } catch (error) {
        console.error('初始化日期选择器时出错:', error);
    }
}

// 加载所有电池记录
async function loadAllRecords() {
    try {
        console.log('开始加载维修记录');

        // 显示加载指示器
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'table-row';
            console.log('显示加载指示器');
        } else {
            console.error('找不到加载指示器元素');
        }

        // 确保数据已初始化
        if (typeof addBatteryData === 'function') {
            console.log('调用数据初始化函数');
            await addBatteryData();
        } else {
            console.log('数据初始化函数不存在');
        }

        // 从API获取所有电池数据
        let records = [];
        console.log('检查BatteryAPI是否存在:', typeof BatteryAPI);
        if (typeof BatteryAPI !== 'undefined') {
            console.log('使用BatteryAPI获取数据');
            records = await BatteryAPI.getAllBatteries();
            console.log(`从API获取到 ${records.length} 条记录`);
        } else {
            console.error('BatteryAPI未定义，尝试直接从localStorage获取');
            // 直接从localStorage获取
            const storedData = localStorage.getItem('batteries');
            console.log('localStorage中的数据:', storedData ? '存在' : '不存在');
            if (storedData) {
                records = JSON.parse(storedData);
                console.log(`从localStorage获取到 ${records.length} 条记录`);
            } else {
                console.log('localStorage中没有数据');
            }
        }

        // 保存全部记录到全局变量，用于后续分页
        window.allRecords = records || [];

        // 隐藏加载指示器
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // 如果没有记录
        if (!records || records.length === 0) {
            console.log('没有找到记录，显示空状态');
            const tableBody = document.getElementById('recordsTable').querySelector('tbody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="13" class="text-center py-4">
                        <div class="text-muted">
                            <i class="bi bi-inbox fs-1"></i>
                            <p class="mt-2">暂无维修记录</p>
                            <a href="index.html" class="btn btn-primary btn-sm">
                                <i class="bi bi-plus-circle"></i> 添加第一条记录
                            </a>
                        </div>
                    </td>
                </tr>
            `;

            // 隐藏分页
            const pagination = document.querySelector('nav[aria-label="Page navigation"]');
            if (pagination) {
                pagination.style.display = 'none';
            }
            return;
        }

        console.log(`成功加载 ${records.length} 条记录`);

        // 计算总页数
        window.paginationConfig.totalPages = Math.ceil(records.length / window.paginationConfig.itemsPerPage);

        // 渲染记录和分页
        renderRecords();
        renderPagination();

    } catch (error) {
        console.error('加载记录失败', error);

        // 隐藏加载指示器
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // 显示错误消息
        const tableBody = document.getElementById('recordsTable').querySelector('tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle fs-1"></i>
                    <p class="mt-2">加载记录失败: ${error.message}</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="loadAllRecords()">
                        <i class="bi bi-arrow-clockwise"></i> 重新加载
                    </button>
                </td>
            </tr>
        `;

        // 隐藏分页
        const pagination = document.querySelector('nav[aria-label="Page navigation"]');
        if (pagination) {
            pagination.style.display = 'none';
        }
    }
}

// 根据维修状态获取对应的标签样式类名
function getStatusBadgeClass(status) {
    switch (status) {
        case '待维修':
            return 'bg-warning text-dark';
        case '维修中':
            return 'bg-info';
        case '已维修':
            return 'bg-success';
        case '无法维修':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// 设置删除按钮的事件监听器
function setDeleteButtonsEventListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const batteryId = this.getAttribute('data-id');
            
            if (confirm('确定要删除此记录吗？此操作不可撤销。')) {
                try {
                    await BatteryAPI.deleteBattery(batteryId);
                    alert('记录已删除');
                    // 重新加载记录
                    await loadAllRecords();
                } catch (error) {
                    alert('删除失败: ' + error.message);
                }
            }
        });
    });
}

// 添加渲染当前页记录的函数
function renderRecords() {
    const tableBody = document.getElementById('recordsTable').querySelector('tbody');
    tableBody.innerHTML = '';

    console.log('开始渲染记录，总记录数:', window.allRecords ? window.allRecords.length : 0);

    if (!window.allRecords || window.allRecords.length === 0) {
        console.log('没有记录可显示');
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-inbox fs-1"></i>
                        <p class="mt-2">暂无维修记录</p>
                        <a href="index.html" class="btn btn-primary btn-sm">
                            <i class="bi bi-plus-circle"></i> 添加第一条记录
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // 获取当前应该显示的记录
    const startIndex = (window.paginationConfig.currentPage - 1) * window.paginationConfig.itemsPerPage;
    const endIndex = Math.min(startIndex + window.paginationConfig.itemsPerPage, window.allRecords.length);

    // 获取当前页的记录
    const currentPageRecords = window.allRecords.slice(startIndex, endIndex);
    console.log('当前页记录数:', currentPageRecords.length);

    // 填充表格
    currentPageRecords.forEach((record, index) => {
        console.log(`渲染记录 ${index + 1}:`, {
            btCode: record.batteryBtCode,
            status: record.repairStatus,
            model: record.batteryModel
        });

        const row = document.createElement('tr');

        // 设置行的数据属性，用于筛选
        row.setAttribute('data-status', record.repairStatus || '');
        row.setAttribute('data-return-date', record.returnDate || '');
        row.setAttribute('data-bt-code', record.batteryBtCode || '');
        row.setAttribute('data-model', record.batteryModel || '');

        // 确保维修状态有值
        const repairStatus = record.repairStatus || '未知状态';
        const statusBadgeClass = getStatusBadgeClass(repairStatus);

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${record.batteryBtCode || '-'}</td>
            <td>${record.batteryModel || '-'}</td>
            <td>${record.bmsNumber || '-'}</td>
            <td>${record.returnReason || '-'}</td>
            <td>${record.returnDate || '-'}</td>
            <td>${record.repairDate || '-'}</td>
            <td>${record.returnArea || '-'}</td>
            <td>
                <span class="badge ${statusBadgeClass}">${repairStatus}</span>
            </td>
            <td>${record.repairItem || '-'}</td>
            <td>¥${record.repairCost || '0'}</td>
            <td>${record.responsibility || '-'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <a href="index.html?id=${record.id}" class="btn btn-outline-primary" title="编辑记录">
                        <i class="bi bi-pencil"></i> 编辑
                    </a>
                    <button class="btn btn-outline-danger btn-delete" data-id="${record.id}" title="删除记录">
                        <i class="bi bi-trash"></i> 删除
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    console.log('记录渲染完成');

    // 设置删除按钮的事件监听器
    setDeleteButtonsEventListeners();
}

// 添加渲染分页的函数
function renderPagination() {
    const paginationElement = document.querySelector('.pagination');
    
    // 如果只有一页，隐藏分页导航
    if (window.paginationConfig.totalPages <= 1) {
        document.querySelector('nav[aria-label="Page navigation"]').style.display = 'none';
        return;
    }
    
    // 显示分页导航
    document.querySelector('nav[aria-label="Page navigation"]').style.display = 'block';
    
    // 清空现有分页
    paginationElement.innerHTML = '';
    
    // 添加"上一页"按钮
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${window.paginationConfig.currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#">上一页</a>`;
    paginationElement.appendChild(prevItem);
    
    // 确定要显示哪些页码按钮
    let startPage = Math.max(1, window.paginationConfig.currentPage - 2);
    let endPage = Math.min(window.paginationConfig.totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === window.paginationConfig.currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        paginationElement.appendChild(pageItem);
    }
    
    // 添加"下一页"按钮
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${window.paginationConfig.currentPage === window.paginationConfig.totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#">下一页</a>`;
    paginationElement.appendChild(nextItem);
}

// 过滤记录
function filterRecords() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    // 过滤全部记录
    const filteredRecords = window.allRecords.filter(record => {
        let matchesSearch = true;
        let matchesStatus = true;
        let matchesDate = true;
        
        // 搜索条件过滤
        if (searchInput) {
            const btCode = (record.batteryBtCode || '').toLowerCase();
            const model = (record.batteryModel || '').toLowerCase();
            const bmsNumber = (record.bmsNumber || '').toLowerCase();
            
            matchesSearch = btCode.includes(searchInput) || 
                           model.includes(searchInput) || 
                           bmsNumber.includes(searchInput);
        }
        
        // 状态过滤
        if (statusFilter) {
            matchesStatus = record.repairStatus === statusFilter;
        }
        
        // 日期过滤
        if (dateFilter && record.returnDate) {
            matchesDate = isDateInRange(record.returnDate, dateFilter);
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    // 保存过滤后的记录并更新分页
    window.allRecords = filteredRecords;
    window.paginationConfig.currentPage = 1;
    window.paginationConfig.totalPages = Math.ceil(filteredRecords.length / window.paginationConfig.itemsPerPage);
    
    // 渲染记录和分页
    renderRecords();
    renderPagination();
    
    // 检查是否有任何记录
    if (filteredRecords.length === 0) {
        const tableBody = document.getElementById('recordsTable').querySelector('tbody');
        tableBody.innerHTML = '<tr><td colspan="12" class="text-center">没有匹配的记录</td></tr>';
        
        // 隐藏分页
        document.querySelector('nav[aria-label="Page navigation"]').style.display = 'none';
    }
}

// 设置日期范围
function setDateRange(period) {
    if (typeof $ === 'undefined' || !$.fn.daterangepicker) {
        console.error('无法设置日期范围：daterangepicker未加载');
        return;
    }
    
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'thisWeek':
            const dayOfWeek = now.getDay() || 7; // 将周日(0)转换为7
            startDate = new Date(now); // 复制当前日期
            startDate.setDate(now.getDate() - dayOfWeek + 1); // 本周一
            endDate = new Date(now); // 复制当前日期
            endDate.setDate(startDate.getDate() + 6); // 本周日
            break;
    }
    
    // 格式化日期为字符串
    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    
    // 设置daterangepicker的日期范围
    const datePickerEl = $('#dateFilter');
    if (datePickerEl.length > 0 && datePickerEl.data('daterangepicker')) {
        datePickerEl.data('daterangepicker').setStartDate(startDate);
        datePickerEl.data('daterangepicker').setEndDate(endDate);
        datePickerEl.val(formatDate(startDate) + ' ~ ' + formatDate(endDate));
    } else {
        document.getElementById('dateFilter').value = formatDate(startDate) + ' ~ ' + formatDate(endDate);
    }
    
    // 触发记录过滤
    filterRecords();
}

// 检查日期是否在范围内
function isDateInRange(dateStr, rangeStr) {
    try {
        // 解析日期字符串
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return false; // 无效日期
        }
        
        // 解析范围字符串
        const rangeParts = rangeStr.split('~').map(part => part.trim());
        if (rangeParts.length !== 2) {
            return false;
        }
        
        const startDate = new Date(rangeParts[0]);
        const endDate = new Date(rangeParts[1]);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false; // 无效的范围
        }
        
        // 确保日期仅包含年月日(不包含时间)
        const clearTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const clearedDate = clearTime(date);
        const clearedStartDate = clearTime(startDate);
        const clearedEndDate = clearTime(endDate);
        
        // 检查日期是否在范围内(包含起始和结束日期)
        return clearedDate >= clearedStartDate && clearedDate <= clearedEndDate;
    } catch (error) {
        console.error('日期范围检查出错:', error);
        return false;
    }
}

// 导出数据
async function exportData() {
    try {
        // 获取导出格式
        const formatCSV = document.getElementById('formatCSV').checked;
        const format = formatCSV ? 'csv' : 'xlsx';
        
        // 获取导出范围
        const rangeAll = document.getElementById('rangeAll').checked;
        
        // 获取数据
        const batteries = await BatteryAPI.getAllBatteries();
        
        let dataToExport = batteries;
        
        // 如果选择了"当前筛选结果"，只导出可见行
        if (!rangeAll) {
            const visibleRows = document.querySelectorAll('#recordsTable tbody tr:not([style*="display: none"]):not(#loading-indicator)');
            const visibleIds = Array.from(visibleRows).map(row => {
                const deleteBtn = row.querySelector('.btn-delete');
                return deleteBtn ? deleteBtn.getAttribute('data-id') : null;
            }).filter(id => id !== null);
            
            dataToExport = batteries.filter(record => visibleIds.includes(record.id));
        }
        
        // 执行导出
        if (format === 'csv') {
            exportToCSV(dataToExport);
        } else {
            exportToExcel(dataToExport);
        }
        
        // 关闭模态框
        const exportModal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        exportModal.hide();
        
    } catch (error) {
        console.error('导出数据失败', error);
        alert('导出失败: ' + error.message);
    }
}

// 导出为CSV
function exportToCSV(data) {
    // 准备CSV头
    const headers = [
        '电池BT码', 'BMS编号', '电池型号', '循环次数', '返厂原因',
        '返厂时间', '客退地区', '维修状态', '维修项目', '维修费用',
        '维修时间', '快递公司', '运费金额', '责任归属', '维修工时费',
        '原因分析', '改善措施', '维修措施'
    ];
    
    // 将对象数组转换为CSV字符串
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
        const row = [
            item.batteryBtCode || '',
            item.bmsNumber || '',
            item.batteryModel || '',
            item.cycleCount || '',
            item.returnReason || '',
            item.returnDate || '',
            item.returnArea || '',
            item.repairStatus || '',
            item.repairItem || '',
            item.repairCost || '',
            item.repairDate || '',
            item.expressCompany || '',
            item.shippingCost || '',
            item.responsibility || '',
            item.laborCost || '',
            item.causeAnalysis || '',
            item.improvements || '',
            item.repairMeasures || ''
        ];
        
        // 处理可能包含逗号、换行符或引号的字段
        const formattedRow = row.map(field => {
            if (field === null || field === undefined) return '';
            
            const stringField = String(field);
            // 如果包含逗号、换行符或引号，则用引号括起来，并将引号转义
            if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        });
        
        csvContent += formattedRow.join(',') + '\n';
    });
    
    // 创建Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `电池维修记录_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 导出为Excel
function exportToExcel(data) {
    // 准备表头
    const headers = [
        '电池BT码', 'BMS编号', '电池型号', '循环次数', '返厂原因',
        '返厂时间', '客退地区', '维修状态', '维修项目', '维修费用',
        '维修时间', '快递公司', '运费金额', '责任归属', '维修工时费',
        '原因分析', '改善措施', '维修措施'
    ];
    
    // 准备数据
    const excelData = [];
    excelData.push(headers);
    
    data.forEach(item => {
        const row = [
            item.batteryBtCode || '',
            item.bmsNumber || '',
            item.batteryModel || '',
            item.cycleCount || '',
            item.returnReason || '',
            item.returnDate || '',
            item.returnArea || '',
            item.repairStatus || '',
            item.repairItem || '',
            item.repairCost || '',
            item.repairDate || '',
            item.expressCompany || '',
            item.shippingCost || '',
            item.responsibility || '',
            item.laborCost || '',
            item.causeAnalysis || '',
            item.improvements || '',
            item.repairMeasures || ''
        ];
        
        excelData.push(row);
    });
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '电池维修记录');
    
    // 导出为Excel
    XLSX.writeFile(wb, `电池维修记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 导入数据
async function importData() {
    try {
        const fileInput = document.getElementById('importFile');
        
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('请选择要导入的文件');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        // 读取文件后的回调
        reader.onload = async function(e) {
            try {
                let data;
                
                // 判断文件类型
                if (file.name.endsWith('.csv')) {
                    // 解析CSV
                    data = parseCSV(e.target.result);
                } else if (file.name.endsWith('.xlsx')) {
                    // 解析Excel
                    data = parseExcel(e.target.result);
                } else {
                    alert('不支持的文件格式，请使用CSV或Excel文件');
                    return;
                }
                
                if (!data || data.length === 0) {
                    alert('没有找到可导入的数据');
                    return;
                }
                
                // 确认导入
                if (confirm(`将导入${data.length}条记录，继续吗？`)) {
                    try {
                        // 导入每条记录
                        for (const record of data) {
                            await BatteryAPI.createBattery(record);
                        }
                        
                        alert(`成功导入了${data.length}条记录！`);
                        
                        // 重新加载记录
                        await loadAllRecords();
                        
                        // 安全关闭模态框
                        const importModalElement = document.getElementById('importModal');
                        if (importModalElement) {
                            const importModal = bootstrap.Modal.getInstance(importModalElement);
                            if (importModal) {
                                importModal.hide();
                            }
                        }
                        
                    } catch (error) {
                        console.error('导入过程中出错', error);
                        alert('导入过程中出错: ' + error.message);
                    }
                }
            } catch (error) {
                console.error('解析文件失败', error);
                alert('解析文件失败: ' + error.message);
            }
        };
        
        // 根据文件类型读取文件
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    } catch (error) {
        console.error('导入处理错误:', error);
        alert('导入处理错误: ' + error.message);
    }
}

// 解析CSV
function parseCSV(csvText) {
    // 将CSV文本分割为行
    const lines = csvText.split('\n');
    if (lines.length <= 1) {
        throw new Error('CSV文件格式无效或为空');
    }
    
    // 解析头部
    const headers = lines[0].split(',').map(header => header.trim());
    
    const expectedHeaders = [
        '电池BT码', 'BMS编号', '电池型号', '循环次数', '返厂原因',
        '返厂时间', '客退地区', '维修状态', '维修项目', '维修费用',
        '维修时间', '快递公司', '运费金额', '责任归属', '维修工时费',
        '原因分析', '改善措施', '维修措施'
    ];
    
    // 使用更宽松的匹配方式 - 只要包含即可，不需要精确匹配
    let missingHeaders = [];
    for (const expected of expectedHeaders) {
        let found = false;
        for (const actual of headers) {
            if (actual.includes(expected) || expected.includes(actual)) {
                found = true;
                break;
            }
        }
        if (!found) {
            missingHeaders.push(expected);
        }
    }
    
    if (missingHeaders.length > 0) {
        throw new Error('CSV文件缺少必要字段: ' + missingHeaders.join(', '));
    }
    
    // 构建字段映射
    const headerMap = {};
    headers.forEach((header, index) => {
        // 为每个期望的标题找到最匹配的实际标题
        for (const expected of expectedHeaders) {
            if (header.includes(expected) || expected.includes(header)) {
                headerMap[expected] = index;
                break;
            }
        }
    });
    
    // 解析数据
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // 跳过空行
        
        // 解析CSV行，处理引号等特殊情况
        const values = parseCSVLine(lines[i]);
        
        // 创建记录对象
        const record = {
            batteryBtCode: values[headerMap['电池BT码']] || '',
            bmsNumber: values[headerMap['BMS编号']] || '',
            batteryModel: values[headerMap['电池型号']] || '',
            cycleCount: values[headerMap['循环次数']] || '',
            returnReason: values[headerMap['返厂原因']] || '',
            returnDate: values[headerMap['返厂时间']] || '',
            returnArea: values[headerMap['客退地区']] || '',
            repairStatus: values[headerMap['维修状态']] || '',
            repairItem: values[headerMap['维修项目']] || '',
            repairCost: values[headerMap['维修费用']] || '',
            repairDate: values[headerMap['维修时间']] || '',
            expressCompany: values[headerMap['快递公司']] || '',
            shippingCost: values[headerMap['运费金额']] || '',
            responsibility: values[headerMap['责任归属']] || '',
            laborCost: values[headerMap['维修工时费']] || '',
            causeAnalysis: values[headerMap['原因分析']] || '',
            improvements: values[headerMap['改善措施']] || '',
            repairMeasures: values[headerMap['维修措施']] || ''
        };
        
        records.push(record);
    }
    
    return records;
}

// 解析单行CSV，处理引号等特殊情况
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = i < line.length - 1 ? line[i + 1] : '';
        
        if (char === '"' && !insideQuotes) {
            insideQuotes = true;
        } else if (char === '"' && insideQuotes) {
            if (nextChar === '"') {
                current += '"';
                i++; // 跳过下一个引号
            } else {
                insideQuotes = false;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// 解析Excel
function parseExcel(data) {
    try {
        // 将ArrayBuffer转换为工作簿
        const wb = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];
        
        // 将工作表转换为JSON
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (rows.length <= 1) {
            throw new Error('Excel文件格式无效或为空');
        }
        
        // 获取头部并规范化（去除多余空格）
        const headers = rows[0].map(h => h === null || h === undefined ? '' : String(h).trim());
        
        const expectedHeaders = [
            '电池BT码', 'BMS编号', '电池型号', '循环次数', '返厂原因',
            '返厂时间', '客退地区', '维修状态', '维修项目', '维修费用',
            '维修时间', '快递公司', '运费金额', '责任归属', '维修工时费',
            '原因分析', '改善措施', '维修措施'
        ];
        
        // 使用更宽松的匹配方式 - 只要包含即可，不需要精确匹配
        let missingHeaders = [];
        for (const expected of expectedHeaders) {
            let found = false;
            for (const actual of headers) {
                if (actual && (actual.includes(expected) || expected.includes(actual))) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missingHeaders.push(expected);
            }
        }
        
        if (missingHeaders.length > 0) {
            throw new Error('Excel文件缺少必要字段: ' + missingHeaders.join(', '));
        }
        
        // 构建字段映射（表头到索引的映射）
        const headerMap = {};
        headers.forEach((header, index) => {
            if (!header) return; // 跳过空标题
            // 为每个期望的标题找到最匹配的实际标题
            for (const expected of expectedHeaders) {
                if (header.includes(expected) || expected.includes(header)) {
                    headerMap[expected] = index;
                    break;
                }
            }
        });
        
        // 解析数据
        const records = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row.length) continue; // 跳过空行
            
            // 创建记录对象
            const record = {
                batteryBtCode: row[headerMap['电池BT码']] || '',
                bmsNumber: row[headerMap['BMS编号']] || '',
                batteryModel: row[headerMap['电池型号']] || '',
                cycleCount: row[headerMap['循环次数']] || '',
                returnReason: row[headerMap['返厂原因']] || '',
                returnDate: row[headerMap['返厂时间']] || '',
                returnArea: row[headerMap['客退地区']] || '',
                repairStatus: row[headerMap['维修状态']] || '',
                repairItem: row[headerMap['维修项目']] || '',
                repairCost: row[headerMap['维修费用']] || '0',
                repairDate: row[headerMap['维修时间']] || '',
                expressCompany: row[headerMap['快递公司']] || '',
                shippingCost: row[headerMap['运费金额']] || '0',
                responsibility: row[headerMap['责任归属']] || '',
                laborCost: row[headerMap['维修工时费']] || '0',
                causeAnalysis: row[headerMap['原因分析']] || '',
                improvements: row[headerMap['改善措施']] || '',
                repairMeasures: row[headerMap['维修措施']] || ''
            };
            
            // 确保所有数值字段都是字符串
            Object.keys(record).forEach(key => {
                if (record[key] === null || record[key] === undefined) {
                    record[key] = '';
                } else if (typeof record[key] !== 'string') {
                    record[key] = String(record[key]);
                }
            });
            
            records.push(record);
        }
        
        return records;
    } catch (error) {
        console.error('Excel解析错误:', error);
        throw error;
    }
} 