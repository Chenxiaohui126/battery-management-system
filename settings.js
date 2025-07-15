document.addEventListener('DOMContentLoaded', async function() {
    // 初始化各种模态框
    const batteryModelModal = new bootstrap.Modal(document.getElementById('batteryModelModal'));
    
    // 设置各按钮的事件监听器
    setupButtonListeners();
    
    // 加载系统设置数据
    await loadSystemSettings();
    
    // 设置数据备份还原功能
    setupDataBackupRestore();
});

// 从API加载系统设置
async function loadSystemSettings() {
    try {
        const settings = await SettingsAPI.getSettings();
        
        // 填充各种列表数据
        if (settings) {
            // 加载电池型号列表
            if (settings.batteryModels) {
                loadBatteryModels(settings.batteryModels);
            }

            // 加载维修项目列表
            if (settings.repairItems) {
                loadRepairItems(settings.repairItems);
            }

            // 加载返厂原因列表
            if (settings.returnReasons) {
                loadReturnReasons(settings.returnReasons);
            }
            
            // 加载责任归属列表
            if (settings.responsibilities) {
                loadResponsibilities(settings.responsibilities);
            }
            
            // 加载快递公司列表
            if (settings.expressCompanies) {
                loadExpressCompanies(settings.expressCompanies);
            }
        }
    } catch (error) {
        console.error('加载系统设置失败:', error);
        alert('加载系统设置失败: ' + error.message);
    }
}

// 设置各按钮的事件监听器
function setupButtonListeners() {
    // 电池型号管理
    const addBatteryModelBtn = document.getElementById('addBatteryModelBtn');
    if (addBatteryModelBtn) {
        addBatteryModelBtn.addEventListener('click', function() {
            // 清空表单
            document.getElementById('batteryModelForm').reset();
            // 移除可能存在的data-id属性（表示这是新增而非编辑）
            document.getElementById('saveBatteryModelBtn').removeAttribute('data-id');
            // 显示模态框
            const batteryModelModal = new bootstrap.Modal(document.getElementById('batteryModelModal'));
            batteryModelModal.show();
        });
    }

    // 维修项目管理
    const addRepairItemBtn = document.getElementById('addRepairItemBtn');
    if (addRepairItemBtn) {
        addRepairItemBtn.addEventListener('click', function() {
            // 清空表单
            document.getElementById('repairItemForm').reset();
            // 移除可能存在的data-id属性（表示这是新增而非编辑）
            document.getElementById('saveRepairItemBtn').removeAttribute('data-id');
            // 显示模态框
            const repairItemModal = new bootstrap.Modal(document.getElementById('repairItemModal'));
            repairItemModal.show();
        });
    }
    
    // 保存电池型号按钮
    const saveBatteryModelBtn = document.getElementById('saveBatteryModelBtn');
    if (saveBatteryModelBtn) {
        saveBatteryModelBtn.addEventListener('click', async function() {
            await saveModelData();
            // 隐藏模态框
            const batteryModelModal = bootstrap.Modal.getInstance(document.getElementById('batteryModelModal'));
            batteryModelModal.hide();
        });
    }

    // 保存维修项目按钮
    const saveRepairItemBtn = document.getElementById('saveRepairItemBtn');
    if (saveRepairItemBtn) {
        saveRepairItemBtn.addEventListener('click', async function() {
            await saveRepairItemData();
            // 隐藏模态框
            const repairItemModal = bootstrap.Modal.getInstance(document.getElementById('repairItemModal'));
            repairItemModal.hide();
        });
    }

    // 添加返厂原因按钮
    const addReturnReasonBtn = document.getElementById('addReturnReasonBtn');
    if (addReturnReasonBtn) {
        addReturnReasonBtn.addEventListener('click', function() {
            alert('添加返厂原因功能正在开发中');
        });
    }
    
    // 添加责任归属按钮
    const addResponsibilityBtn = document.getElementById('addResponsibilityBtn');
    if (addResponsibilityBtn) {
        addResponsibilityBtn.addEventListener('click', function() {
            alert('添加责任归属功能正在开发中');
        });
    }
    
    // 添加快递公司按钮
    const addExpressBtn = document.getElementById('addExpressBtn');
    if (addExpressBtn) {
        addExpressBtn.addEventListener('click', function() {
            alert('添加快递公司功能正在开发中');
        });
    }
}

