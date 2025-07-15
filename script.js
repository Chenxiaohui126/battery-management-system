document.addEventListener('DOMContentLoaded', () => {
    // 设置新增电池按钮事件
    const newBatteryBtn = document.getElementById('newBatteryBtn');
    if (newBatteryBtn) {
        newBatteryBtn.addEventListener('click', () => {
            // 设置新增电池模式
            window.newBatteryMode = true;
            // 重置表单
            resetForm();
        });
    }

    // 主页加载时，设置保存按钮点击事件
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveBatteryData);
    }

    // 设置重置按钮点击事件
    const resetBtn = document.querySelector('.btn-secondary');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    // 设置删除按钮点击事件
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteBatteryData);
    }

    // 如果URL中有batteryId参数，则加载对应电池数据
    const urlParams = new URLSearchParams(window.location.search);
    const batteryId = urlParams.get('id');
    
    if (batteryId) {
        loadBatteryData(batteryId);
    } else {
        // 如果没有ID参数，则默认为新增电池模式
        window.newBatteryMode = true;
        resetForm();
    }

    // 处理所有日期输入框
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // 初始状态检查
        if (!input.value) {
            input.classList.add('placeholder-visible');
        }
        
        // 当获取焦点时移除placeholder样式
        input.addEventListener('focus', () => {
            input.classList.remove('placeholder-visible');
        });
        
        // 当失去焦点时，如果没有值则添加placeholder样式
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.classList.add('placeholder-visible');
            } else {
                input.classList.remove('placeholder-visible');
            }
        });
        
        // 当值变化时检查是否显示placeholder
        input.addEventListener('change', () => {
            if (!input.value) {
                input.classList.add('placeholder-visible');
            } else {
                input.classList.remove('placeholder-visible');
            }
        });
    });
});

// 保存电池数据
async function saveBatteryData() {
    // 收集表单数据
    const batteryData = {
        batteryBtCode: document.getElementById('batteryBtCode').value,
        bmsNumber: document.getElementById('bmsNumber').value,
        batteryModel: document.getElementById('batteryModel').value,
        cycleCount: document.getElementById('cycleCount').value,
        returnDate: document.getElementById('returnDate').value,
        returnArea: document.getElementById('returnArea').value,
        repairStatus: document.getElementById('repairStatus').value,
        repairItem: document.getElementById('repairItem').value,
        repairCost: document.getElementById('repairCost').value,
        repairDate: document.getElementById('repairDate').value,
        expressCompany: document.getElementById('expressCompany').value,
        shippingCost: document.getElementById('shippingCost').value,
        responsibility: document.getElementById('responsibility').value,
        laborCost: document.getElementById('laborCost').value,
        causeAnalysis: document.getElementById('causeAnalysis').value,
        improvements: document.getElementById('improvements').value,
        returnReason: document.getElementById('returnReason').value,
        repairMeasures: document.getElementById('repairMeasures').value
    };
    
    try {
        if (window.newBatteryMode) {
            // 新增电池
            await BatteryAPI.createBattery(batteryData);
            alert('电池数据已保存！');
            // 保存后重置为编辑模式
            window.newBatteryMode = false;
            // 重新加载页面，显示最新数据
            window.location.href = 'records.html';
        } else {
            // 更新现有电池
            const urlParams = new URLSearchParams(window.location.search);
            const batteryId = urlParams.get('id');
            if (batteryId) {
                await BatteryAPI.updateBattery(batteryId, batteryData);
                alert('电池数据已更新！');
            } else {
                alert('无法确定要更新的电池ID');
            }
        }
    } catch (error) {
        alert(`保存失败: ${error.message}`);
    }
}

// 删除电池数据
async function deleteBatteryData() {
    // 获取当前电池ID
    const urlParams = new URLSearchParams(window.location.search);
    const batteryId = urlParams.get('id');
    
    if (!batteryId) {
        alert('没有要删除的电池数据');
        return;
    }
    
    if (confirm('确定要删除此电池数据吗？此操作不可撤销。')) {
        try {
            await BatteryAPI.deleteBattery(batteryId);
            alert('电池数据已删除');
            // 删除后返回列表页
            window.location.href = 'records.html';
        } catch (error) {
            alert(`删除失败: ${error.message}`);
        }
    }
}

