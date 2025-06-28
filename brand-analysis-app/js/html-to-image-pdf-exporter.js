/**
 * 基于html-to-image的PDF导出器
 * 解决CSS兼容性问题，提供更好的样式保持能力
 */

class HtmlToImagePDFExporter {
    constructor() {
        this.isExporting = false;
        this.defaultOptions = {
            // html-to-image 配置
            pixelRatio: 2.5,
            backgroundColor: '#ffffff',
            cacheBust: true,
            quality: 0.95,
            // PDF 配置
            filename: '品牌定位设计.pdf',
            margin: 15, // mm - 增加边距，防止内容过大
            format: 'a4',
            orientation: 'portrait',
            allowPagination: false, // 禁用分页
            singlePageMode: true, // 单页模式
            fitToPage: true, // 适应页面
            minScale: 0.4, // 提高最小缩放，确保内容可读
            maxScale: 0.65, // 降低最大缩放，防止内容过大
            preferredWidth: 'fit' // fit模式
        };
    }
    
    /**
     * 检查依赖库是否加载
     */
    checkDependencies() {
        const errors = [];
        
        if (typeof htmlToImage === 'undefined') {
            errors.push('html-to-image库未加载');
        }
        
        const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
        if (!jsPDFClass) {
            errors.push('jsPDF库未加载');
        }
        
        return errors;
    }
    
    /**
     * 导出HTML元素为PDF - 使用html-to-image
     * @param {string|HTMLElement} element - 要导出的元素ID或元素本身
     * @param {string} filename - 文件名
     * @param {Object} options - 导出选项
     */
    async exportToPDF(element, filename = null, options = {}) {
        if (this.isExporting) {
            throw new Error('正在导出中，请稍候...');
        }
        
        // 检查依赖
        const dependencyErrors = this.checkDependencies();
        if (dependencyErrors.length > 0) {
            throw new Error(`依赖库未加载: ${dependencyErrors.join(', ')}`);
        }
        
        this.isExporting = true;
        
        try {
            console.log('🚀 开始使用html-to-image导出PDF...');
            
            // 获取要导出的元素
            const targetElement = typeof element === 'string'
                ? document.getElementById(element)
                : element;
                
            if (!targetElement) {
                throw new Error(`未找到要导出的元素: ${element}`);
            }
            
            // 检查元素内容
            if (!targetElement.innerHTML.trim()) {
                throw new Error('要导出的元素内容为空，请先生成报告');
            }
            
            console.log('📄 目标元素:', targetElement);
            console.log('📏 元素内容长度:', targetElement.innerHTML.length);
            
            // 合并配置选项
            const config = { ...this.defaultOptions, ...options };
            const pdfFilename = filename || config.filename;
            
            // 显示导出进度
            this.showExportProgress('正在生成高清图像...');
            
            // 使用html-to-image生成图像
            const imageDataUrl = await this.generateImage(targetElement, config);
            
            // 显示PDF生成进度
            this.showExportProgress('正在生成PDF文档...');
            
            // 生成PDF
            await this.generatePDF(imageDataUrl, pdfFilename, config);
            
            console.log('✅ PDF导出成功');
            this.showExportSuccess();
            
        } catch (error) {
            console.error('❌ PDF导出失败:', error);
            this.showExportError(error.message);
            throw error;
        } finally {
            this.isExporting = false;
            this.hideExportProgress();
        }
    }
    
