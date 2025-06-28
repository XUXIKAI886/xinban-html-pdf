/**
 * 主应用逻辑文件
 * 负责应用的初始化和整体流程控制
 */

class BrandAnalysisApp {
    constructor() {
        this.currentSection = 'input';
        this.storeData = null;
        this.reportData = null;
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        console.log('品牌定位分析应用初始化...');
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 初始化表单处理器
        if (typeof FormHandler !== 'undefined') {
            this.formHandler = new FormHandler();
        }
        
        // 初始化API客户端
        if (typeof APIClient !== 'undefined') {
            this.apiClient = new APIClient();
        }
        
        // 初始化内容生成器
        if (typeof ContentGenerator !== 'undefined') {
            this.contentGenerator = new ContentGenerator(this.apiClient);
        }
        
        // 初始化报告渲染器
        if (typeof ReportRenderer !== 'undefined') {
            this.reportRenderer = new ReportRenderer();
        }
        
        // 初始化PDF导出器 - 优先使用html-to-image方案
        if (typeof HtmlToImagePDFExporter !== 'undefined') {
            this.pdfExporter = new HtmlToImagePDFExporter();
            this.pdfExportMethod = 'html-to-image';
            console.log('✅ 使用html-to-image PDF导出器');
        } else if (typeof PDFExporter !== 'undefined') {
            this.pdfExporter = new PDFExporter();
            this.pdfExportMethod = 'html2canvas';
            console.log('⚠️ 使用html2canvas PDF导出器（备用方案）');
        }
        
        // 加载历史数据
        this.loadHistoryData();
        
        console.log('应用初始化完成');
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 表单提交事件
        const form = document.getElementById('store-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // 重新编辑按钮
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showInputSection());
        }
        