// 填充电池型号表格
function loadBatteryModels(models) {
    const tableBody = document.getElementById('batteryModelsTable');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充数据
    models.forEach((model, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${model.code}</td>
            <td>${model.name}</td>
            <td>${model.description || ''}</td>
            <td>${model.createdAt || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-model-btn" data-id="${model.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-model-btn" data-id="${model.id}">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 设置编辑和删除按钮的事件监听器
    setupEditButtons();
    setupDeleteButtons();
}

// 填充维修项目表格
function loadRepairItems(items) {
    const tableBody = document.getElementById('repairItemsTable');
    if (!tableBody) return;

    // 清空表格
    tableBody.innerHTML = '';

    // 填充数据
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.description || ''}</td>
            <td>${item.createdAt || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-repair-item-btn" data-id="${item.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-repair-item-btn" data-id="${item.id}">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // 设置编辑和删除按钮的事件监听器
    setupEditButtons();
    setupDeleteButtons();
}

// 填充返厂原因表格
function loadReturnReasons(reasons) {
    const tableBody = document.getElementById('returnReasonsTable');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充数据
    reasons.forEach((reason, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${reason.code}</td>
            <td>${reason.name}</td>
            <td>${reason.description || ''}</td>
            <td>${reason.createdAt || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-reason-btn" data-id="${reason.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-reason-btn" data-id="${reason.id}">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 填充责任归属表格
function loadResponsibilities(responsibilities) {
    const tableBody = document.getElementById('responsibilityTable');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充数据
    responsibilities.forEach((resp, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${resp.code}</td>
            <td>${resp.name}</td>
            <td>${resp.description || ''}</td>
            <td>${resp.createdAt || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-responsibility-btn" data-id="${resp.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-responsibility-btn" data-id="${resp.id}">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 填充快递公司表格
function loadExpressCompanies(companies) {
    const tableBody = document.getElementById('expressTable');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充数据
    companies.forEach((company, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${company.code}</td>
            <td>${company.name}</td>
            <td>${company.contactPhone || ''}</td>
            <td>${company.createdAt || ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-express-btn" data-id="${company.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-express-btn" data-id="${company.id}">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 设置编辑按钮事件
function setupEditButtons() {
    // 电池型号编辑按钮
    const editModelBtns = document.querySelectorAll('.edit-model-btn');
    editModelBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const modelId = this.getAttribute('data-id');
            
            try {
                // 获取设置数据
                const settings = await SettingsAPI.getSettings();
                if (!settings || !settings.batteryModels) {
                    throw new Error('无法加载电池型号数据');
                }
                
                // 查找对应的电池型号
                const model = settings.batteryModels.find(m => m.id === parseInt(modelId));
                if (!model) {
                    throw new Error('找不到指定的电池型号');
                }
                
                // 填充表单
                document.getElementById('modelCode').value = model.code || '';
                document.getElementById('modelName').value = model.name || '';
                document.getElementById('modelDescription').value = model.description || '';
                
                // 设置保存按钮的data-id属性，用于标识是编辑操作
                document.getElementById('saveBatteryModelBtn').setAttribute('data-id', modelId);
                
                // 显示模态框
                const batteryModelModal = new bootstrap.Modal(document.getElementById('batteryModelModal'));
                batteryModelModal.show();
            } catch (error) {
                console.error('加载电池型号数据失败:', error);
                alert('加载电池型号数据失败: ' + error.message);
            }
        });
    });

    // 维修项目编辑按钮
    const editRepairItemBtns = document.querySelectorAll('.edit-repair-item-btn');
    editRepairItemBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const itemId = this.getAttribute('data-id');

            try {
                // 获取设置数据
                const settings = await SettingsAPI.getSettings();
                if (!settings || !settings.repairItems) {
                    throw new Error('无法加载维修项目数据');
                }

                // 查找对应的维修项目
                const item = settings.repairItems.find(m => m.id === parseInt(itemId));
                if (!item) {
                    throw new Error('找不到指定的维修项目');
                }

                // 填充表单
                document.getElementById('repairItemCode').value = item.code || '';
                document.getElementById('repairItemName').value = item.name || '';
                document.getElementById('repairItemDescription').value = item.description || '';

                // 设置保存按钮的data-id属性，用于标识是编辑操作
                document.getElementById('saveRepairItemBtn').setAttribute('data-id', itemId);

                // 显示模态框
                const repairItemModal = new bootstrap.Modal(document.getElementById('repairItemModal'));
                repairItemModal.show();
            } catch (error) {
                console.error('加载维修项目数据失败:', error);
                alert('加载维修项目数据失败: ' + error.message);
            }
        });
    });

    // 返厂原因编辑按钮
    const editReasonBtns = document.querySelectorAll('.edit-reason-btn');
    editReasonBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('编辑返厂原因功能正在开发中');
        });
    });
    
    // 责任归属编辑按钮
    const editResponsibilityBtns = document.querySelectorAll('.edit-responsibility-btn');
    editResponsibilityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('编辑责任归属功能正在开发中');
        });
    });
    
    // 快递公司编辑按钮
    const editExpressBtns = document.querySelectorAll('.edit-express-btn');
    editExpressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('编辑快递公司功能正在开发中');
        });
    });
}