// 加载电池数据
async function loadBatteryData(batteryId) {
    try {
        const batteryData = await BatteryAPI.getBatteryById(batteryId);
        
        // 填充表单
        document.getElementById('batteryBtCode').value = batteryData.batteryBtCode || '';
        document.getElementById('bmsNumber').value = batteryData.bmsNumber || '';
        document.getElementById('batteryModel').value = batteryData.batteryModel || '';
        document.getElementById('cycleCount').value = batteryData.cycleCount || '';
        document.getElementById('returnDate').value = batteryData.returnDate || '';
        document.getElementById('returnArea').value = batteryData.returnArea || '';
        document.getElementById('repairStatus').value = batteryData.repairStatus || '';
        document.getElementById('repairItem').value = batteryData.repairItem || '';
        document.getElementById('repairCost').value = batteryData.repairCost || '';
        document.getElementById('repairDate').value = batteryData.repairDate || '';
        document.getElementById('expressCompany').value = batteryData.expressCompany || '';
        document.getElementById('shippingCost').value = batteryData.shippingCost || '';
        document.getElementById('responsibility').value = batteryData.responsibility || '';
        document.getElementById('laborCost').value = batteryData.laborCost || '';
        document.getElementById('causeAnalysis').value = batteryData.causeAnalysis || '';
        document.getElementById('improvements').value = batteryData.improvements || '';
        document.getElementById('returnReason').value = batteryData.returnReason || '';
        document.getElementById('repairMeasures').value = batteryData.repairMeasures || '';
        
        // 设置为编辑模式
        window.newBatteryMode = false;

        // 加载对应的图片数据
        if (batteryData.batteryBtCode) {
            loadImagesFromStorage(batteryData.batteryBtCode);
        }
    } catch (error) {
        console.error('加载电池数据失败:', error);
        alert(`加载数据失败: ${error.message}`);
    }
}

// 重置表单
function resetForm() {
    const form = document.querySelectorAll('input, select, textarea');
    form.forEach(element => {
        if (element.type === 'date') {
            element.value = '';
            // 添加placeholder-visible类，使我们的CSS样式生效
            element.classList.add('placeholder-visible');
        } else if (element.type === 'select-one') {
            element.selectedIndex = 0;
        } else {
            element.value = '';
        }
    });
    
    // 如果在新增电池模式下，确保表单完全为空
    if (window.newBatteryMode) {
        // 特别处理日期字段
        document.getElementById('returnDate').value = '';
        document.getElementById('repairDate').value = '';
    }
}

// 添加CSS样式以处理日期输入框的占位符文本
const style = document.createElement('style');
style.textContent = `
    /* 对于空值的日期输入框，自定义样式 */
    input[type="date"]:not(:focus)[value=""] {
        color: transparent;
    }
    
    /* 隐藏默认的日期选择器格式文本 */
    input[type="date"].placeholder-visible::-webkit-datetime-edit {
        color: transparent;
    }
    
    /* 使用::before伪元素显示占位符文本 */
    input[type="date"].placeholder-visible:not(:focus)::before {
        content: attr(placeholder);
        color: #6c757d;
        position: absolute;
        padding: 7px 12px;
    }
    
    /* 确保占位符仅在没有值的情况下显示 */
    input[type="date"]:not([value=""]):not(:focus)::before {
        content: none;
    }
`;
document.head.appendChild(style);

// Sample data for demonstration
const sampleData = {
    batteryBtCode: 'BT106005115RZPY241130437',
    bmsNumber: '785072658663.0',
    batteryModel: 'K174',
    cycleCount: '111',
    returnDate: '2025-05-11',
    returnArea: '合肥',
    repairStatus: '已维修',
    repairItem: 'BMS维修',
    repairCost: '130.0',
    repairDate: '2025-05-10',
    expressCompany: '跨越',
    shippingCost: '207.0',
    responsibility: '日升贤',
    laborCost: '20.0',
    returnReason: '',
    causeAnalysis: 'BMS损坏',
    improvements: '优化设计',
    repairMeasures: '更换BMS'
};