        // 下载PDF按钮
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadPDF());
        }
        
        // 价格滑块事件
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        if (priceRange && priceValue) {
            priceRange.addEventListener('input', (e) => {
                priceValue.textContent = e.target.value;
            });
        }
        

        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        if (this.currentSection === 'report') {
                            this.downloadPDF();
                        }
                        break;
                    case 'e':
                        e.preventDefault();
                        if (this.currentSection === 'report') {
                            this.showInputSection();
                        }
                        break;
                }
            }
        });
    }
    
    /**
     * 处理表单提交
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        console.log('开始处理表单提交...');
        
        try {
            // 验证表单
            if (!this.formHandler.validateForm()) {
                console.log('表单验证失败');
                return;
            }
            
            // 收集表单数据
            this.storeData = this.formHandler.collectFormData();
            console.log('收集到的店铺数据:', this.storeData);
            
            // 显示加载状态
            this.showLoading();
            
            // 生成分析报告
            this.reportData = await this.contentGenerator.generateAnalysis(this.storeData);
            console.log('生成的报告数据:', this.reportData);
            
            // 渲染报告
            this.reportRenderer.renderReport(this.reportData, this.storeData);
            
            // 保存到历史记录
            this.saveToHistory(this.storeData, this.reportData);
            
            // 显示报告区域
            this.showReportSection();
            
        } catch (error) {
            console.error('生成报告时发生错误:', error);
            this.showError('生成报告失败，请检查网络连接或稍后重试。\n错误信息：' + error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 显示输入区域
     */
    showInputSection() {
        this.currentSection = 'input';
        document.getElementById('input-section').style.display = 'block';
        document.getElementById('report-section').style.display = 'none';
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * 显示报告区域
     */
    showReportSection() {
        this.currentSection = 'report';
        document.getElementById('input-section').style.display = 'none';
        document.getElementById('report-section').style.display = 'block';
        
        // 添加动画效果
        const reportSection = document.getElementById('report-section');
        reportSection.classList.add('fade-in');
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const generateBtn = document.getElementById('generateBtn');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.querySelector('.btn-text').style.display = 'none';
            generateBtn.querySelector('.btn-loading').style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const generateBtn = document.getElementById('generateBtn');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.querySelector('.btn-text').style.display = 'inline';
            generateBtn.querySelector('.btn-loading').style.display = 'none';
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        console.error('应用错误:', message);
        alert('错误：' + message);
        // TODO: 实现更优雅的错误提示UI
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        console.log('操作成功:', message);
        alert('成功：' + message);
        // TODO: 实现更优雅的成功提示UI
    }
    
    /**
     * 下载PDF - 使用优化的html-to-image方案
     */
    async downloadPDF() {
        // 检查是否在报告页面
        if (this.currentSection !== 'report') {
            this.showError('请先生成报告后再下载PDF');
            return;
        }

        try {
            // 检查报告内容是否存在
            const reportContent = document.getElementById('report-content');
            if (!reportContent || !reportContent.innerHTML.trim()) {
                this.showError('报告内容为空，请先生成报告');
                return;
            }

            console.log('=== 开始主应用PDF导出 ===');
            console.log('PDF导出方法:', this.pdfExportMethod);
            console.log('报告内容长度:', reportContent.innerHTML.length);

            const fileName = `${this.storeData?.storeName || '店铺'}品牌定位设计.pdf`;

            // 优先使用html-to-image方案
            if (this.pdfExportMethod === 'html-to-image') {
                await this.exportWithHtmlToImage(reportContent, fileName);
            } else {
                // 备用方案：使用原有的html2canvas方法
                await this.directHTMLToJPGToPDF(reportContent, fileName);
            }

            // 显示成功提示
            this.showSuccess('PDF导出成功！文件已下载');

        } catch (error) {
            console.error('PDF导出失败:', error);

            // 如果html-to-image失败，尝试备用方案
            if (this.pdfExportMethod === 'html-to-image') {
                console.log('尝试备用方案...');
                try {
                    const reportContent = document.getElementById('report-content');
                    const fileName = `${this.storeData?.storeName || '店铺'}品牌定位设计.pdf`;
                    await this.directHTMLToJPGToPDF(reportContent, fileName);
                    this.showSuccess('PDF导出成功！（使用备用方案）');
                    return;
                } catch (backupError) {
                    console.error('备用方案也失败:', backupError);
                }
            }

            this.showError('PDF导出失败：' + error.message);
        }
    }

    /**
     * 使用html-to-image导出可变高度PDF - 最新技术突破版本
     */
    async exportWithHtmlToImage(targetElement, filename) {
        console.log('🎯 === 可变高度PDF导出模式 === (v20250628-9)');
        console.log('📏 页面高度自适应内容，无分页无裁剪无强制缩放');

        if (!this.pdfExporter) {
            throw new Error('PDF导出器未初始化');
        }

        // 可变高度PDF配置 - 最新技术突破
        const variableHeightConfig = {
            pixelRatio: 2.5,           // 高清像素比例
            backgroundColor: '#ffffff',
            cacheBust: true,
            quality: 0.98,             // 高质量图像
            margin: 6,                 // 最小边距，最大化内容空间
            variableHeight: true,      // 启用可变高度模式
            preserveOriginalSize: true, // 保持原始尺寸比例
            filename: filename || 'variable-height-report.pdf'
        };

        console.log('📐 可变高度配置 (v20250628-9):', variableHeightConfig);
        console.log('🎯 模式：可变高度 - 页面高度完全适应内容长度');
        console.log('⚙️ 关键特性: 无分页、无裁剪、无强制缩放');
        console.log('📞 即将调用: pdfExporter.exportSinglePagePDF (可变高度版本)');

        // 使用最新的可变高度PDF导出方法
        await this.pdfExporter.exportSinglePagePDF(targetElement, filename, variableHeightConfig);

        console.log('✅ 可变高度PDF导出完成 (v20250628-9) - 内容完整显示，页面高度自适应');
    }

    /**
     * 强制内联样式方法 - 解决html2canvas CSS兼容性问题
     */
    async forceInlineStyles(element) {
        console.log('🎨 开始强制内联样式...');

        try {
            // 获取所有需要样式的元素
            const allElements = [element, ...element.querySelectorAll('*')];

            allElements.forEach(el => {
                if (el.nodeType === 1) { // 确保是元素节点
                    const computedStyle = window.getComputedStyle(el);

                    // 关键样式属性
                    const importantStyles = [
                        'color', 'background-color', 'background', 'font-family',
                        'font-size', 'font-weight', 'line-height', 'text-align',
                        'margin', 'padding', 'border', 'width', 'height',
                        'display', 'position', 'top', 'left', 'right', 'bottom'
                    ];

                    importantStyles.forEach(prop => {
                        const value = computedStyle.getPropertyValue(prop);
                        if (value && value !== 'initial' && value !== 'inherit') {
                            el.style.setProperty(prop, value, 'important');
                        }
                    });
                }
            });

            console.log('✅ 样式内联完成，处理了', allElements.length, '个元素');
        } catch (error) {
            console.warn('⚠️ 样式内联过程中出现警告:', error);
        }
    }

    /**
     * 简化且可靠的HTML→JPG→PDF实现
     */
    async directHTMLToJPGToPDF(targetElement, filename) {
        console.log('使用简化可靠的HTML→JPG→PDF方案');

        // 检查依赖库
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas库未加载');
        }

        const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
        if (!jsPDFClass) {
            throw new Error('jsPDF库未加载');
        }

        // 预处理：强制内联所有样式
        console.log('预处理：强制内联样式...');
        await this.forceInlineStyles(targetElement);

        // 等待样式完全应用
        await new Promise(resolve => setTimeout(resolve, 500));

        // 第一步：HTML → Canvas（简化配置）
        console.log('步骤1: HTML → Canvas');
        const canvas = await html2canvas(targetElement, {
            scale: 2,
            logging: true,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        console.log('Canvas生成成功，尺寸:', canvas.width, 'x', canvas.height);

        // 第二步：Canvas → JPEG
        console.log('步骤2: Canvas → JPEG');
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // 第三步：JPEG → PDF
        console.log('步骤3: JPEG → PDF');
        const pdf = new jsPDFClass('portrait', 'mm', 'a4');

        // 计算PDF尺寸
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const a4Width = 210;
        const a4Height = 297;
        const margin = 10;

        const availableWidth = a4Width - 2 * margin;
        const availableHeight = a4Height - 2 * margin;

        const scaleX = availableWidth / (imgWidth * 0.264583);
        const scaleY = availableHeight / (imgHeight * 0.264583);
        const scale = Math.min(scaleX, scaleY, 1);

        const finalWidth = imgWidth * 0.264583 * scale;
        const finalHeight = imgHeight * 0.264583 * scale;

        console.log('PDF尺寸:', finalWidth, 'x', finalHeight, 'mm');

        // 检查是否需要分页
        if (finalHeight > availableHeight) {
            console.log('内容较长，使用多页PDF');
            const pageHeight = availableHeight;
            const totalPages = Math.ceil(finalHeight / pageHeight);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }

                const yOffset = -page * pageHeight;
                pdf.addImage(imgData, 'JPEG', margin, margin + yOffset, finalWidth, finalHeight);
            }

            console.log(`多页PDF创建完成，共${totalPages}页`);
        } else {
            console.log('使用单页PDF');
            const x = (a4Width - finalWidth) / 2;
            const y = (a4Height - finalHeight) / 2;
            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
        }

        // 保存PDF
        pdf.save(filename);
        console.log('PDF保存完成:', filename);
    }

    /**
     * 确保样式正确应用到目标元素 - 强制内联化所有样式
     */
    async ensureStylesApplied(targetElement) {
        console.log('开始强制内联化样式...');

        // 应用报告容器样式
        this.applyReportContainerStyles(targetElement);

        // 应用标题样式
        const titleElements = targetElement.querySelectorAll('.report-title, h1');
        titleElements.forEach(el => this.applyTitleStyles(el));

        // 应用店铺信息样式
        const storeInfoElements = targetElement.querySelectorAll('.store-info');
        storeInfoElements.forEach(el => this.applyStoreInfoStyles(el));

        // 应用分析区块样式
        const analysisElements = targetElement.querySelectorAll('.analysis-section');
        analysisElements.forEach(el => this.applyAnalysisSectionStyles(el));

        // 应用其他元素样式
        const h2Elements = targetElement.querySelectorAll('h2, .section-title');
        h2Elements.forEach(el => this.applySectionTitleStyles(el));

        const listElements = targetElement.querySelectorAll('ul, li');
        listElements.forEach(el => this.applyListStyles(el));

        console.log('样式内联化完成');
    }

    applyReportContainerStyles(element) {
        element.style.cssText = `
            background: #fff !important;
            border-radius: 10px !important;
            padding: 40px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
            font-family: 'Microsoft YaHei', Arial, sans-serif !important;
            color: #333 !important;
        `;
    }

    applyTitleStyles(element) {
        element.style.cssText = `
            color: #2d3e50 !important;
            font-size: 2rem !important;
            text-align: center !important;
            margin-bottom: 30px !important;
            border-bottom: 2px solid #e0e0e0 !important;
            padding-bottom: 15px !important;
            font-weight: bold !important;
        `;
    }

    applyStoreInfoStyles(element) {
        element.style.cssText = `
            background: #f9f9f9 !important;
            padding: 20px !important;
            border-radius: 8px !important;
            margin-bottom: 30px !important;
            border-left: 4px solid #1e88e5 !important;
        `;

        // 应用子元素样式
        const h3Elements = element.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
            h3.style.cssText = `
                color: #2d3e50 !important;
                margin-bottom: 15px !important;
                font-size: 1.2rem !important;
                font-weight: bold !important;
            `;
        });

        const infoItems = element.querySelectorAll('.info-item');
        infoItems.forEach(item => {
            item.style.cssText = `
                margin-bottom: 8px !important;
                font-size: 14px !important;
            `;
        });

        const labels = element.querySelectorAll('.info-label');
        labels.forEach(label => {
            label.style.cssText = `
                font-weight: 500 !important;
                color: #2d3e50 !important;
                display: inline-block !important;
                min-width: 80px !important;
            `;
        });

        const values = element.querySelectorAll('.info-value');
        values.forEach(value => {
            value.style.cssText = `
                color: #666 !important;
            `;
        });
    }

    applyAnalysisSectionStyles(element) {
        element.style.cssText = `
            margin-bottom: 32px !important;
            padding: 25px !important;
            background: #fff !important;
            border-radius: 8px !important;
            border: 1px solid #e0e0e0 !important;
        `;
    }

    applySectionTitleStyles(element) {
        element.style.cssText = `
            color: #1e88e5 !important;
            font-size: 1.4rem !important;
            margin-bottom: 15px !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid #e0e0e0 !important;
            font-weight: bold !important;
        `;
    }

    applyListStyles(element) {
        if (element.tagName === 'UL') {
            element.style.cssText = `
                margin: 10px 0 !important;
                padding-left: 20px !important;
                list-style-type: disc !important;
            `;
        } else if (element.tagName === 'LI') {
            element.style.cssText = `
                margin: 8px 0 !important;
                line-height: 1.6 !important;
                color: #333 !important;
            `;
        }
    }
    
    /**
     * 保存到历史记录
     */
    saveToHistory(storeData, reportData) {
        try {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                storeData,
                reportData
            };
            
            let history = JSON.parse(localStorage.getItem('brandAnalysisHistory') || '[]');
            history.unshift(historyItem);
            
            // 只保留最近10条记录
            history = history.slice(0, 10);
            
            localStorage.setItem('brandAnalysisHistory', JSON.stringify(history));
            console.log('已保存到历史记录');
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }
    
    /**
     * 加载历史数据
     */
    loadHistoryData() {
        try {
            const history = JSON.parse(localStorage.getItem('brandAnalysisHistory') || '[]');
            console.log(`加载了 ${history.length} 条历史记录`);
            // TODO: 实现历史记录UI显示
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }
    
    /**
     * 获取应用状态
     */
    getAppState() {
        return {
            currentSection: this.currentSection,
            storeData: this.storeData,
            reportData: this.reportData
        };
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BrandAnalysisApp();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrandAnalysisApp;
}
