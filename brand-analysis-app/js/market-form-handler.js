/**
 * 商圈调研分析 - 表单处理器
 * 负责表单验证、数据收集和用户交互
 */

class MarketFormHandler {
    constructor() {
        this.form = document.getElementById('market-survey-form');
        this.validationRules = this.initValidationRules();
        this.init();
    }
    
    /**
     * 初始化表单处理器
     */
    init() {
        console.log('[商圈分析] 表单处理器初始化...');
        this.bindValidationEvents();
        this.initFileUpload();
    }
    
    /**
     * 初始化验证规则
     */
    initValidationRules() {
        return {
            areaName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                message: '商圈名称必须填写，长度在2-50个字符之间'
            },
            location: {
                required: true,
                minLength: 5,
                maxLength: 100,
                message: '地理位置必须填写，长度在5-100个字符之间'
            },
            areaType: {
                required: false,
                message: '请选择商圈类型'
            },
            population: {
                required: false,
                message: '请选择人流量情况'
            },
            competition: {
                required: false,
                message: '请选择竞争情况'
            },
            features: {
                required: false,
                maxLength: 500,
                message: '商圈特色描述长度不能超过500个字符'
            },
            challenges: {
                required: false,
                maxLength: 500,
                message: '面临挑战描述长度不能超过500个字符'
            }
        };
    }
    
    /**
     * 绑定验证事件
     */
    bindValidationEvents() {
        if (!this.form) {
            console.warn('[商圈分析] 表单元素未找到');
            return;
        }
        
        // 为每个输入字段绑定验证事件
        Object.keys(this.validationRules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                // 实时验证
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
        
        console.log('[商圈分析] 表单验证事件绑定完成');
    }
    
    /**
     * 验证单个字段
     * @param {string} fieldName - 字段名
     * @returns {boolean} - 验证是否通过
     */
    validateField(fieldName) {
        const rule = this.validationRules[fieldName];
        if (!rule) return true;
        
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const value = field.value.trim();
        const errorElement = document.getElementById(`market-${fieldName}-error`);
        
        // 必填验证
        if (rule.required && !value) {
            this.showFieldError(fieldName, rule.message);
            return false;
        }
        
        // 长度验证
        if (value && rule.minLength && value.length < rule.minLength) {
            this.showFieldError(fieldName, rule.message);
            return false;
        }
        
        if (value && rule.maxLength && value.length > rule.maxLength) {
            this.showFieldError(fieldName, rule.message);
            return false;
        }
        
        // 清除错误信息
        this.clearFieldError(fieldName);
        return true;
    }
    
    /**
     * 显示字段错误
     * @param {string} fieldName - 字段名
     * @param {string} message - 错误信息
     */
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`market-${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.style.borderColor = '#d32f2f';
        }
    }
    
    /**
     * 清除字段错误
     * @param {string} fieldName - 字段名
     */
    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`market-${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.style.borderColor = '#e0e0e0';
        }
    }
    
    /**
     * 验证整个表单
     * @returns {boolean} - 表单是否有效
     */
    validateForm() {
        if (!this.form) {
            console.error('[商圈分析] 表单元素未找到');
            return false;
        }
        
        let isValid = true;
        
        // 验证所有字段
        Object.keys(this.validationRules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            console.log('[商圈分析] 表单验证失败');
            // 滚动到第一个错误字段
            this.scrollToFirstError();
        } else {
            console.log('[商圈分析] 表单验证通过');
        }
        
        return isValid;
    }
    
    /**
     * 滚动到第一个错误字段
     */
    scrollToFirstError() {
        const firstError = this.form.querySelector('.error-message.show');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    /**
     * 收集表单数据
     */
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // 基础字段
        data.areaName = formData.get('areaName')?.trim() || '';
        data.location = formData.get('location')?.trim() || '';
        data.areaType = formData.get('areaType')?.trim() || '';
        data.population = formData.get('population')?.trim() || '';
        data.competition = formData.get('competition')?.trim() || '';
        data.features = formData.get('features')?.trim() || '';
        data.challenges = formData.get('challenges')?.trim() || '';
        
        // 处理目标客群（多选）
        const targetCustomers = formData.getAll('targetCustomers');
        data.targetCustomers = targetCustomers.length > 0 ? targetCustomers.join('、') : '';
        
        // 添加时间戳
        data.timestamp = new Date().toISOString();
        
        return data;
    }
    
    /**
     * 重置表单
     */
    resetForm() {
        if (!this.form) return;
        
        this.form.reset();
        
        // 清除所有错误信息
        Object.keys(this.validationRules).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });
        
        console.log('[商圈分析] 表单已重置');
    }
    
    /**
     * 填充表单数据
     * @param {Object} data - 要填充的数据
     */
    fillFormData(data) {
        if (!this.form || !data) return;
        
        // 填充基础字段
        Object.keys(data).forEach(key => {
            if (key === 'targetCustomers' || key === 'timestamp') return;
            
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                field.value = data[key];
            }
        });
        
        // 处理目标客群复选框
        if (data.targetCustomers) {
            const customers = data.targetCustomers.split('、');
            customers.forEach(customer => {
                const checkbox = this.form.querySelector(`input[name="targetCustomers"][value="${customer}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }
    
    /**
     * 获取表单状态
     * @returns {Object} - 表单状态信息
     */
    getFormStatus() {
        const data = this.collectFormData();
        const requiredFields = Object.keys(this.validationRules).filter(
            key => this.validationRules[key].required
        );
        
        const filledRequiredFields = requiredFields.filter(
            key => data[key] && data[key].trim()
        );
        
        return {
            totalFields: Object.keys(data).length - 1, // 排除timestamp
            filledFields: Object.values(data).filter(value => value && value.trim()).length - 1,
            requiredFields: requiredFields.length,
            filledRequiredFields: filledRequiredFields.length,
            isComplete: filledRequiredFields.length === requiredFields.length
        };
    }

    /**
     * 初始化文件上传功能
     */
    initFileUpload() {
        console.log('[商圈分析] 初始化文件上传功能...');

        const fileInput = document.getElementById('market-document');
        const uploadArea = document.getElementById('market-file-upload-area');
        const filePreview = document.getElementById('market-file-preview');

        if (!fileInput || !uploadArea || !filePreview) {
            console.warn('[商圈分析] 文件上传元素未找到');
            return;
        }

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', (e) => {
            if (e.target.closest('.market-file-remove')) return;
            fileInput.click();
        });

        // 文件选择事件
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // 拖拽上传事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // 移除文件事件
        const removeBtn = filePreview.querySelector('.market-file-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeFile();
            });
        }
    }

    /**
     * 处理文件选择
     */
    handleFileSelect(file) {
        if (!file) return;

        console.log('[商圈分析] 选择文件:', file.name, file.size, file.type);

        // 验证文件
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            this.showFileError(validation.error);
            return;
        }

        // 显示文件预览
        this.showFilePreview(file);

        // 读取文件内容
        this.readFileContent(file);
    }

    /**
     * 验证文件
     */
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: '文件大小不能超过10MB'
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: '不支持的文件格式，请上传图片、PDF、Excel、Word或TXT文件'
            };
        }

        return { isValid: true };
    }

    /**
     * 显示文件预览
     */
    showFilePreview(file) {
        const uploadArea = document.getElementById('market-file-upload-area');
        const filePreview = document.getElementById('market-file-preview');
        const fileName = filePreview.querySelector('.market-file-name');
        const fileSize = filePreview.querySelector('.market-file-size');

        // 隐藏上传区域，显示预览
        uploadArea.querySelector('.market-file-upload-content').style.display = 'none';
        filePreview.style.display = 'block';

        // 设置文件信息
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        // 清除错误信息
        this.clearFileError();
    }

    /**
     * 移除文件
     */
    removeFile() {
        const fileInput = document.getElementById('market-document');
        const uploadArea = document.getElementById('market-file-upload-area');
        const filePreview = document.getElementById('market-file-preview');

        // 清空文件输入
        fileInput.value = '';

        // 显示上传区域，隐藏预览
        uploadArea.querySelector('.market-file-upload-content').style.display = 'block';
        filePreview.style.display = 'none';

        // 清除文件内容
        this.fileContent = null;

        console.log('[商圈分析] 文件已移除');
    }

    /**
     * 读取文件内容
     */
    readFileContent(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            this.fileContent = {
                name: file.name,
                type: file.type,
                size: file.size,
                content: e.target.result
            };

            console.log('[商圈分析] 文件内容读取完成');
        };

        reader.onerror = () => {
            this.showFileError('文件读取失败');
        };

        // 根据文件类型选择读取方式
        if (file.type.startsWith('text/')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 显示文件错误
     */
    showFileError(message) {
        const errorElement = document.getElementById('market-document-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 清除文件错误
     */
    clearFileError() {
        const errorElement = document.getElementById('market-document-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * 获取文件内容
     */
    getFileContent() {
        return this.fileContent;
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketFormHandler;
}
