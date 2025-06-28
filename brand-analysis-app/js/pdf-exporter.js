/**
 * PDF导出器
 * 负责将HTML报告转换为PDF文件并下载
 */

class PDFExporter {
    constructor() {
        this.isExporting = false;
        this.defaultOptions = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'brand-analysis-report.pdf',
            image: {
                type: 'jpeg',
                quality: 1.0
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                letterRendering: true,
                logging: true,
                width: 800,
                height: null,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 800,
                windowHeight: 600
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait',
                compress: false,
                precision: 2
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy']
            }
        };
    }
    
    /**
     * 导出HTML元素为PDF - 使用改进的分页方案
     * @param {string|HTMLElement} element - 要导出的元素ID或元素本身
     * @param {string} filename - 文件名
     * @param {Object} options - 导出选项
     */
    async exportToPDF(element, filename = null, options = {}) {
        if (this.isExporting) {
            throw new Error('正在导出中，请稍候...');
        }

        // 检查html2canvas和jsPDF库是否加载
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas库未加载，请检查是否正确引入');
        }

        // 检查jsPDF库（支持多种引入方式）
        const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
        if (!jsPDFClass) {
            throw new Error('jsPDF库未加载，请检查是否正确引入');
        }

        this.isExporting = true;

        try {
            console.log('开始PDF导出...');

            // 获取要导出的元素
            const targetElement = typeof element === 'string'
                ? document.getElementById(element)
                : element;

            if (!targetElement) {
                throw new Error(`未找到要导出的元素: ${element}`);
            }

            // 检查元素是否有内容
            if (!targetElement.innerHTML.trim()) {
                throw new Error('要导出的元素内容为空，请先生成报告');
            }

            console.log('目标元素:', targetElement);
            console.log('元素内容长度:', targetElement.innerHTML.length);

            // 显示导出进度
            this.showExportProgress();

            // 使用新的分页PDF导出方法
            await this.exportToPDFWithPagination(targetElement, filename);

            console.log('PDF导出成功');
            this.showExportSuccess();

        } catch (error) {
            console.error('PDF导出失败:', error);
            this.showExportError(error.message);
            throw error;
        } finally {
            this.isExporting = false;
            this.hideExportProgress();
        }
    }

    /**
     * 使用分页方案导出PDF
     * @param {HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     */
    async exportToPDFWithPagination(element, filename) {
        return new Promise((resolve, reject) => {
            // 使用html2canvas生成canvas
            html2canvas(element, {
                scale: 2, // 提高清晰度
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight
            }).then(canvas => {
                try {
                    const contentWidth = canvas.width;
                    const contentHeight = canvas.height;

                    // A4纸的尺寸 [595.28, 841.89] points
                    const a4Width = 595.28;
                    const a4Height = 841.89;

                    // 计算PDF中图片的尺寸
                    const imgWidth = a4Width;
                    const imgHeight = (a4Width / contentWidth) * contentHeight;

                    // 一页PDF显示html页面生成的canvas高度
                    const pageHeight = (contentWidth / a4Width) * a4Height;

                    // 未生成pdf的html页面高度
                    let leftHeight = contentHeight;

                    // 页面偏移
                    let position = 0;

                    // 将canvas转换为图片数据
                    const pageData = canvas.toDataURL('image/jpeg', 1.0);

                    // 创建PDF实例（兼容不同的jsPDF引入方式）
                    const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
                    const pdf = new jsPDFClass('portrait', 'pt', 'a4');

                    // 当内容未超过pdf一页显示的范围，无需分页
                    if (leftHeight < pageHeight) {
                        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
                    } else {
                        // 分页处理
                        while (leftHeight > 0) {
                            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
                            leftHeight -= pageHeight;
                            position -= a4Height;

                            // 避免添加空白页
                            if (leftHeight > 0) {
                                pdf.addPage();
                            }
                        }
                    }

                    // 保存PDF
                    pdf.save(filename || this.generateFileName());
                    resolve();

                } catch (error) {
                    reject(error);
                }
            }).catch(error => {
                reject(new Error('html2canvas渲染失败: ' + error.message));
            });
        });
    }

    /**
     * 创建简化的PDF内容
     * @param {HTMLElement} element - 原始元素
     * @returns {HTMLElement} - 简化的PDF元素
     */
    createSimplePDFContent(element) {
        console.log('创建简化PDF内容，原始元素:', element);
        console.log('原始元素内容长度:', element.innerHTML.length);

        // 创建新的容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            background: white !important;
            padding: 40px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: black !important;
        `;

        // 提取并重建内容
        const content = this.extractAndRebuildContent(element);

        if (!content || content.trim().length === 0) {
            console.error('提取的内容为空！');
            // 创建备用内容
            const fallbackContent = `
                <h1 style="color: black;">品牌定位分析报告</h1>
                <p style="color: black;">报告内容提取失败，这是备用内容。</p>
                <p style="color: black;">原始内容长度: ${element.innerHTML.length}</p>
                <p style="color: black;">原始内容预览: ${element.textContent.substring(0, 200)}...</p>
            `;
            container.innerHTML = fallbackContent;
        } else {
            container.innerHTML = content;
        }

        console.log('最终PDF容器内容长度:', container.innerHTML.length);
        console.log('最终PDF容器内容预览:', container.innerHTML.substring(0, 300));

        document.body.appendChild(container);
        return container;
    }

    /**
     * 提取并重建内容
     * @param {HTMLElement} element - 原始元素
     * @returns {string} - 重建的HTML内容
     */
    extractAndRebuildContent(element) {
        let html = '';

        console.log('开始提取内容，元素:', element);
        console.log('元素HTML:', element.innerHTML.substring(0, 500));

        // 提取报告标题 - 更灵活的选择器
        const titleSection = element.querySelector('.report-title-section');
        if (titleSection) {
            const title = titleSection.querySelector('.report-title, h1');
            const subtitle = titleSection.querySelector('.report-subtitle');
            const date = titleSection.querySelector('.report-date');

            if (title) {
                html += `<h1 style="color: black; font-size: 24px; text-align: center; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 10px;">${title.textContent}</h1>`;
            }
            if (subtitle) {
                html += `<p style="color: black; text-align: center; margin-bottom: 5px; font-size: 12px;">${subtitle.textContent}</p>`;
            }
            if (date) {
                html += `<p style="color: black; text-align: center; margin-bottom: 20px; font-size: 12px;">${date.textContent}</p>`;
            }
        } else {
            // 备用方案：查找任何h1标题
            const title = element.querySelector('h1');
            if (title) {
                html += `<h1 style="color: black; font-size: 24px; text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px;">${title.textContent}</h1>`;
            }
        }

        // 提取店铺信息
        const storeInfo = element.querySelector('.store-info');
        if (storeInfo) {
            html += '<div style="background: #f9f9f9; border: 1px solid black; padding: 15px; margin: 20px 0;">';

            const storeTitle = storeInfo.querySelector('h3');
            if (storeTitle) {
                html += `<h2 style="color: black; font-size: 18px; margin-bottom: 10px;">${storeTitle.textContent}</h2>`;
            }

            const infoItems = storeInfo.querySelectorAll('.info-item');
            if (infoItems.length > 0) {
                infoItems.forEach(item => {
                    const label = item.querySelector('.info-label');
                    const value = item.querySelector('.info-value');
                    if (label && value) {
                        html += `<p style="color: black; margin: 5px 0;"><strong>${label.textContent}</strong>${value.textContent}</p>`;
                    }
                });
            } else {
                // 备用方案：提取所有文本内容
                const allText = storeInfo.textContent.trim();
                if (allText) {
                    html += `<p style="color: black; margin: 5px 0;">${allText}</p>`;
                }
            }
            html += '</div>';
        }

        // 提取分析区块 - 更灵活的处理
        const sections = element.querySelectorAll('.analysis-section');
        console.log('找到分析区块数量:', sections.length);

        if (sections.length > 0) {
            sections.forEach((section, index) => {
                console.log(`处理第${index + 1}个分析区块:`, section.textContent.substring(0, 100));

                const sectionTitle = section.querySelector('.section-title, h2, h3');

                html += '<div style="border: 1px solid black; padding: 15px; margin: 15px 0; page-break-inside: avoid;">';

                if (sectionTitle) {
                    html += `<h2 style="color: #1e88e5; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid black; padding-bottom: 5px;">${sectionTitle.textContent}</h2>`;
                }

                const lists = section.querySelectorAll('ul, ol');
                if (lists.length > 0) {
                    lists.forEach(list => {
                        html += '<ul style="margin: 10px 0; padding-left: 20px;">';
                        const items = list.querySelectorAll('li');
                        items.forEach(item => {
                            html += `<li style="color: black; margin: 5px 0; line-height: 1.5;">${item.textContent}</li>`;
                        });
                        html += '</ul>';
                    });
                } else {
                    // 如果没有列表，直接提取文本内容
                    const textContent = section.textContent.replace(sectionTitle ? sectionTitle.textContent : '', '').trim();
                    if (textContent) {
                        html += `<p style="color: black; margin: 10px 0; line-height: 1.5;">${textContent}</p>`;
                    }
                }

                html += '</div>';
            });
        } else {
            // 如果没有找到标准的分析区块，尝试提取所有内容
            console.log('未找到标准分析区块，尝试提取所有内容');
            const allContent = element.textContent.trim();
            if (allContent) {
                html += `<div style="border: 1px solid black; padding: 15px; margin: 15px 0;">`;
                html += `<p style="color: black; line-height: 1.5;">${allContent}</p>`;
                html += `</div>`;
            }
        }

        console.log('提取的HTML长度:', html.length);
        console.log('提取的HTML预览:', html.substring(0, 300));

        return html;
    }

    /**
     * 准备PDF专用内容
     * @param {HTMLElement} element - 原始元素
     * @returns {HTMLElement} - PDF专用元素
     */
    async preparePDFContent(element) {
        // 克隆元素
        const clone = element.cloneNode(true);

        // 创建PDF容器
        const container = document.createElement('div');
        container.className = 'pdf-container';
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 800px;
            background: white !important;
            padding: 40px !important;
            font-family: 'Microsoft YaHei', Arial, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            color: #333 !important;
        `;

        // 加载PDF专用样式
        await this.loadPDFStyles();

        // 应用PDF专用样式类
        clone.className = 'pdf-content';

        // 应用内联样式
        this.applyPDFStyles(clone);

        container.appendChild(clone);
        document.body.appendChild(container);

        return container;
    }

    /**
     * 加载PDF专用样式
     */
    async loadPDFStyles() {
        return new Promise((resolve) => {
            // 检查是否已经加载了PDF样式
            if (document.querySelector('link[href*="pdf-styles.css"]')) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/pdf-styles.css';
            link.onload = resolve;
            link.onerror = resolve; // 即使加载失败也继续
            document.head.appendChild(link);
        });
    }

    /**
     * 优化的打印PDF导出方法
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     */
    async exportToPDFViaPrint(element, filename = null) {
        try {
            const targetElement = typeof element === 'string'
                ? document.getElementById(element)
                : element;

            if (!targetElement) {
                throw new Error(`未找到要导出的元素: ${element}`);
            }

            // 显示用户友好的提示
            const userConfirm = confirm(
                '将使用浏览器打印功能生成PDF\n\n' +
                '操作步骤：\n' +
                '1. 点击"确定"打开打印预览\n' +
                '2. 在打印对话框中选择"另存为PDF"\n' +
                '3. 选择保存位置完成导出\n\n' +
                '是否继续？'
            );

            if (!userConfirm) {
                throw new Error('用户取消了PDF导出操作');
            }

            // 创建新窗口
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (!printWindow) {
                throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
            }

            // 构建优化的打印页面
            const printHTML = `
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${filename || '品牌定位分析报告'}</title>
                    <style>
                        /* 通用样式 */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            font-family: 'Microsoft YaHei', 'SimSun', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background: white;
                            padding: 20px;
                        }

                        /* 打印专用样式 */
                        @media print {
                            body {
                                margin: 0;
                                padding: 15mm;
                                font-size: 12pt;
                                line-height: 1.5;
                            }

                            * {
                                color: black !important;
                                background: white !important;
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }

                            .report-title {
                                font-size: 20pt;
                                text-align: center;
                                border-bottom: 2pt solid black;
                                padding-bottom: 10pt;
                                margin-bottom: 15pt;
                                font-weight: bold;
                            }

                            .report-subtitle, .report-date {
                                text-align: center;
                                font-size: 10pt;
                                margin-bottom: 8pt;
                            }

                            .store-info {
                                border: 1pt solid black;
                                padding: 10pt;
                                margin: 15pt 0;
                                background: #f8f8f8 !important;
                            }

                            .store-info h3 {
                                font-size: 14pt;
                                border-bottom: 1pt solid black;
                                padding-bottom: 5pt;
                                margin-bottom: 8pt;
                            }

                            .analysis-section {
                                border: 1pt solid black;
                                padding: 10pt;
                                margin: 12pt 0;
                                page-break-inside: avoid;
                            }

                            .section-title {
                                font-size: 14pt;
                                font-weight: bold;
                                border-bottom: 1pt solid black;
                                padding-bottom: 5pt;
                                margin-bottom: 8pt;
                            }

                            ul {
                                margin: 8pt 0;
                                padding-left: 15pt;
                            }

                            li {
                                margin: 3pt 0;
                                line-height: 1.4;
                            }

                            .info-item {
                                margin: 5pt 0;
                            }

                            .info-label {
                                font-weight: bold;
                            }
                        }

                        /* 屏幕显示样式 */
                        @media screen {
                            .report-title {
                                font-size: 24px;
                                text-align: center;
                                border-bottom: 2px solid #1976d2;
                                padding-bottom: 10px;
                                margin-bottom: 20px;
                                color: #1976d2;
                            }

                            .report-subtitle, .report-date {
                                text-align: center;
                                color: #666;
                                margin-bottom: 10px;
                            }

                            .store-info {
                                background: #f9f9f9;
                                border: 1px solid #ddd;
                                padding: 15px;
                                margin: 20px 0;
                                border-radius: 5px;
                            }

                            .store-info h3 {
                                color: #1976d2;
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 8px;
                                margin-bottom: 12px;
                            }

                            .analysis-section {
                                border: 1px solid #ddd;
                                padding: 15px;
                                margin: 15px 0;
                                border-radius: 5px;
                            }

                            .section-title {
                                color: #1976d2;
                                font-size: 18px;
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 8px;
                                margin-bottom: 12px;
                            }

                            .print-instruction {
                                background: #e3f2fd;
                                border: 1px solid #1976d2;
                                padding: 15px;
                                margin-bottom: 20px;
                                border-radius: 5px;
                                text-align: center;
                            }
                        }

                        @media print {
                            .print-instruction {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-instruction">
                        <strong>打印说明：</strong>请按 Ctrl+P (Windows) 或 Cmd+P (Mac) 打开打印对话框，然后选择"另存为PDF"
                    </div>
                    ${this.extractAndRebuildContent(targetElement)}
                </body>
                </html>
            `;

            printWindow.document.write(printHTML);
            printWindow.document.close();

            // 等待页面加载完成
            printWindow.onload = () => {
                setTimeout(() => {
                    // 自动打开打印对话框
                    printWindow.print();

                    // 监听打印完成事件
                    printWindow.onafterprint = () => {
                        setTimeout(() => {
                            printWindow.close();
                        }, 1000);
                    };
                }, 500);
            };

            return true;

        } catch (error) {
            console.error('打印导出失败:', error);
            throw error;
        }
    }

    /**
     * HTML → JPG → PDF 导出方法
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     */
    async exportToPDFWithFallback(element, filename = null) {
        console.log('使用 HTML → JPG → PDF 方案导出');

        try {
            // 首先尝试 HTML → JPG → PDF 方案
            await this.exportHTMLToJPGToPDF(element, filename);
        } catch (error) {
            console.warn('HTML→JPG→PDF 导出失败，尝试打印方案:', error);

            try {
                // 备用方案：打印功能
                await this.exportToPDFViaPrint(element, filename);
            } catch (printError) {
                console.error('打印导出也失败:', printError);

                // 最后备用：简化文本PDF
                try {
                    console.log('尝试简化文本PDF导出');
                    await this.exportSimplePDF(element, filename);
                } catch (simpleError) {
                    console.error('所有PDF导出方案都失败了:', simpleError);
                    throw new Error('PDF导出功能暂时不可用，请稍后重试');
                }
            }
        }
    }

    /**
     * HTML → JPG → PDF 核心方法
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     */
    async exportHTMLToJPGToPDF(element, filename = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const targetElement = typeof element === 'string'
                    ? document.getElementById(element)
                    : element;

                if (!targetElement) {
                    throw new Error(`未找到要导出的元素: ${element}`);
                }

                console.log('开始 HTML → JPG → PDF 转换...');

                // 第一步：HTML → JPG (使用html2canvas)
                const canvas = await html2canvas(targetElement, {
                    scale: 2, // 高清晰度
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: targetElement.scrollWidth,
                    height: targetElement.scrollHeight,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight
                });

                console.log('HTML → Canvas 转换完成，尺寸:', canvas.width, 'x', canvas.height);

                // 第二步：Canvas → JPG
                const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95); // 高质量JPEG
                console.log('Canvas → JPEG 转换完成');

                // 第三步：JPG → PDF (使用jsPDF)
                const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
                if (!jsPDFClass) {
                    throw new Error('jsPDF库未加载');
                }

                // 计算PDF尺寸
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                // A4纸尺寸 (mm)
                const a4Width = 210;
                const a4Height = 297;

                // 计算缩放比例，确保图片适合A4纸
                const scaleX = a4Width / (imgWidth * 0.264583); // px to mm conversion
                const scaleY = a4Height / (imgHeight * 0.264583);
                const scale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小

                const finalWidth = imgWidth * 0.264583 * scale;
                const finalHeight = imgHeight * 0.264583 * scale;

                // 创建PDF
                let pdf;
                if (finalHeight > a4Height) {
                    // 如果内容高度超过A4，使用多页
                    pdf = await this.createMultiPagePDF(jpegDataUrl, imgWidth, imgHeight, filename);
                } else {
                    // 单页PDF
                    pdf = new jsPDFClass('portrait', 'mm', 'a4');

                    // 居中放置图片
                    const x = (a4Width - finalWidth) / 2;
                    const y = (a4Height - finalHeight) / 2;

                    pdf.addImage(jpegDataUrl, 'JPEG', x, y, finalWidth, finalHeight);
                }

                console.log('JPEG → PDF 转换完成');

                // 保存PDF
                pdf.save(filename || this.generateFileName());

                console.log('PDF保存完成');
                resolve();

            } catch (error) {
                console.error('HTML → JPG → PDF 转换失败:', error);
                reject(error);
            }
        });
    }

    /**
     * 创建多页PDF
     * @param {string} jpegDataUrl - JPEG图片数据
     * @param {number} imgWidth - 图片宽度
     * @param {number} imgHeight - 图片高度
     * @param {string} filename - 文件名
     */
    async createMultiPagePDF(jpegDataUrl, imgWidth, imgHeight, filename) {
        const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
        const pdf = new jsPDFClass('portrait', 'mm', 'a4');

        // A4纸尺寸 (mm)
        const a4Width = 210;
        const a4Height = 297;
        const margin = 10; // 边距

        // 可用区域
        const availableWidth = a4Width - 2 * margin;
        const availableHeight = a4Height - 2 * margin;

        // 计算图片在PDF中的尺寸
        const scale = availableWidth / (imgWidth * 0.264583);
        const pdfImgWidth = availableWidth;
        const pdfImgHeight = imgHeight * 0.264583 * scale;

        // 计算需要多少页
        const pageHeight = availableHeight;
        const totalPages = Math.ceil(pdfImgHeight / pageHeight);

        console.log(`创建多页PDF，共 ${totalPages} 页`);

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                pdf.addPage();
            }

            // 计算当前页的Y偏移
            const yOffset = -page * pageHeight;

            pdf.addImage(
                jpegDataUrl,
                'JPEG',
                margin,
                margin + yOffset,
                pdfImgWidth,
                pdfImgHeight
            );
        }

        return pdf;
    }

    /**
     * 简化的PDF导出方法 - 直接使用文本内容
     * @param {string|HTMLElement} element - 要导出的元素
     * @param {string} filename - 文件名
     */
    async exportSimplePDF(element, filename = null) {
        try {
            const targetElement = typeof element === 'string'
                ? document.getElementById(element)
                : element;

            if (!targetElement) {
                throw new Error(`未找到要导出的元素: ${element}`);
            }

            // 创建PDF实例（兼容不同的jsPDF引入方式）
            const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
            const pdf = new jsPDFClass('portrait', 'pt', 'a4');

            // 设置字体和样式
            pdf.setFont('helvetica');
            pdf.setFontSize(12);

            // 页面参数
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const margin = 40;
            const lineHeight = 16;
            const maxWidth = pageWidth - 2 * margin;

            let yPosition = margin + 20;

            // 提取并处理文本内容
            const content = this.extractTextContent(targetElement);

            // 添加标题
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            const title = content.title || '品牌定位分析报告';
            pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 30;

            // 添加日期
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const date = new Date().toLocaleString('zh-CN');
            pdf.text(`生成时间：${date}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 30;

            // 添加内容
            pdf.setFontSize(12);

            content.sections.forEach(section => {
                // 检查是否需要新页面
                if (yPosition > pageHeight - margin - 50) {
                    pdf.addPage();
                    yPosition = margin + 20;
                }

                // 添加章节标题
                if (section.title) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(14);
                    const titleLines = pdf.splitTextToSize(section.title, maxWidth);
                    titleLines.forEach(line => {
                        if (yPosition > pageHeight - margin - 20) {
                            pdf.addPage();
                            yPosition = margin + 20;
                        }
                        pdf.text(line, margin, yPosition);
                        yPosition += lineHeight + 4;
                    });
                    yPosition += 10;
                }

                // 添加章节内容
                if (section.content) {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(12);
                    const contentLines = pdf.splitTextToSize(section.content, maxWidth);
                    contentLines.forEach(line => {
                        if (yPosition > pageHeight - margin - 20) {
                            pdf.addPage();
                            yPosition = margin + 20;
                        }
                        pdf.text(line, margin, yPosition);
                        yPosition += lineHeight;
                    });
                    yPosition += 15;
                }
            });

            // 保存PDF
            pdf.save(filename || this.generateFileName());

        } catch (error) {
            throw new Error('简化PDF导出失败: ' + error.message);
        }
    }

    /**
     * 提取文本内容
     * @param {HTMLElement} element - 要提取的元素
     * @returns {Object} - 提取的内容结构
     */
    extractTextContent(element) {
        const content = {
            title: '',
            sections: []
        };

        // 提取标题
        const titleElement = element.querySelector('.report-title, h1');
        if (titleElement) {
            content.title = titleElement.textContent.trim();
        }

        // 提取店铺信息
        const storeInfo = element.querySelector('.store-info');
        if (storeInfo) {
            content.sections.push({
                title: '店铺基本信息',
                content: storeInfo.textContent.trim().replace(/\s+/g, ' ')
            });
        }

        // 提取分析区块
        const sections = element.querySelectorAll('.analysis-section');
        sections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title, h2, h3');
            const sectionContent = section.textContent.trim().replace(/\s+/g, ' ');

            content.sections.push({
                title: sectionTitle ? sectionTitle.textContent.trim() : '',
                content: sectionContent
            });
        });

        // 如果没有找到标准结构，提取所有文本
        if (content.sections.length === 0) {
            const allText = element.textContent.trim().replace(/\s+/g, ' ');
            if (allText) {
                content.sections.push({
                    title: '报告内容',
                    content: allText
                });
            }
        }

        return content;
    }

    /**
     * 准备导出内容
     * @param {HTMLElement} element - 原始元素
     * @returns {HTMLElement} - 准备好的导出元素
     */
    async prepareExportContent(element) {
        // 克隆元素以避免修改原始内容
        const clone = element.cloneNode(true);
        
        // 创建临时容器
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm'; // A4宽度
        container.style.backgroundColor = 'white';
        container.style.padding = '20mm';
        container.style.fontFamily = '"Microsoft YaHei", Arial, sans-serif';
        container.style.fontSize = '14px';
        container.style.lineHeight = '1.6';
        container.style.color = '#333';
        
        // 添加PDF专用样式
        this.applyPDFStyles(clone);
        
        container.appendChild(clone);
        document.body.appendChild(container);
        
        // 等待图片加载（如果有的话）
        await this.waitForImages(container);
        
        return container;
    }
    
    /**
     * 应用PDF专用样式
     * @param {HTMLElement} element - 要应用样式的元素
     */
    applyPDFStyles(element) {
        // 为所有元素强制应用基础样式
        const allElements = [element, ...element.querySelectorAll('*')];
        allElements.forEach(el => {
            // 移除动画和过渡
            el.style.animation = 'none !important';
            el.style.transition = 'none !important';
            el.style.transform = 'none !important';
            el.style.opacity = '1 !important';
            el.style.visibility = 'visible !important';

            // 确保文本颜色
            if (el.tagName !== 'DIV' || el.textContent.trim()) {
                el.style.color = '#333 !important';
            }

            // 移除背景图片和特效
            el.style.backgroundImage = 'none !important';
            el.style.boxShadow = 'none !important';
            el.style.textShadow = 'none !important';
            el.style.filter = 'none !important';
        });

        // 特别处理文本元素
        const textElements = element.querySelectorAll('p, span, div, li, h1, h2, h3, h4, h5, h6, strong, b, em, i');
        textElements.forEach(el => {
            el.style.color = '#333 !important';
            el.style.fontSize = el.style.fontSize || '14px !important';
            el.style.fontFamily = "'Microsoft YaHei', Arial, sans-serif !important";
        });

        // 处理列表项
        const listItems = element.querySelectorAll('li');
        listItems.forEach(item => {
            item.style.display = 'list-item !important';
            item.style.listStyle = 'disc !important';
            item.style.marginLeft = '20px !important';
        });

        // 处理标题
        const titles = element.querySelectorAll('h1, h2, h3, .section-title');
        titles.forEach(title => {
            title.style.color = '#1e88e5 !important';
            title.style.fontWeight = 'bold !important';
            title.style.borderBottom = '1px solid #333 !important';
            title.style.paddingBottom = '5px !important';
            title.style.marginBottom = '10px !important';
        });

        // 处理区块
        const sections = element.querySelectorAll('.analysis-section');
        sections.forEach(section => {
            section.style.border = '1px solid #333 !important';
            section.style.padding = '15px !important';
            section.style.marginBottom = '15px !important';
            section.style.backgroundColor = 'white !important';
        });

        // 处理店铺信息
        const storeInfo = element.querySelector('.store-info');
        if (storeInfo) {
            storeInfo.style.backgroundColor = '#f8f9fa !important';
            storeInfo.style.border = '1px solid #333 !important';
            storeInfo.style.padding = '15px !important';
            storeInfo.style.marginBottom = '20px !important';
        }
    }
    
    /**
     * 等待图片加载完成
     * @param {HTMLElement} container - 容器元素
     */
    async waitForImages(container) {
        const images = container.querySelectorAll('img');
        if (images.length === 0) return;
        
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve; // 即使加载失败也继续
                }
            });
        });
        
        await Promise.all(imagePromises);
    }
    
    /**
     * 生成文件名
     * @returns {string} - 生成的文件名
     */
    generateFileName() {
        return `品牌定位设计.pdf`;
    }
    
    /**
     * 显示导出进度
     */
    showExportProgress() {
        // 创建进度提示
        const progressHTML = `
            <div id="pdf-export-progress" class="loading-overlay" style="display: flex;">
                <div class="loading-content">
                    <div class="loading-spinner-large"></div>
                    <p class="loading-text">正在生成PDF文件...</p>
                    <p class="loading-subtext">请稍候，这可能需要几秒钟</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', progressHTML);
    }
    
    /**
     * 隐藏导出进度
     */
    hideExportProgress() {
        const progressElement = document.getElementById('pdf-export-progress');
        if (progressElement) {
            progressElement.remove();
        }
    }
    
    /**
     * 显示导出成功消息
     */
    showExportSuccess() {
        // TODO: 实现更优雅的成功提示
        console.log('PDF导出成功');
    }
    
    /**
     * 显示导出错误消息
     * @param {string} message - 错误消息
     */
    showExportError(message) {
        // TODO: 实现更优雅的错误提示
        alert('PDF导出失败: ' + message);
    }
    
    /**
     * 检查是否正在导出
     * @returns {boolean} - 是否正在导出
     */
    isExportingPDF() {
        return this.isExporting;
    }
    
    /**
     * 预览PDF（在新窗口中打开）
     * @param {string|HTMLElement} element - 要预览的元素
     */
    async previewPDF(element) {
        try {
            const targetElement = typeof element === 'string' 
                ? document.getElementById(element) 
                : element;
                
            if (!targetElement) {
                throw new Error('未找到要预览的元素');
            }
            
            // 准备预览内容
            const exportElement = await this.prepareExportContent(targetElement);
            
            // 生成PDF blob
            const pdfBlob = await html2pdf()
                .set({
                    ...this.defaultOptions,
                    filename: 'preview.pdf'
                })
                .from(exportElement)
                .outputPdf('blob');
            
            // 在新窗口中打开
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
            
            // 清理临时元素
            if (exportElement.parentNode) {
                exportElement.parentNode.removeChild(exportElement);
            }
            
        } catch (error) {
            console.error('PDF预览失败:', error);
            throw error;
        }
    }
    
    /**
     * 更新默认导出选项
     * @param {Object} options - 新的选项
     */
    updateDefaultOptions(options) {
        this.defaultOptions = {
            ...this.defaultOptions,
            ...options
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExporter;
}