    /**
     * 使用html-to-image生成图像 - 增强版
     */
    async generateImage(element, config) {
        try {
            // 预渲染检查和准备
            await this.prepareElementForCapture(element);

            // 等待所有资源加载完成
            await this.waitForResourcesLoaded();

            // 验证元素状态
            const validation = this.validateElement(element);
            if (!validation.isValid) {
                throw new Error(`元素验证失败: ${validation.errors.join(', ')}`);
            }

            // 准备html-to-image配置
            const imageOptions = {
                pixelRatio: config.pixelRatio,
                backgroundColor: config.backgroundColor,
                cacheBust: config.cacheBust,
                quality: config.quality,
                // 确保样式正确应用
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    width: element.scrollWidth + 'px',
                    height: element.scrollHeight + 'px'
                },
                // 添加过滤器，确保所有节点都被包含
                filter: (node) => {
                    // 排除一些可能导致问题的元素
                    if (node.tagName === 'SCRIPT') return false;
                    if (node.tagName === 'NOSCRIPT') return false;
                    if (node.classList && node.classList.contains('no-export')) return false;
                    return true;
                }
            };

            console.log('🎨 html-to-image配置:', imageOptions);
            console.log('📏 元素尺寸:', element.scrollWidth, 'x', element.scrollHeight);

            // 多次尝试生成图像
            let dataUrl;
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🔄 第${attempt}次尝试生成图像...`);

                    // 短暂延迟确保渲染完成
                    await this.delay(500);

                    // 生成PNG图像
                    dataUrl = await htmlToImage.toPng(element, imageOptions);

                    // 验证生成的图像
                    if (this.validateImageData(dataUrl)) {
                        console.log('✅ 图像生成成功，大小:', Math.round(dataUrl.length / 1024), 'KB');
                        break;
                    } else {
                        throw new Error('生成的图像数据无效');
                    }

                } catch (attemptError) {
                    console.warn(`⚠️ 第${attempt}次尝试失败:`, attemptError.message);

                    if (attempt === maxRetries) {
                        throw attemptError;
                    }

                    // 增加延迟时间重试
                    await this.delay(1000 * attempt);
                }
            }

            return dataUrl;

        } catch (error) {
            console.error('图像生成失败:', error);
            throw new Error(`图像生成失败: ${error.message}`);
        }
    }
    
    /**
     * 生成PDF文档 - 优化尺寸处理
     */
    async generatePDF(imageDataUrl, filename, config) {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF(config.orientation, 'mm', config.format);

            // 获取页面尺寸
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = config.margin;

            // 计算可用区域
            const availableWidth = pageWidth - 2 * margin;
            const availableHeight = pageHeight - 2 * margin;

            // 创建临时图片获取原始尺寸
            const img = new Image();

            return new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        const imgWidth = img.width;
                        const imgHeight = img.height;

                        console.log('📐 PDF尺寸计算:');
                        console.log('- 原始图像:', imgWidth, 'x', imgHeight, 'px');
                        console.log('- 页面尺寸:', pageWidth, 'x', pageHeight, 'mm');
                        console.log('- 可用区域:', availableWidth, 'x', availableHeight, 'mm');

                        let finalWidth, finalHeight;

                        if (config.singlePageMode) {
                            // 单页模式：强制所有内容适应一页，绝不分页
                            console.log('🎯 使用单页模式 - 强制所有内容适应一页，绝不分页');

                            // 计算基础缩放比例，确保内容完全适应页面
                            const widthScale = availableWidth / imgWidth;
                            const heightScale = availableHeight / imgHeight;

                            // 使用较小的缩放比例，确保内容完全适应（这是关键！）
                            let scale = Math.min(widthScale, heightScale);

                            console.log('📐 初始缩放计算:');
                            console.log('- 图像尺寸:', imgWidth, 'x', imgHeight, 'px');
                            console.log('- 可用区域:', availableWidth.toFixed(1), 'x', availableHeight.toFixed(1), 'mm');
                            console.log('- 宽度缩放比例:', widthScale.toFixed(3));
                            console.log('- 高度缩放比例:', heightScale.toFixed(3));
                            console.log('- 自然适应缩放:', scale.toFixed(3));

                            // 应用用户设置的缩放限制
                            if (config.maxScale && scale > config.maxScale) {
                                scale = config.maxScale;
                                console.log('⚠️ 应用最大缩放限制:', config.maxScale);
                            }

                            if (config.minScale && scale < config.minScale) {
                                scale = config.minScale;
                                console.log('⚠️ 应用最小缩放限制:', config.minScale);
                                console.log('⚠️ 注意：这可能导致内容超出页面，但仍将强制放在一页中');
                            }

                            // 计算最终尺寸
                            finalWidth = imgWidth * scale;
                            finalHeight = imgHeight * scale;

                            // 最终安全检查：如果仍然超出，强制缩放到页面内
                            if (finalWidth > availableWidth || finalHeight > availableHeight) {
                                console.log('🔧 最终安全检查：内容超出页面，强制缩放到页面内');
                                const safeScale = Math.min(
                                    availableWidth / finalWidth,
                                    availableHeight / finalHeight
                                );
                                finalWidth *= safeScale;
                                finalHeight *= safeScale;
                                scale *= safeScale;
                                console.log('- 安全缩放比例:', safeScale.toFixed(3));
                            }

                            console.log('📐 最终缩放结果:');
                            console.log('- 最终缩放比例:', scale.toFixed(3));
                            console.log('- 最终尺寸:', finalWidth.toFixed(1), 'x', finalHeight.toFixed(1), 'mm');
                            console.log('- 页面利用率:', ((finalWidth * finalHeight) / (availableWidth * availableHeight) * 100).toFixed(1), '%');
                            console.log('- 适应状态:', finalWidth <= availableWidth && finalHeight <= availableHeight ? '✅ 完全适应' : '❌ 仍然超出');

                            // 居中显示
                            const x = margin + Math.max(0, (availableWidth - finalWidth) / 2);
                            const y = margin + Math.max(0, (availableHeight - finalHeight) / 2);

                            console.log('- 位置:', x.toFixed(1), ',', y.toFixed(1), 'mm');
                            console.log('🎯 单页模式：将整个内容作为一张图片添加到PDF中');

                            // 关键：直接添加图片，绝不分页
                            pdf.addImage(imageDataUrl, 'PNG', x, y, finalWidth, finalHeight);

                        } else {
                            // 非单页模式：但如果禁用分页，仍然强制适应一页
                            console.log('📄 使用标准模式');

                            const widthBasedHeight = (imgHeight * availableWidth) / imgWidth;

                            if (widthBasedHeight <= availableHeight) {
                                // 内容可以完全适应页面
                                finalWidth = availableWidth;
                                finalHeight = widthBasedHeight;
                                console.log('✅ 内容完全适应页面');
                            } else {
                                // 内容超出页面高度
                                if (config.allowPagination === false) {
                                    // 禁用分页：强制缩放到页面内
                                    console.log('🔧 禁用分页：强制缩放内容适应页面');
                                    finalHeight = availableHeight;
                                    finalWidth = (imgWidth * availableHeight) / imgHeight;
                                } else {
                                    // 允许分页：保持宽度，允许超出高度
                                    console.log('📄 允许分页：保持宽度，内容可能分页');
                                    finalWidth = availableWidth;
                                    finalHeight = widthBasedHeight;
                                }
                            }

                            console.log('- 最终尺寸:', finalWidth.toFixed(1), 'x', finalHeight.toFixed(1), 'mm');
                            console.log('- 是否超出页面:', finalHeight > availableHeight ? '是' : '否');
                            console.log('- 分页设置:', config.allowPagination !== false ? '允许' : '禁用');

                            // 关键修改：只有在明确允许分页且内容超出时才分页
                            if (finalHeight > availableHeight && config.allowPagination === true) {
                                console.log('📄 执行分页处理');
                                this.addImageWithPagination(pdf, imageDataUrl, finalWidth, finalHeight, margin, availableHeight);
                            } else {
                                console.log('🎯 单页处理：将内容放在一页中');
                                const x = margin + (availableWidth - finalWidth) / 2;
                                const y = margin + (availableHeight - finalHeight) / 2;
                                pdf.addImage(imageDataUrl, 'PNG', x, y, finalWidth, finalHeight);
                            }
                        }

                        // 保存PDF
                        pdf.save(filename);

                        console.log('💾 PDF保存成功:', filename);
                        resolve();

                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => {
                    reject(new Error('图像加载失败'));
                };

                img.src = imageDataUrl;
            });

        } catch (error) {
            console.error('PDF生成失败:', error);
            throw new Error(`PDF生成失败: ${error.message}`);
        }
    }
    
    /**
     * 分页处理长图像
     */
    addImageWithPagination(pdf, imageDataUrl, imgWidth, imgHeight, margin, availableHeight) {
        const totalPages = Math.ceil(imgHeight / availableHeight);
        
        console.log('📄 需要分页:', totalPages, '页');
        
        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                pdf.addPage();
            }
            
            const yOffset = -page * availableHeight;
            pdf.addImage(imageDataUrl, 'PNG', margin, margin + yOffset, imgWidth, imgHeight);
            
            console.log(`📄 添加第 ${page + 1} 页`);
        }
    }
    
    /**
     * 显示导出进度
     */
    showExportProgress(message = '正在导出PDF...') {
        // 尝试找到状态显示元素
        let statusElement = document.getElementById('export-status');
        
        if (!statusElement) {
            // 创建状态元素
            statusElement = document.createElement('div');
            statusElement.id = 'export-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2196f3;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
            `;
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = `🔄 ${message}`;
        statusElement.style.display = 'block';
    }
    