// 检查是否有已保存的电池记录
let formData = {};
if (!window.newBatteryMode) {
    const savedRecord = localStorage.getItem('batteryRepairData');
    if (savedRecord) {
        try {
            formData = JSON.parse(savedRecord);
            // Populate form with data
            populateFormWithSampleData(formData);
        } catch (e) {
            console.error('Error parsing saved record:', e);
            populateFormWithSampleData(sampleData);
        }
    } else {
        populateFormWithSampleData(sampleData);
    }
}

// 如果有图片数据且不是新增模式，显示图片
if (!window.newBatteryMode) {
    const batteryBtCode = formData.batteryBtCode;
    if (batteryBtCode) {
        const imageData = localStorage.getItem(`batteryImage_${batteryBtCode}`);
        if (imageData) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = imageData;
            img.alt = 'Battery Image';
            img.className = 'img-fluid';
            
            imagePreview.appendChild(img);
        }
    }
}

// Function to populate the form with sample data
function populateFormWithSampleData(data) {
    for (const key in data) {
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'SELECT') {
                element.value = data[key];
            } else if (element.type === 'date') {
                // 如果是日期字段，且值为空或无效，确保不显示任何默认值
                if (data[key] && data[key].trim() !== '') {
                    element.value = data[key];
                    // 有值时移除placeholder显示类
                    element.classList.remove('placeholder-visible');
                } else {
                    element.value = '';
                    // 无值时添加placeholder显示类
                    element.classList.add('placeholder-visible');
                    // 为输入框设置data-placeholder属性
                    if (key === 'repairDate') {
                        element.setAttribute('data-placeholder', '请选择时间');
                    }
                }
            } else {
                element.value = data[key];
            }
        }
    }
}

// Function to set up event listeners
function setupEventListeners() {
    // Date selectors
    const returnDateBtn = document.querySelector('label[for="returnDate"] + div button');
    const repairDateBtn = document.querySelector('label[for="repairDate"] + div button');
    
    // 设置日期输入框的占位符文本显示
    const repairDateInput = document.getElementById('repairDate');
    if (repairDateInput) {
        // 使用自定义类添加placeholder显示效果
        repairDateInput.classList.add('placeholder-visible');
        
        // 如果值为空，确保日期格式不显示，而是显示占位符
        if (!repairDateInput.value || repairDateInput.value.trim() === '') {
            repairDateInput.value = '';
            // 通过设置特性让占位符文本可见
            repairDateInput.setAttribute('data-placeholder', '请选择时间');
        }
        
        // 监听焦点和值变化事件
        repairDateInput.addEventListener('focus', function() {
            this.classList.remove('placeholder-visible');
        });
        
        repairDateInput.addEventListener('blur', function() {
            if (!this.value) {
                this.classList.add('placeholder-visible');
            } else {
                this.classList.remove('placeholder-visible');
            }
        });
        
        // 防止默认日期格式显示
        repairDateInput.addEventListener('click', function() {
            if (!this.value) this.showPicker();
        });
    }
    
    // 同样处理返厂时间输入框
    const returnDateInput = document.getElementById('returnDate');
    if (returnDateInput && !returnDateInput.value) {
        returnDateInput.classList.add('placeholder-visible');
    }
    
    if (returnDateBtn) {
        returnDateBtn.addEventListener('click', function() {
            const dateInput = document.getElementById('returnDate');
            dateInput.showPicker();
        });
    }
    
    if (repairDateBtn) {
        repairDateBtn.addEventListener('click', function() {
            const dateInput = document.getElementById('repairDate');
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            dateInput.classList.remove('placeholder-visible');
        });
    }

    // Image upload
    const imageUploadBtn = document.querySelector('.row .col-sm-10 .btn-outline-secondary');
    if (imageUploadBtn) {
        imageUploadBtn.addEventListener('click', function() {
            // Create a hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            // Add it to the DOM
            document.body.appendChild(fileInput);
            
            // Trigger click event
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', function() {
                if (fileInput.files && fileInput.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imagePreview = document.getElementById('imagePreview');
                        imagePreview.innerHTML = '';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Battery Image';
                        img.className = 'img-fluid';
                        
                        imagePreview.appendChild(img);
                        
                        // 保存图片数据到localStorage
                        const batteryBtCode = document.getElementById('batteryBtCode').value;
                        if (batteryBtCode) {
                            // 存储图片与电池BT码的关联
                            localStorage.setItem(`batteryImage_${batteryBtCode}`, e.target.result);
                        }
                    };
                    
                    reader.readAsDataURL(fileInput.files[0]);
                }

                // Remove the input from the DOM
                document.body.removeChild(fileInput);
            });
        });
    }

    // 初始化新的图片上传功能（移到条件块外面，确保总是被调用）
    initImageUpload();
});

