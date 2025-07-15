/**
 * 修复数据导入问题的脚本
 */

// 更安全的CSV解析器
function parseCSVLine(line) {
    if (!line) return [];
    
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

// 安全的CSV解析
function parseCSV(csvText) {
    if (!csvText) return [];
    
    // 将CSV文本分割为行
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) {
        console.error('CSV文件格式无效或为空');
        return [];
    }
    
    // 解析头部
    const headers = parseCSVLine(lines[0]);
    
    const expectedHeaders = [
        '电池BT码', 'BMS编号', '电池型号', '循环次数', '返厂原因',
        '返厂时间', '客退地区', '维修状态', '维修项目', '维修费用',
        '维修时间', '快递公司', '运费金额', '责任归属', '维修工时费',
        '原因分析', '改善措施', '维修措施'
    ];
    
    // 构建字段映射
    const headerMap = {};
    headers.forEach((header, index) => {
        if (!header) return;
        
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
        if (!values || values.length === 0) continue;
        
        // 安全地获取值，防止null或undefined引起的错误
        const safeGetValue = (headerName) => {
            if (headerMap[headerName] === undefined) return '';
            const index = headerMap[headerName];
            return (values[index] !== undefined && values[index] !== null) ? values[index] : '';
        };
        
        // 创建记录对象
        const record = {
            id: String(Date.now() + Math.floor(Math.random() * 1000)),
            batteryBtCode: safeGetValue('电池BT码'),
            bmsNumber: safeGetValue('BMS编号'),
            batteryModel: safeGetValue('电池型号'),
            cycleCount: safeGetValue('循环次数'),
            returnReason: safeGetValue('返厂原因'),
            returnDate: safeGetValue('返厂时间'),
            returnArea: safeGetValue('客退地区'),
            repairStatus: safeGetValue('维修状态'),
            repairItem: safeGetValue('维修项目'),
            repairCost: safeGetValue('维修费用'),
            repairDate: safeGetValue('维修时间'),
            expressCompany: safeGetValue('快递公司'),
            shippingCost: safeGetValue('运费金额'),
            responsibility: safeGetValue('责任归属'),
            laborCost: safeGetValue('维修工时费'),
            causeAnalysis: safeGetValue('原因分析'),
            improvements: safeGetValue('改善措施'),
            repairMeasures: safeGetValue('维修措施')
        };
        
        records.push(record);
    }
    
    return records;
}

// 安全的Excel解析
function parseExcel(data) {
    try {
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 转换为JSON
        const rawJson = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        if (rawJson.length <= 1) {
            throw new Error('Excel文件格式无效或为空');
        }
        
        // 模拟CSV文本
        const csvText = rawJson.map(row => {
            if (!row) return '';
            return row.map(cell => {
                // 处理单元格内容，包装引号并处理特殊字符
                cell = (cell === null || cell === undefined) ? '' : String(cell);
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    cell = '"' + cell.replace(/"/g, '""') + '"';
                }
                return cell;
            }).join(',');
        }).join('\n');
        
        // 使用CSV解析器处理
        return parseCSV(csvText);
    } catch (error) {
        console.error('Excel解析错误:', error);
        return [];
    }
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
                if (file.name.toLowerCase().endsWith('.csv')) {
                    // 解析CSV
                    data = parseCSV(e.target.result);
                } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
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
                        // 获取当前数据
                        let batteries = JSON.parse(localStorage.getItem('batteries') || '[]');
                        
                        // 添加新数据
                        batteries = batteries.concat(data);
                        
                        // 保存回localStorage
                        localStorage.setItem('batteries', JSON.stringify(batteries));
                        
                        alert(`成功导入了${data.length}条记录！`);
                        
                        // 重新加载记录
                        window.location.reload();
                        
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
        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    } catch (error) {
        console.error('导入处理错误:', error);
        alert('导入处理错误: ' + error.message);
    }
}

// 替换records.js中的导入功能
document.addEventListener('DOMContentLoaded', function() {
    // 确认导入按钮
    const importBtn = document.getElementById('confirmImportBtn');
    if (importBtn) {
        // 移除旧的事件监听
        importBtn.replaceWith(importBtn.cloneNode(true));
        
        // 添加新的事件监听
        document.getElementById('confirmImportBtn').addEventListener('click', importData);
    }
}); 