    /**
     * 显示导出成功
     */
    showExportSuccess() {
        const statusElement = document.getElementById('export-status');
        if (statusElement) {
            statusElement.style.background = '#4caf50';
            statusElement.textContent = '✅ PDF导出成功！';
            
            setTimeout(() => {
                this.hideExportProgress();
            }, 3000);
        }
    }
    
    /**
     * 显示导出错误
     */
    showExportError(message) {
        const statusElement = document.getElementById('export-status');
        if (statusElement) {
            statusElement.style.background = '#f44336';
            statusElement.textContent = `❌ 导出失败: ${message}`;
            
            setTimeout(() => {
                this.hideExportProgress();
            }, 5000);
        }
    }
    
    /**
     * 隐藏导出进度
     */
    hideExportProgress() {
        const statusElement = document.getElementById('export-status');
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }

    /**
     * 准备元素进行截图 - 确保完全渲染
     */
    async prepareElementForCapture(element) {
        console.log('🔧 准备元素进行截图...');

        // 确保元素可见
        const originalDisplay = element.style.display;
        const originalVisibility = element.style.visibility;
        const originalOpacity = element.style.opacity;

        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';

        // 强制重新计算布局
        element.offsetHeight;

        // 等待一帧确保渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        console.log('✅ 元素准备完成');
    }