// 设置删除按钮事件
function setupDeleteButtons() {
    // 电池型号删除按钮
    const deleteModelBtns = document.querySelectorAll('.delete-model-btn');
    deleteModelBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除此电池型号吗？')) {
                const modelId = parseInt(this.getAttribute('data-id'));
                
                try {
                    // 获取当前设置
                    const settings = await SettingsAPI.getSettings();
                    if (!settings || !settings.batteryModels) {
                        throw new Error('无法加载设置数据');
                    }
                    
                    // 过滤掉要删除的型号
                    settings.batteryModels = settings.batteryModels.filter(model => model.id !== modelId);
                    
                    // 更新设置
                    await SettingsAPI.updateSettings(settings);
                    
                    // 重新加载表格
                    loadBatteryModels(settings.batteryModels);
                    
                    alert('电池型号已删除');
                } catch (error) {
                    console.error('删除电池型号失败:', error);
                    alert('删除电池型号失败: ' + error.message);
                }
            }
        });
    });

    // 维修项目删除按钮
    const deleteRepairItemBtns = document.querySelectorAll('.delete-repair-item-btn');
    deleteRepairItemBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除此维修项目吗？')) {
                const itemId = parseInt(this.getAttribute('data-id'));

                try {
                    // 获取当前设置
                    const settings = await SettingsAPI.getSettings();
                    if (!settings || !settings.repairItems) {
                        throw new Error('无法加载设置数据');
                    }

                    // 过滤掉要删除的项目
                    settings.repairItems = settings.repairItems.filter(item => item.id !== itemId);

                    // 更新设置
                    await SettingsAPI.updateSettings(settings);

                    // 重新加载表格
                    loadRepairItems(settings.repairItems);

                    alert('维修项目已删除');
                } catch (error) {
                    console.error('删除维修项目失败:', error);
                    alert('删除维修项目失败: ' + error.message);
                }
            }
        });
    });

    // 返厂原因删除按钮
    const deleteReasonBtns = document.querySelectorAll('.delete-reason-btn');
    deleteReasonBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除此返厂原因吗？')) {
                const reasonId = parseInt(this.getAttribute('data-id'));
                
                try {
                    // 获取当前设置
                    const settings = await SettingsAPI.getSettings();
                    if (!settings || !settings.returnReasons) {
                        throw new Error('无法加载设置数据');
                    }
                    
                    // 过滤掉要删除的原因
                    settings.returnReasons = settings.returnReasons.filter(reason => reason.id !== reasonId);
                    
                    // 更新设置
                    await SettingsAPI.updateSettings(settings);
                    
                    // 重新加载表格
                    loadReturnReasons(settings.returnReasons);
                    
                    alert('返厂原因已删除');
                } catch (error) {
                    console.error('删除返厂原因失败:', error);
                    alert('删除返厂原因失败: ' + error.message);
                }
            }
        });
    });
    
    // 责任归属删除按钮
    const deleteResponsibilityBtns = document.querySelectorAll('.delete-responsibility-btn');
    deleteResponsibilityBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除此责任归属吗？')) {
                const respId = parseInt(this.getAttribute('data-id'));
                
                try {
                    // 获取当前设置
                    const settings = await SettingsAPI.getSettings();
                    if (!settings || !settings.responsibilities) {
                        throw new Error('无法加载设置数据');
                    }
                    
                    // 过滤掉要删除的责任归属
                    settings.responsibilities = settings.responsibilities.filter(resp => resp.id !== respId);
                    
                    // 更新设置
                    await SettingsAPI.updateSettings(settings);
                    
                    // 重新加载表格
                    loadResponsibilities(settings.responsibilities);
                    
                    alert('责任归属已删除');
                } catch (error) {
                    console.error('删除责任归属失败:', error);
                    alert('删除责任归属失败: ' + error.message);
                }
            }
        });
    });
    
    // 快递公司删除按钮
    const deleteExpressBtns = document.querySelectorAll('.delete-express-btn');
    deleteExpressBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('确定要删除此快递公司吗？')) {
                const companyId = parseInt(this.getAttribute('data-id'));
                
                try {
                    // 获取当前设置
                    const settings = await SettingsAPI.getSettings();
                    if (!settings || !settings.expressCompanies) {
                        throw new Error('无法加载设置数据');
                    }
                    
                    // 过滤掉要删除的快递公司
                    settings.expressCompanies = settings.expressCompanies.filter(company => company.id !== companyId);
                    
                    // 更新设置
                    await SettingsAPI.updateSettings(settings);
                    
                    // 重新加载表格
                    loadExpressCompanies(settings.expressCompanies);
                    
                    alert('快递公司已删除');
                } catch (error) {
                    console.error('删除快递公司失败:', error);
                    alert('删除快递公司失败: ' + error.message);
                }
            }
        });
    });
}

