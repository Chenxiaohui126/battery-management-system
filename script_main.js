// 主页专用脚本 - 包含图片上传和基本功能
console.log('主页脚本开始加载');

document.addEventListener('DOMContentLoaded', function() {
    console.log('主页DOMContentLoaded事件触发');
    
    // 初始化图片上传功能
    initImageUpload();
    
    // 初始化其他基本功能
    initBasicFunctions();
});

// 图片上传功能
function initImageUpload() {
    console.log('开始初始化图片上传功能');
    
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
            e.preventDefault();
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
    fileItem.className = 'file-list-item d-flex justify-content-between align-items-center p-2 border rounded mb-2';
    fileItem.dataset.imageId = imageData.id;

    fileItem.innerHTML = `
        <div class="file-info d-flex align-items-center">
            <i class="bi bi-image text-primary me-2"></i>
            <div>
                <div class="file-name fw-bold">${imageData.name}</div>
                <small class="text-muted">${formatFileSize(imageData.size)}</small>
            </div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm"
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
                    <button type="button" class="btn btn-sm btn-light" onclick="showImageModal('${image.data}', '${image.name}')" title="全屏查看">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeImage('${image.id}', '${type}')" title="删除图片">
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
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${imageName}</h5>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="toggleFullscreen(this)" title="全屏查看">
                            <i class="bi bi-arrows-fullscreen"></i> 全屏
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="downloadImage('${imageSrc}', '${imageName}')" title="下载图片">
                            <i class="bi bi-download"></i> 下载
                        </button>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body text-center p-0">
                    <div class="image-container position-relative" style="background: #000;">
                        <img src="${imageSrc}" alt="${imageName}" class="img-fluid"
                             style="max-height: 70vh; width: auto; cursor: zoom-in;"
                             onclick="toggleFullscreen(this)">
                        <div class="image-controls position-absolute top-50 start-50 translate-middle"
                             style="display: none; z-index: 1000;">
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-dark btn-sm" onclick="zoomImage(this, 'in')" title="放大">
                                    <i class="bi bi-zoom-in"></i>
                                </button>
                                <button type="button" class="btn btn-dark btn-sm" onclick="zoomImage(this, 'out')" title="缩小">
                                    <i class="bi bi-zoom-out"></i>
                                </button>
                                <button type="button" class="btn btn-dark btn-sm" onclick="resetZoom(this)" title="重置">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <button type="button" class="btn btn-danger btn-sm" onclick="exitFullscreen()" title="退出全屏">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // 清理模态框
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

// 全屏查看功能
function toggleFullscreen(element) {
    const modal = element.closest('.modal');
    const imageContainer = modal.querySelector('.image-container');
    const img = imageContainer.querySelector('img');
    const controls = imageContainer.querySelector('.image-controls');

    // 检查是否已经在自定义全屏模式
    if (imageContainer.classList.contains('custom-fullscreen')) {
        // 退出自定义全屏
        exitCustomFullscreen(imageContainer, img, controls);
        return;
    }

    // 尝试使用浏览器原生全屏API
    const requestFullscreen = imageContainer.requestFullscreen ||
                             imageContainer.webkitRequestFullscreen ||
                             imageContainer.mozRequestFullScreen ||
                             imageContainer.msRequestFullscreen;

    if (requestFullscreen) {
        requestFullscreen.call(imageContainer).then(() => {
            // 原生全屏成功
            setupFullscreenMode(imageContainer, img, controls);
        }).catch(err => {
            console.log('原生全屏失败，使用自定义全屏:', err);
            // 原生全屏失败，使用自定义全屏
            enterCustomFullscreen(imageContainer, img, controls);
        });
    } else {
        // 浏览器不支持原生全屏，使用自定义全屏
        console.log('浏览器不支持原生全屏，使用自定义全屏');
        enterCustomFullscreen(imageContainer, img, controls);
    }
}

// 进入自定义全屏模式
function enterCustomFullscreen(imageContainer, img, controls) {
    // 添加自定义全屏标记
    imageContainer.classList.add('custom-fullscreen');

    // 创建全屏覆盖层
    const fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.className = 'fullscreen-overlay';
    fullscreenOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: none;
    `;

    // 克隆图片和控制按钮
    const imgClone = img.cloneNode(true);
    const controlsClone = controls.cloneNode(true);

    imgClone.style.cssText = `
        max-width: 95vw;
        max-height: 95vh;
        width: auto;
        height: auto;
        cursor: grab;
        user-select: none;
    `;

    controlsClone.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        display: block;
        z-index: 10001;
    `;

    // 添加到覆盖层
    fullscreenOverlay.appendChild(imgClone);
    fullscreenOverlay.appendChild(controlsClone);

    // 添加到页面
    document.body.appendChild(fullscreenOverlay);

    // 存储引用
    imageContainer.fullscreenOverlay = fullscreenOverlay;
    imageContainer.fullscreenImg = imgClone;
    imageContainer.fullscreenControls = controlsClone;

    // 设置功能
    setupFullscreenMode(imageContainer, imgClone, controlsClone);

    // 点击覆盖层退出全屏
    fullscreenOverlay.addEventListener('click', function(e) {
        if (e.target === fullscreenOverlay) {
            exitCustomFullscreen(imageContainer, imgClone, controlsClone);
        }
    });
}

// 退出自定义全屏模式
function exitCustomFullscreen(imageContainer, img, controls) {
    imageContainer.classList.remove('custom-fullscreen');

    if (imageContainer.fullscreenOverlay) {
        document.body.removeChild(imageContainer.fullscreenOverlay);
        delete imageContainer.fullscreenOverlay;
        delete imageContainer.fullscreenImg;
        delete imageContainer.fullscreenControls;
    }

    // 移除事件监听器
    document.removeEventListener('keydown', handleFullscreenKeyboard);
}

// 设置全屏模式功能
function setupFullscreenMode(imageContainer, img, controls) {
    // 显示控制按钮
    controls.style.display = 'block';

    // 重置缩放
    img.dataset.scale = '1';
    img.style.transform = 'scale(1)';

    // 添加拖拽功能
    addImageDragFunctionality(img);

    // 添加键盘快捷键
    document.addEventListener('keydown', handleFullscreenKeyboard);
}

// 退出全屏
function exitFullscreen() {
    // 尝试退出原生全屏
    const exitFullscreenMethod = document.exitFullscreen ||
                                 document.webkitExitFullscreen ||
                                 document.mozCancelFullScreen ||
                                 document.msExitFullscreen;

    if (exitFullscreenMethod && (document.fullscreenElement || document.webkitFullscreenElement ||
                                document.mozFullScreenElement || document.msFullscreenElement)) {
        exitFullscreenMethod.call(document);
    } else {
        // 退出自定义全屏
        const customFullscreen = document.querySelector('.custom-fullscreen');
        if (customFullscreen) {
            const img = customFullscreen.fullscreenImg || customFullscreen.querySelector('img');
            const controls = customFullscreen.fullscreenControls || customFullscreen.querySelector('.image-controls');
            exitCustomFullscreen(customFullscreen, img, controls);
        }
    }
}

// 监听全屏状态变化
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement ||
                        document.mozFullScreenElement || document.msFullscreenElement;

    if (!isFullscreen) {
        // 退出原生全屏时恢复样式
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const imageContainer = modal.querySelector('.image-container');
            const img = imageContainer.querySelector('img');
            const controls = imageContainer.querySelector('.image-controls');

            if (imageContainer && img && controls) {
                // 恢复原始样式
                imageContainer.style.cssText = 'background: #000;';
                img.style.cssText = 'max-height: 70vh; width: auto; cursor: zoom-in;';
                controls.style.display = 'none';

                // 移除事件监听器
                document.removeEventListener('keydown', handleFullscreenKeyboard);
            }
        }
    }
}



// 下载图片
function downloadImage(imageSrc, imageName) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageName || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 添加图片拖拽功能
function addImageDragFunctionality(img) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    img.addEventListener('mousedown', function(e) {
        if (parseFloat(img.dataset.scale || '1') > 1) {
            isDragging = true;
            img.style.cursor = 'grabbing';

            startX = e.clientX;
            startY = e.clientY;

            const transform = img.style.transform;
            const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            initialX = translateMatch ? parseFloat(translateMatch[1]) : 0;
            initialY = translateMatch ? parseFloat(translateMatch[2]) : 0;

            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newX = initialX + deltaX;
            const newY = initialY + deltaY;

            const scale = parseFloat(img.dataset.scale || '1');
            img.style.transform = `scale(${scale}) translate(${newX}px, ${newY}px)`;
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = 'grab';
        }
    });

    // 鼠标滚轮缩放
    img.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 'out' : 'in';
        zoomImage(img.closest('.image-container').querySelector('.btn-group .btn'), delta);
    });
}

// 全屏模式键盘快捷键
function handleFullscreenKeyboard(e) {
    // 查找当前的图片元素（原生全屏或自定义全屏）
    let img = document.querySelector('.fullscreen-overlay img') ||
              document.querySelector('.image-container img');

    if (!img) return;

    switch(e.key) {
        case 'Escape':
            e.preventDefault();
            exitFullscreen();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomImage(img, 'in');
            break;
        case '-':
            e.preventDefault();
            zoomImage(img, 'out');
            break;
        case '0':
            e.preventDefault();
            resetZoom(img);
            break;
    }
}

// 更新缩放函数以直接接受图片元素
function zoomImage(imgOrButton, action) {
    let img;
    if (imgOrButton.tagName === 'IMG') {
        img = imgOrButton;
    } else {
        // 如果传入的是按钮，查找对应的图片
        const container = imgOrButton.closest('.image-container') ||
                         imgOrButton.closest('.fullscreen-overlay');
        img = container ? container.querySelector('img') : null;
    }

    if (!img) return;

    const currentScale = parseFloat(img.dataset.scale || '1');

    let newScale;
    if (action === 'in') {
        newScale = Math.min(currentScale * 1.2, 5); // 最大5倍
    } else if (action === 'out') {
        newScale = Math.max(currentScale / 1.2, 0.1); // 最小0.1倍
    }

    img.dataset.scale = newScale;
    img.style.transform = `scale(${newScale})`;
}

// 更新重置缩放函数
function resetZoom(imgOrButton) {
    let img;
    if (imgOrButton.tagName === 'IMG') {
        img = imgOrButton;
    } else {
        const container = imgOrButton.closest('.image-container') ||
                         imgOrButton.closest('.fullscreen-overlay');
        img = container ? container.querySelector('img') : null;
    }

    if (!img) return;

    img.dataset.scale = '1';
    img.style.transform = 'scale(1)';
    img.style.left = '0';
    img.style.top = '0';
}

function saveImagesToStorage() {
    const batteryBtCode = document.getElementById('batteryBtCode');
    if (batteryBtCode && batteryBtCode.value) {
        localStorage.setItem(`beforeRepairImages_${batteryBtCode.value}`, JSON.stringify(window.beforeRepairImages));
        localStorage.setItem(`afterRepairImages_${batteryBtCode.value}`, JSON.stringify(window.afterRepairImages));
        console.log('图片数据已保存到localStorage');
    } else {
        console.log('未找到电池BT码，无法保存图片数据');
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

// 基本功能初始化
function initBasicFunctions() {
    console.log('初始化基本功能');

    // 动态加载下拉菜单选项
    loadDropdownOptions();

    // 新增电池按钮
    const newBatteryBtn = document.getElementById('newBatteryBtn');
    if (newBatteryBtn) {
        newBatteryBtn.addEventListener('click', function() {
            console.log('新增电池按钮点击');
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

    console.log('基本功能初始化完成');
}

// 保存电池数据
async function saveBatteryData() {
    console.log('保存电池数据');

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
        repairMeasures: document.getElementById('repairMeasures').value,
        beforeRepairImages: window.beforeRepairImages || [],
        afterRepairImages: window.afterRepairImages || []
    };

    // 验证必填字段
    if (!batteryData.batteryBtCode) {
        alert('请输入电池BT码');
        return;
    }

    try {
        if (window.newBatteryMode) {
            // 新增电池
            batteryData.id = Date.now().toString();
            await BatteryAPI.createBattery(batteryData);
            alert('电池数据已保存！');

            // 保存后跳转到编辑模式
            window.location.href = `index.html?id=${batteryData.id}`;
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
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
    }
}

// 删除电池数据
async function deleteBatteryData() {
    const urlParams = new URLSearchParams(window.location.search);
    const batteryId = urlParams.get('id');

    if (!batteryId) {
        alert('没有可删除的电池数据');
        return;
    }

    if (confirm('确定要删除此电池数据吗？此操作不可撤销。')) {
        try {
            await BatteryAPI.deleteBattery(batteryId);
            alert('电池数据已删除');
            // 删除后返回列表页
            window.location.href = 'records.html';
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败: ' + error.message);
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

        // 加载图片数据
        if (batteryData.beforeRepairImages) {
            window.beforeRepairImages = batteryData.beforeRepairImages;
            updateImagePreview('beforeRepair', window.beforeRepairImages);

            // 更新文件列表
            const beforeFileList = document.getElementById('beforeRepairFileList');
            beforeFileList.innerHTML = '';
            window.beforeRepairImages.forEach(image => {
                addFileToList(image, 'beforeRepair');
            });
        }

        if (batteryData.afterRepairImages) {
            window.afterRepairImages = batteryData.afterRepairImages;
            updateImagePreview('afterRepair', window.afterRepairImages);

            // 更新文件列表
            const afterFileList = document.getElementById('afterRepairFileList');
            afterFileList.innerHTML = '';
            window.afterRepairImages.forEach(image => {
                addFileToList(image, 'afterRepair');
            });
        }

        // 设置为编辑模式
        window.newBatteryMode = false;

    } catch (error) {
        console.error('加载电池数据失败:', error);
        alert('加载电池数据失败: ' + error.message);
    }
}

// 重置表单
function resetForm() {
    console.log('重置表单');

    // 清空所有输入字段
    document.querySelectorAll('input, select, textarea').forEach(element => {
        if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = false;
        } else {
            element.value = '';
        }
    });

    // 设置默认值
    document.getElementById('batteryModel').value = 'K174';
    document.getElementById('repairStatus').value = '待维修';
    document.getElementById('repairItem').value = 'BMS维修';
    document.getElementById('expressCompany').value = '跨越';
    document.getElementById('responsibility').value = '日升质';
    document.getElementById('returnReason').value = '高低温报警';

    // 清空图片
    window.beforeRepairImages = [];
    window.afterRepairImages = [];
    updateImagePreview('beforeRepair', window.beforeRepairImages);
    updateImagePreview('afterRepair', window.afterRepairImages);
    document.getElementById('beforeRepairFileList').innerHTML = '';
    document.getElementById('afterRepairFileList').innerHTML = '';

    // 设置为新增模式
    window.newBatteryMode = true;
}

// 动态加载下拉菜单选项
async function loadDropdownOptions() {
    console.log('开始加载下拉菜单选项');

    try {
        // 获取系统设置
        const settings = await SettingsAPI.getSettings();
        if (!settings) {
            console.error('无法获取系统设置');
            return;
        }

        // 加载电池型号选项
        if (settings.batteryModels) {
            loadBatteryModelOptions(settings.batteryModels);
        }

        // 加载维修项目选项
        if (settings.repairItems) {
            loadRepairItemOptions(settings.repairItems);
        }

        // 加载返厂原因选项
        if (settings.returnReasons) {
            loadReturnReasonOptions(settings.returnReasons);
        }

        console.log('下拉菜单选项加载完成');
    } catch (error) {
        console.error('加载下拉菜单选项失败:', error);
        // 如果加载失败，使用默认选项
        loadDefaultOptions();
    }
}

// 加载电池型号选项
function loadBatteryModelOptions(batteryModels) {
    const batteryModelSelect = document.getElementById('batteryModel');
    if (!batteryModelSelect) return;

    // 清空现有选项
    batteryModelSelect.innerHTML = '';

    // 添加选项
    batteryModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.code;
        option.textContent = model.code;
        batteryModelSelect.appendChild(option);
    });

    console.log(`已加载 ${batteryModels.length} 个电池型号选项`);
}

// 加载维修项目选项
function loadRepairItemOptions(repairItems) {
    const repairItemSelect = document.getElementById('repairItem');
    if (!repairItemSelect) return;

    // 清空现有选项
    repairItemSelect.innerHTML = '';

    // 添加选项
    repairItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        repairItemSelect.appendChild(option);
    });

    console.log(`已加载 ${repairItems.length} 个维修项目选项`);
}

// 加载返厂原因选项
function loadReturnReasonOptions(returnReasons) {
    const returnReasonSelect = document.getElementById('returnReason');
    if (!returnReasonSelect) return;

    // 清空现有选项
    returnReasonSelect.innerHTML = '';

    // 添加选项
    returnReasons.forEach(reason => {
        const option = document.createElement('option');
        option.value = reason.name;
        option.textContent = reason.name;
        returnReasonSelect.appendChild(option);
    });

    console.log(`已加载 ${returnReasons.length} 个返厂原因选项`);
}

// 加载默认选项（当系统设置加载失败时使用）
function loadDefaultOptions() {
    console.log('使用默认选项');

    // 默认电池型号
    const defaultBatteryModels = [
        { code: 'K174' },
        { code: 'K175' },
        { code: 'K176' },
        { code: 'K179' }
    ];
    loadBatteryModelOptions(defaultBatteryModels);

    // 默认维修项目
    const defaultRepairItems = [
        { name: 'BMS维修' },
        { name: '电芯更换' },
        { name: '外壳维修' },
        { name: '锁扣更换' },
        { name: '其他' }
    ];
    loadRepairItemOptions(defaultRepairItems);

    // 默认返厂原因
    const defaultReturnReasons = [
        { name: '高低温报警' },
        { name: '漏胶' },
        { name: '上壳镭雕错误' },
        { name: '电池不识别' },
        { name: '锁扣损坏' },
        { name: '电池离线' },
        { name: '压差大' },
        { name: 'MOS异常' },
        { name: '单体二级欠压保护' },
        { name: '其他' }
    ];
    loadReturnReasonOptions(defaultReturnReasons);
}

console.log('主页脚本加载完成');