// 新的图片上传功能
function initImageUpload() {
    console.log('初始化图片上传功能');

    // 存储上传的图片数据
    window.beforeRepairImages = window.beforeRepairImages || [];
    window.afterRepairImages = window.afterRepairImages || [];

    // 初始化维修前图片上传
    console.log('初始化维修前图片上传');
    initImageUploadArea('beforeRepair', window.beforeRepairImages);

    // 初始化维修后图片上传
    console.log('初始化维修后图片上传');
    initImageUploadArea('afterRepair', window.afterRepairImages);

    console.log('图片上传功能初始化完成');
}

function initImageUploadArea(type, imageArray) {
    console.log(`开始初始化图片上传区域: ${type}`);

    const fileInput = document.getElementById(`${type}Files`);
    const uploadArea = document.getElementById(`${type}Upload`);
    const fileList = document.getElementById(`${type}FileList`);
    const preview = document.getElementById(`${type}Preview`);
    const uploadContent = uploadArea ? uploadArea.querySelector('.upload-content') : null;
    const selectBtn = document.getElementById(`${type}SelectBtn`);

    console.log(`元素查找结果 ${type}:`, {
        fileInput: !!fileInput,
        uploadArea: !!uploadArea,
        fileList: !!fileList,
        preview: !!preview,
        uploadContent: !!uploadContent,
        selectBtn: !!selectBtn
    });

    if (!fileInput || !uploadArea || !fileList || !preview) {
        console.error(`图片上传区域初始化失败: ${type}`, {
            fileInput: !!fileInput,
            uploadArea: !!uploadArea,
            fileList: !!fileList,
            preview: !!preview
        });
        return;
    }

    console.log(`图片上传区域 ${type} 初始化成功`);

    // 文件选择事件
    fileInput.addEventListener('change', function(e) {
        console.log(`文件选择事件触发: ${type}`, e.target.files);
        handleFileSelect(e.target.files, type, imageArray);
    });

    // 选择图片按钮点击事件
    if (selectBtn) {
        selectBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log(`选择图片按钮点击: ${type}`);
            fileInput.click();
        });
    }

    // 拖拽上传功能
    if (uploadContent) {
        uploadContent.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadContent.classList.add('dragover');
        });

        uploadContent.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadContent.classList.remove('dragover');
        });

        uploadContent.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadContent.classList.remove('dragover');

            const files = e.dataTransfer.files;
            console.log(`拖拽文件: ${type}`, files);
            handleFileSelect(files, type, imageArray);
        });

        // 点击上传区域触发文件选择
        uploadContent.addEventListener('click', function(e) {
            // 如果点击的是按钮，不要重复触发
            if (e.target.closest('button')) {
                return;
            }
            console.log(`上传区域点击: ${type}`);
            fileInput.click();
        });
    }
}

function handleFileSelect(files, type, imageArray) {
    console.log(`处理文件选择: ${type}`, files);

    if (!files || files.length === 0) {
        console.log('没有选择文件');
        return;
    }

    Array.from(files).forEach(file => {
        console.log(`处理文件: ${file.name}, 类型: ${file.type}`);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function(e) {
                console.log(`文件读取完成: ${file.name}`);

                const imageData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    data: e.target.result,
                    type: file.type
                };

                imageArray.push(imageData);
                addFileToList(imageData, type);
                updateImagePreview(type, imageArray);

                // 保存到localStorage
                saveImagesToStorage();

                console.log(`图片已添加到 ${type}:`, imageData.name);
            };

            reader.onerror = function(e) {
                console.error(`文件读取失败: ${file.name}`, e);
                alert(`文件读取失败: ${file.name}`);
            };

            reader.readAsDataURL(file);
        } else {
            console.log(`跳过非图片文件: ${file.name}`);
            alert(`文件 ${file.name} 不是图片格式，已跳过`);
        }
    });
}