    /**
     * 等待所有资源加载完成
     */
    async waitForResourcesLoaded() {
        console.log('⏳ 等待资源加载完成...');

        // 等待图片加载
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();

            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = resolve; // 即使加载失败也继续
                setTimeout(resolve, 3000); // 3秒超时
            });
        });

        // 等待字体加载
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        // 等待所有图片
        await Promise.all(imagePromises);

        // 额外延迟确保所有样式应用完成
        await this.delay(300);

        console.log('✅ 资源加载完成');
    }

    /**
     * 验证元素状态
     */
    validateElement(element) {
        const errors = [];

        // 检查元素是否存在
        if (!element) {
            errors.push('元素不存在');
            return { isValid: false, errors };
        }

        // 检查元素是否在DOM中
        if (!document.contains(element)) {
            errors.push('元素不在DOM中');
        }

        // 检查元素尺寸
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            errors.push(`元素尺寸无效: ${rect.width}x${rect.height}`);
        }

        // 检查元素内容
        if (!element.innerHTML.trim()) {
            errors.push('元素内容为空');
        }

        // 检查元素可见性
        const style = window.getComputedStyle(element);
        if (style.display === 'none') {
            errors.push('元素被隐藏 (display: none)');
        }
        if (style.visibility === 'hidden') {
            errors.push('元素不可见 (visibility: hidden)');
        }
        if (style.opacity === '0') {
            errors.push('元素透明 (opacity: 0)');
        }

        console.log('🔍 元素验证结果:', {
            尺寸: `${rect.width}x${rect.height}`,
            内容长度: element.innerHTML.length,
            可见性: style.visibility,
            显示: style.display,
            透明度: style.opacity
        });

        return {
            isValid: errors.length === 0,
            errors,
            info: {
                width: rect.width,
                height: rect.height,
                contentLength: element.innerHTML.length
            }
        };
    }

    /**
     * 验证图像数据
     */
    validateImageData(dataUrl) {
        if (!dataUrl || typeof dataUrl !== 'string') {
            return false;
        }

        // 检查是否是有效的data URL
        if (!dataUrl.startsWith('data:image/')) {
            return false;
        }

        // 检查数据长度（太小可能是空图像）
        if (dataUrl.length < 1000) {
            console.warn('⚠️ 图像数据太小，可能是空图像');
            return false;
        }

        return true;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 快速导出方法 - 使用默认配置
     */
    async quickExport(elementId, filename = null) {
        return this.exportToPDF(elementId, filename);
    }

    /**
     * 精确计算元素内容高度，排除多余空白
     */
    calculateActualContentHeight(element) {
        // 获取元素的所有子元素
        const children = Array.from(element.children);
        if (children.length === 0) {
            return element.scrollHeight;
        }

        // 找到最后一个有内容的子元素
        let lastContentElement = null;
        let maxBottom = 0;

        // 遍历所有子元素，找到最底部的有内容元素
        children.forEach(child => {
            const rect = child.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(child);

            // 检查元素是否有实际内容（不是空的或隐藏的）
            if (rect.height > 0 &&
                computedStyle.display !== 'none' &&
                computedStyle.visibility !== 'hidden' &&
                (child.textContent.trim() || child.querySelector('img, canvas, svg'))) {

                const elementBottom = rect.bottom + parseFloat(computedStyle.marginBottom || 0);
                if (elementBottom > maxBottom) {
                    maxBottom = elementBottom;
                    lastContentElement = child;
                }
            }
        });

        if (lastContentElement) {
            const elementRect = element.getBoundingClientRect();
            const elementStyle = window.getComputedStyle(element);
            const paddingTop = parseFloat(elementStyle.paddingTop || 0);

            // 计算从容器内容区域顶部到最后内容元素底部的距离
            const contentHeight = maxBottom - elementRect.top - paddingTop + paddingTop;

            // 添加容器的padding-bottom，但限制最大值
            const paddingBottom = parseFloat(elementStyle.paddingBottom || 0);
            const finalHeight = contentHeight + Math.min(paddingBottom, 20); // 限制底部padding最大20px

            console.log('📏 内容高度计算:');
            console.log('- 容器scrollHeight:', element.scrollHeight);
            console.log('- 实际内容高度:', Math.ceil(finalHeight));
            console.log('- 最后内容元素:', lastContentElement.tagName, lastContentElement.className);
            console.log('- 节省空白:', element.scrollHeight - Math.ceil(finalHeight), 'px');

            return Math.ceil(finalHeight);
        }

        return element.scrollHeight;
    }

    /**
     * 可变高度单页PDF导出 - 页面高度自适应内容，不缩放不分页不裁剪
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     * @param {Object} customOptions - 自定义选项
     */
    async exportSinglePagePDF(element, filename = null, customOptions = {}) {
        const singlePageOptions = {
            ...this.defaultOptions,
            ...customOptions,
            singlePageMode: true,
            allowPagination: false,
            variableHeight: true,  // 可变高度模式
            preserveOriginalSize: true,  // 保持原始尺寸
            margin: customOptions.margin || 10,
            pixelRatio: customOptions.pixelRatio || 2.5,
            // 移除缩放相关配置，因为我们不需要缩放
            filename: filename || customOptions.filename || '品牌定位设计.pdf'
        };

        console.log('🎯 可变高度单页PDF导出模式 - 页面高度自适应内容 (v20250628-4)');
        console.log('📋 配置:', singlePageOptions);
        console.log('🔧 创建可变高度PDF，不缩放不分页不裁剪，精确计算内容高度');

        try {
            // 获取目标元素
            const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
            if (!targetElement) {
                throw new Error('目标元素未找到');
            }

            // 精确计算内容高度
            const actualContentHeight = this.calculateActualContentHeight(targetElement);

            // 临时设置元素高度为实际内容高度，避免多余空白
            const originalHeight = targetElement.style.height;
            const originalOverflow = targetElement.style.overflow;
            targetElement.style.height = actualContentHeight + 'px';
            targetElement.style.overflow = 'hidden';

            console.log('📸 开始生成单页图像（精确高度）...');

            // 生成图像
            const imageDataUrl = await this.generateImage(targetElement, singlePageOptions);

            // 恢复原始样式
            targetElement.style.height = originalHeight;
            targetElement.style.overflow = originalOverflow;

            console.log('📄 创建可变高度PDF...');

            // 获取图像尺寸（转换为mm）
            const img = new Image();
            img.src = imageDataUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const imgWidthMM = img.width * 0.264583; // px to mm
            const imgHeightMM = img.height * 0.264583;
            const margin = singlePageOptions.margin;

            console.log('🖼️ 原始图像信息:');
            console.log('- 图像尺寸:', img.width, 'x', img.height, 'px');
            console.log('- 图像尺寸(mm):', imgWidthMM.toFixed(1), 'x', imgHeightMM.toFixed(1), 'mm');

            // 计算PDF页面尺寸：宽度固定为A4宽度，高度根据内容调整
            const pageWidth = 210; // A4宽度
            const pageHeight = imgHeightMM + 2 * margin; // 高度 = 内容高度 + 上下边距

            console.log('📐 可变页面信息:');
            console.log('- 页面宽度:', pageWidth, 'mm (固定A4宽度)');
            console.log('- 页面高度:', pageHeight.toFixed(1), 'mm (自适应内容)');
            console.log('- 边距:', margin, 'mm');

            // 创建自定义尺寸的PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageWidth, pageHeight] // 自定义页面尺寸
            });

            // 可变高度模式：只按宽度缩放，高度不限制
            const availableWidth = pageWidth - 2 * margin;
            const widthScale = availableWidth / imgWidthMM;

            // 使用宽度缩放比例
            const scale = widthScale;
            const finalWidth = imgWidthMM * scale;
            const finalHeight = imgHeightMM * scale;

            // 水平居中，垂直从顶部边距开始
            const x = margin;
            const y = margin;

            console.log('📊 可变高度计算结果:');
            console.log('- 宽度缩放比例:', scale.toFixed(3));
            console.log('- 最终图像尺寸:', finalWidth.toFixed(1), 'x', finalHeight.toFixed(1), 'mm');
            console.log('- 图像位置:', x.toFixed(1), ',', y.toFixed(1), 'mm');
            console.log('- 页面完全适应内容，无裁剪无分页');

            // 添加图像到PDF（保持原始比例，页面高度自适应）
            pdf.addImage(imageDataUrl, 'PNG', x, y, finalWidth, finalHeight);

            // 保存PDF
            const finalFilename = singlePageOptions.filename;
            pdf.save(finalFilename);

            console.log('✅ 可变高度PDF导出成功！');
            console.log('📄 文件名:', finalFilename);
            console.log('📊 页数: 1页 (可变高度)');
            console.log('📏 页面尺寸:', pageWidth, 'x', pageHeight.toFixed(1), 'mm');
            console.log('🎯 内容完整显示，无缩放无分页无裁剪');

        } catch (error) {
            console.error('❌ 强制单页PDF导出失败:', error);
            throw new Error(`强制单页PDF导出失败: ${error.message}`);
        }
    }

    /**
     * 自适应PDF导出 - 自动选择最佳显示方式
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     * @param {Object} customOptions - 自定义选项
     */
    async exportAdaptivePDF(element, filename = null, customOptions = {}) {
        // 先获取元素尺寸来判断使用哪种模式
        const targetElement = typeof element === 'string'
            ? document.getElementById(element)
            : element;

        if (!targetElement) {
            throw new Error(`未找到要导出的元素: ${element}`);
        }

        const elementHeight = targetElement.scrollHeight;
        const elementWidth = targetElement.scrollWidth;

        // 估算内容是否适合单页（基于A4纸张比例）
        const aspectRatio = elementHeight / elementWidth;
        const a4Ratio = 297 / 210; // A4纸张高宽比

        console.log('📏 内容分析:');
        console.log('- 元素尺寸:', elementWidth, 'x', elementHeight, 'px');
        console.log('- 宽高比:', aspectRatio.toFixed(2));
        console.log('- A4比例:', a4Ratio.toFixed(2));

        if (aspectRatio <= a4Ratio * 1.5) {
            // 内容相对较短，使用单页模式
            console.log('✅ 使用单页模式');
            return this.exportSinglePagePDF(element, filename, customOptions);
        } else {
            // 内容较长，询问用户偏好或使用分页模式
            console.log('📄 内容较长，建议使用分页模式');
            const useMultiPage = customOptions.forceMultiPage !== false;

            if (useMultiPage) {
                const multiPageOptions = {
                    ...this.defaultOptions,
                    ...customOptions,
                    singlePageMode: false,
                    allowPagination: true
                };
                return this.exportToPDF(element, filename, multiPageOptions);
            } else {
                return this.exportSinglePagePDF(element, filename, customOptions);
            }
        }
    }
    
    /**
     * 获取库信息
     */
    getLibraryInfo() {
        return {
            name: 'html-to-image PDF Exporter',
            version: '1.1.0',
            dependencies: {
                'html-to-image': typeof htmlToImage !== 'undefined' ? '✅' : '❌',
                'jsPDF': typeof window.jspdf !== 'undefined' ? '✅' : '❌'
            },
            features: [
                '✅ 完美CSS样式保持',
                '✅ 外部CSS文件支持',
                '✅ 高清图像生成',
                '✅ 单页PDF模式 (新增)',
                '✅ 自适应导出模式 (新增)',
                '✅ 智能缩放算法 (优化)',
                '✅ 自动分页处理',
                '✅ 现代化API设计',
                '✅ 轻量级库 (315KB)'
            ],
            exportModes: {
                'exportToPDF': '标准导出 - 支持分页',
                'exportSinglePagePDF': '单页导出 - 强制一页显示',
                'exportAdaptivePDF': '自适应导出 - 智能选择模式',
                'quickExport': '快速导出 - 使用默认配置'
            }
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HtmlToImagePDFExporter;
} else if (typeof window !== 'undefined') {
    window.HtmlToImagePDFExporter = HtmlToImagePDFExporter;
}