// 保存电池型号数据
async function saveModelData() {
    const modelCode = document.getElementById('modelCode').value;
    const modelName = document.getElementById('modelName').value;
    const modelDescription = document.getElementById('modelDescription').value;
    
    // 检查必填字段
    if (!modelCode || !modelName) {
        alert('型号代码和型号名称不能为空！');
        return;
    }
    
    try {
        // 获取当前设置
        const settings = await SettingsAPI.getSettings();
        if (!settings) {
            throw new Error('无法加载设置数据');
        }
        
        // 确保batteryModels存在
        if (!settings.batteryModels) {
            settings.batteryModels = [];
        }
        
        // 获取保存按钮上的data-id属性，用于判断是新增还是编辑
        const modelId = document.getElementById('saveBatteryModelBtn').getAttribute('data-id');
        
        if (modelId) {
            // 编辑现有型号
            const index = settings.batteryModels.findIndex(model => model.id === parseInt(modelId));
            if (index !== -1) {
                settings.batteryModels[index] = {
                    ...settings.batteryModels[index],
                    code: modelCode,
                    name: modelName,
                    description: modelDescription,
                };
            } else {
                throw new Error('找不到要编辑的电池型号');
            }
        } else {
            // 新增型号
            const newId = Math.max(0, ...settings.batteryModels.map(m => m.id)) + 1;
            settings.batteryModels.push({
                id: newId,
                code: modelCode,
                name: modelName,
                description: modelDescription,
                createdAt: new Date().toISOString().split('T')[0]
            });
        }
        
        // 更新设置
        await SettingsAPI.updateSettings(settings);
        
        // 重新加载表格
        loadBatteryModels(settings.batteryModels);
        
        alert('电池型号保存成功！');
    } catch (error) {
        console.error('保存电池型号失败:', error);
        alert('保存电池型号失败: ' + error.message);
    }
}