function addFileToList(imageData, type) {
    const fileList = document.getElementById(`${type}FileList`);

    const fileItem = document.createElement('div');
    fileItem.className = 'file-list-item';
    fileItem.dataset.imageId = imageData.id;

    fileItem.innerHTML = `
        <div class="file-info">
            <i class="bi bi-image"></i>
            <span class="file-name">${imageData.name}</span>
            <span class="file-size">(${formatFileSize(imageData.size)})</span>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm btn-remove"
                onclick="removeImage('${imageData.id}', '${type}')">
            <i class="bi bi-trash"></i>
        </button>
    `;

    fileList.appendChild(fileItem);
}

function removeImage(imageId, type) {
    const imageArray = type === 'beforeRepair' ? window.beforeRepairImages : window.afterRepairImages;
    const index = imageArray.findIndex(img => img.id == imageId);

    if (index > -1) {
        imageArray.splice(index, 1);

        // 移除文件列表项
        const fileItem = document.querySelector(`[data-image-id="${imageId}"]`);
        if (fileItem) {
            fileItem.remove();
        }

        // 更新预览
        updateImagePreview(type, imageArray);

        // 保存到localStorage
        saveImagesToStorage();
    }
}

function updateImagePreview(type, imageArray) {
    const preview = document.getElementById(`${type}Preview`);

    if (imageArray.length === 0) {
        const emptyText = type === 'beforeRepair' ? '暂无维修前图片' : '暂无维修后图片';
        preview.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-image fs-1"></i>
                <p>${emptyText}</p>
            </div>
        `;
        preview.classList.remove('has-images');
    } else {
        preview.classList.add('has-images');

        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';

        imageArray.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';

            imageItem.innerHTML = `
                <img src="${image.data}" alt="${image.name}" onclick="showImageModal('${image.data}', '${image.name}')">
                <div class="image-overlay">
                    <button type="button" class="btn btn-sm btn-light" onclick="showImageModal('${image.data}', '${image.name}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeImage('${image.id}', '${type}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            gallery.appendChild(imageItem);
        });

        preview.innerHTML = '';
        preview.appendChild(gallery);
    }
}

function showImageModal(imageSrc, imageName) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal fade image-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${imageName}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <img src="${imageSrc}" alt="${imageName}" class="img-fluid">
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // 模态框关闭后移除DOM元素
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveImagesToStorage() {
    const batteryBtCode = document.getElementById('batteryBtCode').value;
    if (batteryBtCode) {
        localStorage.setItem(`beforeRepairImages_${batteryBtCode}`, JSON.stringify(window.beforeRepairImages));
        localStorage.setItem(`afterRepairImages_${batteryBtCode}`, JSON.stringify(window.afterRepairImages));
    }
}

function loadImagesFromStorage(batteryBtCode) {
    if (batteryBtCode) {
        // 加载维修前图片
        const beforeImages = localStorage.getItem(`beforeRepairImages_${batteryBtCode}`);
        if (beforeImages) {
            window.beforeRepairImages = JSON.parse(beforeImages);
            updateImagePreview('beforeRepair', window.beforeRepairImages);

            // 更新文件列表
            const beforeFileList = document.getElementById('beforeRepairFileList');
            beforeFileList.innerHTML = '';
            window.beforeRepairImages.forEach(image => {
                addFileToList(image, 'beforeRepair');
            });
        }

        // 加载维修后图片
        const afterImages = localStorage.getItem(`afterRepairImages_${batteryBtCode}`);
        if (afterImages) {
            window.afterRepairImages = JSON.parse(afterImages);
            updateImagePreview('afterRepair', window.afterRepairImages);

            // 更新文件列表
            const afterFileList = document.getElementById('afterRepairFileList');
            afterFileList.innerHTML = '';
            window.afterRepairImages.forEach(image => {
                addFileToList(image, 'afterRepair');
            });
        }
    }
}