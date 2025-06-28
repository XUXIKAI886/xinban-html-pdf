/**
 * 商圈调研分析 - 主应用逻辑文件
 * 负责商圈调研分析应用的初始化和整体流程控制
 */

class MarketAnalysisApp {
    constructor() {
        this.currentSection = 'input';
        this.marketData = null;
        this.reportData = null;
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        console.log('[商圈分析] 商圈调研分析应用初始化...');
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 初始化表单处理器
        if (typeof MarketFormHandler !== 'undefined') {
            this.formHandler = new MarketFormHandler();
        }
        
        // 初始化API客户端
        if (typeof MarketAPIClient !== 'undefined') {
            this.apiClient = new MarketAPIClient();
        }
        
        // 初始化内容生成器
        if (typeof MarketContentGenerator !== 'undefined') {
            this.contentGenerator = new MarketContentGenerator(this.apiClient);
        }
        
        // 初始化报告渲染器
        if (typeof MarketReportRenderer !== 'undefined') {
            this.reportRenderer = new MarketReportRenderer();
        }
        
        // 初始化PDF导出器 - 使用与品牌分析模块相同的先进PDF导出技术
        if (typeof HtmlToImagePDFExporter !== 'undefined') {
            this.pdfExporter = new HtmlToImagePDFExporter();
            this.pdfExportMethod = 'html-to-image-advanced';
            console.log('[商圈分析] ✅ 使用先进的html-to-image PDF导出器');
        } else if (typeof MarketPDFExporter !== 'undefined') {
            this.pdfExporter = new MarketPDFExporter();
            this.pdfExportMethod = 'basic';
            console.log('[商圈分析] ⚠️ 使用基础PDF导出器（备用方案）');
        }
        
        // 加载历史数据
        this.loadHistoryData();
        
        console.log('[商圈分析] 应用初始化完成');
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 表单提交事件
        const form = document.getElementById('market-survey-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // 重新编辑按钮
        const editBtn = document.getElementById('market-editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showInputSection());
        }
        
        // PDF下载按钮
        const downloadBtn = document.getElementById('market-downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handlePDFDownload());
        }
        
        console.log('[商圈分析] 事件监听器绑定完成');
    }
    
    /**
     * 处理表单提交
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        console.log('[商圈分析] 开始处理表单提交...');
        
        try {
            // 验证表单
            if (!this.formHandler.validateForm()) {
                console.log('[商圈分析] 表单验证失败');
                return;
            }
            
            // 收集表单数据
            this.marketData = this.formHandler.collectFormData();

            // 收集文档内容（如果有）
            const fileContent = this.formHandler.getFileContent();
            if (fileContent && this.marketData.enableDocumentAnalysis) {
                this.marketData.documentContent = this.extractDocumentText(fileContent);
                console.log('[商圈分析] 收集到文档内容，长度:', this.marketData.documentContent.length);
            }

            console.log('[商圈分析] 收集到的商圈数据:', this.marketData);
            
            // 显示加载状态
            this.showLoading();
            
            // 生成分析报告
            this.reportData = await this.contentGenerator.generateAnalysis(this.marketData);
            console.log('[商圈分析] 生成的报告数据:', this.reportData);
            
            // 渲染报告
            this.reportRenderer.renderReport(this.reportData, this.marketData);
            
            // 保存到历史记录
            this.saveToHistory(this.marketData, this.reportData);
            
            // 显示报告区域
            this.showReportSection();
            
        } catch (error) {
            console.error('[商圈分析] 处理表单提交失败:', error);
            this.handleError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 处理PDF下载 - 使用先进的可变高度PDF导出技术
     */
    async handlePDFDownload() {
        console.log('[商圈分析] 开始PDF下载...');

        try {
            // 获取报告内容元素
            const reportElement = document.getElementById('market-report-content');
            if (!reportElement || !reportElement.innerHTML.trim()) {
                throw new Error('报告内容为空，请先生成商圈分析报告');
            }

            // 显示下载按钮加载状态
            this.setDownloadButtonLoading(true);

            // 生成文件名
            const areaName = this.marketData?.areaName || '商圈';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `商圈调研分析报告_${areaName}_${timestamp}.pdf`;

            console.log('[商圈分析] 使用PDF导出方法:', this.pdfExportMethod);
            console.log('[商圈分析] 报告内容长度:', reportElement.innerHTML.length);
            console.log('[商圈分析] 文件名:', filename);

            if (this.pdfExportMethod === 'html-to-image-advanced') {
                // 使用先进的可变高度PDF导出
                console.log('[商圈分析] 🚀 使用可变高度PDF导出技术');

                // 预处理：添加PDF导出优化样式和全面颜色处理
                const originalClasses = reportElement.className;
                reportElement.classList.add('market-pdf-export');

                // 强制应用所有颜色样式（背景、文字、边框、图标等）
                this.forceAllColors(reportElement);

                try {
                    // 等待样式应用和背景颜色渲染
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // 配置可变高度PDF导出选项 - 优化背景颜色支持
                    const exportOptions = {
                        filename: filename,
                        margin: 10, // 边距
                        pixelRatio: 3.0, // 提高清晰度以更好显示背景
                        backgroundColor: null, // 不覆盖元素背景
                        quality: 0.98, // 提高质量以保持背景颜色
                        singlePageMode: true, // 单页模式
                        allowPagination: false, // 禁用分页
                        variableHeight: true, // 可变高度
                        preserveOriginalSize: true, // 保持原始尺寸
                        // 背景颜色专用配置
                        allowTaint: true,
                        useCORS: true,
                        skipAutoScale: false,
                        includeQueryParams: true,
                        skipFonts: false
                    };

                    console.log('[商圈分析] 🎨 使用背景颜色优化配置导出PDF');

                    // 使用可变高度单页PDF导出
                    await this.pdfExporter.exportSinglePagePDF(reportElement, filename, exportOptions);

                } finally {
                    // 恢复原始样式类
                    reportElement.className = originalClasses;
                    // 清理强制颜色样式
                    this.cleanupAllColors(reportElement);
                }

            } else {
                // 备用方案：使用基础PDF导出器
                console.log('[商圈分析] ⚠️ 使用基础PDF导出器');
                const success = await this.pdfExporter.exportToPDF(filename);
                if (!success) {
                    throw new Error('PDF导出失败');
                }
            }

            this.showSuccessMessage('PDF下载成功！已使用可变高度技术，内容完整显示');
            console.log('[商圈分析] ✅ PDF导出成功，使用可变高度技术');

        } catch (error) {
            console.error('[商圈分析] PDF下载失败:', error);

            // 如果先进方案失败，尝试备用方案
            if (this.pdfExportMethod === 'html-to-image-advanced' && typeof MarketPDFExporter !== 'undefined') {
                console.log('[商圈分析] 尝试备用PDF导出方案...');
                try {
                    const backupExporter = new MarketPDFExporter();
                    const success = await backupExporter.exportToPDF();
                    if (success) {
                        this.showSuccessMessage('PDF下载成功！（使用备用方案）');
                        return;
                    }
                } catch (backupError) {
                    console.error('[商圈分析] 备用方案也失败:', backupError);
                }
            }

            this.showErrorMessage('PDF下载失败: ' + error.message);
        } finally {
            this.setDownloadButtonLoading(false);
        }
    }
    
    /**
     * 显示输入区域
     */
    showInputSection() {
        const inputSection = document.getElementById('market-input-section');
        const reportSection = document.getElementById('market-report-section');
        
        if (inputSection && reportSection) {
            inputSection.style.display = 'block';
            reportSection.style.display = 'none';
            this.currentSection = 'input';
            
            console.log('[商圈分析] 切换到输入区域');
        }
    }
    
    /**
     * 显示报告区域
     */
    showReportSection() {
        const inputSection = document.getElementById('market-input-section');
        const reportSection = document.getElementById('market-report-section');
        
        if (inputSection && reportSection) {
            inputSection.style.display = 'none';
            reportSection.style.display = 'block';
            this.currentSection = 'report';
            
            console.log('[商圈分析] 切换到报告区域');
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        const loadingOverlay = document.getElementById('market-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        // 禁用提交按钮
        const submitBtn = document.getElementById('market-generateBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.market-btn-text');
            const btnLoading = submitBtn.querySelector('.market-btn-loading');
            
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('market-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // 恢复提交按钮
        const submitBtn = document.getElementById('market-generateBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.market-btn-text');
            const btnLoading = submitBtn.querySelector('.market-btn-loading');
            
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
    
    /**
     * 设置下载按钮加载状态
     */
    setDownloadButtonLoading(loading) {
        const downloadBtn = document.getElementById('market-downloadBtn');
        if (downloadBtn) {
            downloadBtn.disabled = loading;
            downloadBtn.textContent = loading ? '正在生成PDF...' : '下载PDF';
        }
    }

    /**
     * 强制应用所有颜色样式（PDF导出专用）- 包括背景、文字、边框、图标等
     */
    forceAllColors(element) {
        console.log('[商圈分析] 🎨 强制应用所有颜色样式');

        // 1. 处理背景颜色
        this.forceBackgroundColors(element);

        // 2. 处理文字颜色
        this.forceTextColors(element);

        // 3. 处理边框颜色
        this.forceBorderColors(element);

        // 4. 处理图标颜色
        this.forceIconColors(element);

        // 5. 处理特定元素的颜色
        this.forceSpecificElementColors(element);

        console.log('[商圈分析] ✅ 所有颜色样式强制应用完成');
    }

    /**
     * 强制应用背景颜色样式
     */
    forceBackgroundColors(element) {
        console.log('[商圈分析] 🎨 强制应用背景颜色');

        // 为所有有背景色的元素添加强制样式
        const elementsWithBackground = element.querySelectorAll(`
            .market-report-header-section,
            .market-meta-item,
            .market-analysis-section,
            .market-key-points,
            .market-report-meta,
            .market-form-section,
            .market-section,
            .module-header,
            .market-summary-section,
            .market-conclusion-section,
            .market-generation-info,
            .market-highlights,
            [style*="background"],
            [class*="bg-"],
            [class*="background"]
        `);

        elementsWithBackground.forEach(el => {
            // 获取计算后的样式
            const computedStyle = window.getComputedStyle(el);
            const bgColor = computedStyle.backgroundColor;
            const bgImage = computedStyle.backgroundImage;

            // 如果有背景颜色，强制设置为内联样式
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                el.style.backgroundColor = bgColor + ' !important';
                el.setAttribute('data-forced-bg', bgColor);
                console.log('[商圈分析] 强制背景色:', el.className, bgColor);
            }

            // 如果有背景图像，也强制设置
            if (bgImage && bgImage !== 'none') {
                el.style.backgroundImage = bgImage + ' !important';
                el.setAttribute('data-forced-bg-img', bgImage);
            }

            // 确保背景不被裁剪
            el.style.backgroundClip = 'padding-box !important';
            el.style.backgroundOrigin = 'padding-box !important';
        });
    }

    /**
     * 强制应用文字颜色样式
     */
    forceTextColors(element) {
        console.log('[商圈分析] 🎨 强制应用文字颜色');

        // 定义文字颜色映射
        const textColorMap = {
            '.market-report-title': '#2E7D32',
            '.market-section-title': '#2E7D32',
            '.market-form-section-title': '#2E7D32',
            '.market-analysis-title': '#4CAF50',
            '.market-highlights-title': '#2E7D32',
            '.market-dimension-title': '#333',
            '.market-dimension-content': '#333',
            '.market-summary-text': '#333',
            '.market-conclusion-text': '#333',
            '.market-generation-info': '#666',
            '.market-error-title': '#d32f2f',
            '.market-error-details': '#666',
            '.market-meta-label': 'rgba(255, 255, 255, 0.8)',
            '.market-meta-value': 'white',
            '.market-score-number': '#FFD700',
            'h1, h2, h3, h4, h5, h6': '#333',
            'p': '#333',
            'span': 'inherit',
            'div': 'inherit'
        };

        // 应用文字颜色映射
        Object.entries(textColorMap).forEach(([selector, color]) => {
            const elements = element.querySelectorAll(selector);
            elements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                const currentColor = computedStyle.color;

                // 强制设置文字颜色
                el.style.color = color + ' !important';
                el.setAttribute('data-forced-color', color);
                console.log('[商圈分析] 强制文字色:', selector, color);
            });
        });

        // 处理所有文本元素，确保有明确的颜色
        const allTextElements = element.querySelectorAll('*');
        allTextElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const currentColor = computedStyle.color;

            // 如果元素有文字内容且颜色不明确，设置默认颜色
            if (el.textContent && el.textContent.trim() &&
                (!currentColor || currentColor === 'rgba(0, 0, 0, 0)')) {
                el.style.color = '#333 !important';
                el.setAttribute('data-forced-default-color', '#333');
            }
        });
    }

