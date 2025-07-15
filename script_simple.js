// 简化版本的script.js，专注于图片上传功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('简化版script.js加载完成');
    
    // 初始化图片上传功能
    initImageUpload();
});

// 图片上传功能
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