// 保存维修项目数据
async function saveRepairItemData() {
    const itemCode = document.getElementById('repairItemCode').value;
    const itemName = document.getElementById('repairItemName').value;
    const itemDescription = document.getElementById('repairItemDescription').value;

    // 检查必填字段
    if (!itemCode || !itemName) {
        alert('项目代码和项目名称不能为空！');
        return;
    }

    try {
        // 获取当前设置
        const settings = await SettingsAPI.getSettings();
        if (!settings) {
            throw new Error('无法加载设置数据');
        }

        // 确保repairItems存在
        if (!settings.repairItems) {
            settings.repairItems = [];
        }

        // 获取保存按钮上的data-id属性，用于判断是新增还是编辑
        const itemId = document.getElementById('saveRepairItemBtn').getAttribute('data-id');

        if (itemId) {
            // 编辑现有项目
            const index = settings.repairItems.findIndex(item => item.id === parseInt(itemId));
            if (index !== -1) {
                settings.repairItems[index] = {
                    ...settings.repairItems[index],
                    code: itemCode,
                    name: itemName,
                    description: itemDescription,
                };
            } else {
                throw new Error('找不到要编辑的维修项目');
            }
        } else {
            // 新增项目
            const newId = Math.max(0, ...settings.repairItems.map(m => m.id)) + 1;
            settings.repairItems.push({
                id: newId,
                code: itemCode,
                name: itemName,
                description: itemDescription,
                createdAt: new Date().toISOString().split('T')[0]
            });
        }

        // 更新设置
        await SettingsAPI.updateSettings(settings);

        // 重新加载表格
        loadRepairItems(settings.repairItems);

        alert('维修项目保存成功！');
    } catch (error) {
        console.error('保存维修项目失败:', error);
        alert('保存维修项目失败: ' + error.message);
    }
}

// 设置数据备份还原功能
function setupDataBackupRestore() {
    // 备份按钮
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', backupData);
    }
    
    // 确认复选框
    const confirmRestore = document.getElementById('confirmRestore');
    const restoreBtn = document.getElementById('restoreBtn');
    
    if (confirmRestore && restoreBtn) {
        confirmRestore.addEventListener('change', function() {
            restoreBtn.disabled = !this.checked;
        });
    }
    
    // 恢复按钮
    if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreData);
    }
}

// 备份数据
async function backupData() {
    // 收集所有需要备份的数据
    const backupBatteries = document.getElementById('backupBatteries').checked;
    const backupSettings = document.getElementById('backupSettings').checked;
    const backupImages = document.getElementById('backupImages').checked;
    
    try {
        // 从API获取备份数据
        const backupData = await SettingsAPI.backupData();
        
        // 根据选择过滤数据
        const filteredBackupData = {};
        
        if (backupBatteries && backupData.batteries) {
            filteredBackupData.batteries = backupData.batteries;
        }
        
        if (backupSettings && backupData.settings) {
            filteredBackupData.settings = backupData.settings;
        }
        
        if (backupImages && backupData.images) {
            filteredBackupData.images = backupData.images;
        }
        
        filteredBackupData.timestamp = backupData.timestamp || new Date().toISOString();
        
        // 创建下载链接
        const dataStr = JSON.stringify(filteredBackupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = 'battery_system_backup_' + new Date().toISOString().split('T')[0] + '.json';
        
        // 触发下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        alert('数据备份完成！');
    } catch (error) {
        console.error('备份数据失败:', error);
        alert('备份数据失败: ' + error.message);
    }
}

// 恢复数据
async function restoreData() {
    const fileInput = document.getElementById('restoreFile');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('请先选择备份文件！');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // 调用API恢复数据
            await SettingsAPI.restoreData(backupData);
            
            alert('数据恢复完成！请刷新页面查看更改。');
            
            // 重新加载页面以更新UI
            window.location.reload();
        } catch (error) {
            console.error('恢复数据失败:', error);
            alert('恢复数据失败: ' + error.message);
        }
    };
    
    reader.readAsText(file);
} 