    /**
     * 强制应用边框颜色样式
     */
    forceBorderColors(element) {
        console.log('[商圈分析] 🎨 强制应用边框颜色');

        // 定义边框颜色映射
        const borderColorMap = {
            '.market-section': '#e0e0e0',
            '.market-form-section': '#4CAF50',
            '.market-analysis-section': '#4CAF50',
            '.market-key-points': '#4CAF50',
            '.market-highlights': '#4CAF50',
            '.market-report-meta': '#e0e0e0',
            '.market-conclusion-section': '#4CAF50',
            '.market-section-title': '#e0e0e0',
            '.market-analysis-title': '#4CAF50'
        };

        // 应用边框颜色映射
        Object.entries(borderColorMap).forEach(([selector, color]) => {
            const elements = element.querySelectorAll(selector);
            elements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);

                // 强制设置各种边框颜色
                if (computedStyle.borderLeftColor && computedStyle.borderLeftColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.borderLeftColor = color + ' !important';
                }
                if (computedStyle.borderRightColor && computedStyle.borderRightColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.borderRightColor = color + ' !important';
                }
                if (computedStyle.borderTopColor && computedStyle.borderTopColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.borderTopColor = color + ' !important';
                }
                if (computedStyle.borderBottomColor && computedStyle.borderBottomColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.borderBottomColor = color + ' !important';
                }
                if (computedStyle.borderColor && computedStyle.borderColor !== 'rgba(0, 0, 0, 0)') {
                    el.style.borderColor = color + ' !important';
                }

                el.setAttribute('data-forced-border', color);
                console.log('[商圈分析] 强制边框色:', selector, color);
            });
        });
    }

    /**
     * 强制应用图标颜色样式
     */
    forceIconColors(element) {
        console.log('[商圈分析] 🎨 强制应用图标颜色');

        // 处理FontAwesome图标
        const icons = element.querySelectorAll('i[class*="fa"], .market-icon, [class*="icon"]');
        icons.forEach(icon => {
            // 根据上下文设置图标颜色
            const parent = icon.closest('.market-report-header-section, .market-analysis-section, .market-highlights');

            if (parent && parent.classList.contains('market-report-header-section')) {
                icon.style.color = 'white !important';
            } else if (parent && (parent.classList.contains('market-analysis-section') || parent.classList.contains('market-highlights'))) {
                icon.style.color = '#4CAF50 !important';
            } else {
                icon.style.color = '#4CAF50 !important';
            }

            icon.setAttribute('data-forced-icon-color', icon.style.color);
            console.log('[商圈分析] 强制图标色:', icon.className, icon.style.color);
        });

        // 处理SVG图标
        const svgs = element.querySelectorAll('svg');
        svgs.forEach(svg => {
            svg.style.fill = '#4CAF50 !important';
            svg.style.stroke = '#4CAF50 !important';
            svg.setAttribute('data-forced-svg-color', '#4CAF50');
        });
    }

    /**
     * 强制应用特定元素的颜色样式
     */
    forceSpecificElementColors(element) {
        console.log('[商圈分析] 🎨 强制应用特定元素颜色');

        // 1. 报告头部 - 绿色渐变背景 + 白色文字
        const headerSection = element.querySelector('.market-report-header-section');
        if (headerSection) {
            headerSection.style.background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%) !important';
            headerSection.style.backgroundColor = '#4CAF50 !important';
            headerSection.style.color = 'white !important';

            // 头部内的所有文字都设为白色
            const headerTexts = headerSection.querySelectorAll('*');
            headerTexts.forEach(text => {
                text.style.color = 'white !important';
            });

            console.log('[商圈分析] 强制设置报告头部颜色');
        }

        // 2. 元数据项 - 半透明白色背景 + 白色文字
        const metaItems = element.querySelectorAll('.market-meta-item');
        metaItems.forEach(item => {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.1) !important';
            item.style.color = 'white !important';
            item.style.backdropFilter = 'none !important';

            // 元数据项内的文字
            const metaTexts = item.querySelectorAll('*');
            metaTexts.forEach(text => {
                text.style.color = 'white !important';
            });
        });

        // 3. 分析维度 - 浅灰背景 + 绿色左边框 + 深色文字
        const analysisSections = element.querySelectorAll('.market-analysis-section');
        analysisSections.forEach(section => {
            section.style.backgroundColor = '#f8f9fa !important';
            section.style.borderLeft = '4px solid #4CAF50 !important';
            section.style.color = '#333 !important';

            // 分析维度标题
            const title = section.querySelector('h3, .market-analysis-title');
            if (title) {
                title.style.color = '#4CAF50 !important';
                title.style.borderBottom = '2px solid #4CAF50 !important';
            }
        });

        // 4. 关键要点 - 浅绿背景 + 绿色左边框 + 深绿文字
        const keyPoints = element.querySelectorAll('.market-key-points, .market-highlights');
        keyPoints.forEach(point => {
            point.style.backgroundColor = '#e8f5e8 !important';
            point.style.borderLeft = '4px solid #4CAF50 !important';
            point.style.color = '#333 !important';

            // 关键要点标题
            const title = point.querySelector('.market-highlights-title, h4');
            if (title) {
                title.style.color = '#2E7D32 !important';
            }
        });

        // 5. 评分圆圈 - 绿色背景 + 白色文字 + 金色评分
        const scoreCircle = element.querySelector('.market-score-circle');
        if (scoreCircle) {
            scoreCircle.style.background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%) !important';
            scoreCircle.style.color = 'white !important';

            const scoreNumber = scoreCircle.querySelector('.market-score-number');
            if (scoreNumber) {
                scoreNumber.style.color = '#FFD700 !important';
                scoreNumber.style.fontWeight = 'bold !important';
            }
        }

        // 6. 按钮颜色
        const buttons = element.querySelectorAll('.market-btn-primary');
        buttons.forEach(btn => {
            btn.style.backgroundColor = '#4CAF50 !important';
            btn.style.color = 'white !important';
            btn.style.borderColor = '#4CAF50 !important';
        });

        // 7. 结论区域 - 浅绿背景
        const conclusionSection = element.querySelector('.market-conclusion-section');
        if (conclusionSection) {
            conclusionSection.style.backgroundColor = '#f0f8f0 !important';
            conclusionSection.style.borderTop = '3px solid #4CAF50 !important';
            conclusionSection.style.color = '#333 !important';
        }

        console.log('[商圈分析] ✅ 特定元素颜色强制应用完成');
    }

    /**
     * 清理所有强制颜色样式
     */
    cleanupAllColors(element) {
        console.log('[商圈分析] 🧹 清理所有强制颜色样式');

        // 清理所有强制颜色相关的数据属性
        const forcedElements = element.querySelectorAll(`
            [data-forced-bg],
            [data-forced-bg-img],
            [data-forced-color],
            [data-forced-default-color],
            [data-forced-border],
            [data-forced-icon-color],
            [data-forced-svg-color]
        `);

        forcedElements.forEach(el => {
            // 移除所有强制颜色标记
            el.removeAttribute('data-forced-bg');
            el.removeAttribute('data-forced-bg-img');
            el.removeAttribute('data-forced-color');
            el.removeAttribute('data-forced-default-color');
            el.removeAttribute('data-forced-border');
            el.removeAttribute('data-forced-icon-color');
            el.removeAttribute('data-forced-svg-color');

            // 注意：不移除style属性，因为可能有其他重要样式
        });

        console.log('[商圈分析] ✅ 强制颜色样式清理完成');
    }

    /**
     * 处理错误
     */
    handleError(error) {
        console.error('[商圈分析] 应用错误:', error);
        
        // 显示错误信息
        this.showErrorMessage(error.message || '发生未知错误');
        
        // 如果在报告生成过程中出错，返回输入界面
        if (this.currentSection === 'report') {
            this.showInputSection();
        }
    }
    
    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    
    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `market-message market-message-${type}`;
        messageDiv.textContent = message;
        
        // 添加样式
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    /**
     * 保存到历史记录
     */
    saveToHistory(marketData, reportData) {
        try {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                marketData,
                reportData
            };
            
            let history = JSON.parse(localStorage.getItem('marketAnalysisHistory') || '[]');
            history.unshift(historyItem);
            
            // 只保留最近10条记录
            history = history.slice(0, 10);
            
            localStorage.setItem('marketAnalysisHistory', JSON.stringify(history));
            console.log('[商圈分析] 已保存到历史记录');
        } catch (error) {
            console.error('[商圈分析] 保存历史记录失败:', error);
        }
    }
    
    /**
     * 加载历史数据
     */
    loadHistoryData() {
        try {
            const history = JSON.parse(localStorage.getItem('marketAnalysisHistory') || '[]');
            console.log(`[商圈分析] 加载了 ${history.length} 条历史记录`);
            // TODO: 实现历史记录UI显示
        } catch (error) {
            console.error('[商圈分析] 加载历史记录失败:', error);
        }
    }
    
    /**
     * 获取应用状态
     */
    getAppStatus() {
        return {
            currentSection: this.currentSection,
            hasMarketData: !!this.marketData,
            hasReportData: !!this.reportData,
            isLoading: document.getElementById('market-loading-overlay')?.style.display === 'flex'
        };
    }

    /**
     * 提取文档文本内容
     * @param {Object} fileContent - 文件内容对象
     * @returns {string} - 提取的文本内容
     */
    extractDocumentText(fileContent) {
        if (!fileContent) return '';

        console.log('[商圈分析] 🔍 提取文档文本，文件类型:', fileContent.type);

        try {
            // 根据文件类型处理
            if (fileContent.type.startsWith('text/')) {
                // 纯文本文件
                return fileContent.content;
            } else if (fileContent.type.startsWith('image/')) {
                // 图片文件 - 返回文件信息供AI分析
                return `这是一个图片文件：${fileContent.name}，文件大小：${this.formatFileSize(fileContent.size)}。请分析图片中包含的商圈竞争对手信息。`;
            } else if (fileContent.type === 'application/pdf') {
                // PDF文件 - 返回文件信息供AI分析
                return `这是一个PDF文件：${fileContent.name}，文件大小：${this.formatFileSize(fileContent.size)}。请分析PDF中包含的商圈竞争对手信息。`;
            } else if (fileContent.type.includes('excel') || fileContent.type.includes('spreadsheet')) {
                // Excel文件 - 返回文件信息供AI分析
                return `这是一个Excel文件：${fileContent.name}，文件大小：${this.formatFileSize(fileContent.size)}。请分析Excel中包含的商圈竞争对手信息，包括店铺名称、产品、价格等数据。`;
            } else if (fileContent.type.includes('word') || fileContent.type.includes('document')) {
                // Word文件 - 返回文件信息供AI分析
                return `这是一个Word文档：${fileContent.name}，文件大小：${this.formatFileSize(fileContent.size)}。请分析文档中包含的商圈竞争对手信息。`;
            } else {
                // 其他文件类型
                return `这是一个文件：${fileContent.name}（${fileContent.type}），文件大小：${this.formatFileSize(fileContent.size)}。请分析文件中包含的商圈竞争对手信息。`;
            }
        } catch (error) {
            console.error('[商圈分析] 文档文本提取失败:', error);
            return `文档：${fileContent.name}，无法提取文本内容，请手动描述文档中的竞争对手信息。`;
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} - 格式化的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 当DOM加载完成后初始化商圈分析应用
document.addEventListener('DOMContentLoaded', function() {
    // 确保在品牌分析应用之后初始化，避免冲突
    setTimeout(() => {
        if (typeof MarketAnalysisApp !== 'undefined') {
            window.marketAnalysisApp = new MarketAnalysisApp();
            console.log('[商圈分析] 商圈调研分析应用已启动');
        } else {
            console.error('[商圈分析] MarketAnalysisApp类未定义');
        }
    }, 100);
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketAnalysisApp;
}
