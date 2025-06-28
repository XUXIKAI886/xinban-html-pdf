/**
 * 商圈调研分析 - PDF导出器
 * 负责将商圈分析报告导出为PDF文件
 */

class MarketPDFExporter {
    constructor() {
        this.exportHistory = [];
        this.isExporting = false;
    }
    
    /**
     * 导出商圈分析报告为PDF
     * @param {string} filename - 文件名（可选）
     * @returns {Promise<boolean>} - 导出是否成功
     */
    async exportToPDF(filename = null) {
        if (this.isExporting) {
            console.warn('[商圈分析] PDF导出正在进行中，请稍候...');
            return false;
        }
        
        this.isExporting = true;
        const startTime = Date.now();
        
        try {
            console.log('[商圈分析] 开始导出PDF...');
            
            // 获取报告内容
            const reportElement = document.getElementById('market-report-content');
            if (!reportElement) {
                throw new Error('未找到商圈分析报告内容');
            }
            
            // 生成文件名
            const finalFilename = filename || this.generateFilename();
            
            // 使用html-to-image方案导出
            const success = await this.exportWithHtmlToImage(reportElement, finalFilename);
            
            if (success) {
                console.log('[商圈分析] PDF导出成功');
                this.recordExport(finalFilename, Date.now() - startTime, true);
                return true;
            } else {
                throw new Error('PDF导出失败');
            }
            
        } catch (error) {
            console.error('[商圈分析] PDF导出失败:', error);
            this.recordExport(filename, Date.now() - startTime, false, error);
            
            // 显示错误提示
            this.showExportError(error);
            return false;
            
        } finally {
            this.isExporting = false;
        }
    }
    
    /**
     * 使用html-to-image方案导出PDF
     */
    async exportWithHtmlToImage(targetElement, filename) {
        try {
            // 检查依赖库
            if (typeof htmlToImage === 'undefined') {
                throw new Error('html-to-image库未加载');
            }
            
            const jsPDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
            if (!jsPDFClass) {
                throw new Error('jsPDF库未加载');
            }
            
            console.log('[商圈分析] 使用html-to-image方案导出PDF');
            
            // 预处理：优化样式
            await this.optimizeForExport(targetElement);
            
            // 等待样式完全应用
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 第一步：HTML → PNG
            console.log('[商圈分析] 步骤1: HTML → PNG');
            const dataUrl = await htmlToImage.toPng(targetElement, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });
            
            // 第二步：PNG → PDF
            console.log('[商圈分析] 步骤2: PNG → PDF');
            const pdf = new jsPDFClass({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // 创建图片对象
            const img = new Image();
            img.src = dataUrl;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        // 计算PDF尺寸
                        const pdfWidth = 210; // A4宽度
                        const pdfHeight = (img.height * pdfWidth) / img.width;
                        
                        // 添加图片到PDF
                        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        
                        // 保存PDF
                        pdf.save(filename);
                        resolve();
                        
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('图片加载失败'));
                };
            });
            
            console.log('[商圈分析] PDF导出完成:', filename);
            return true;
            
        } catch (error) {
            console.error('[商圈分析] html-to-image导出失败:', error);
            throw error;
        }
    }
    
    /**
     * 优化元素用于导出
     */
    async optimizeForExport(element) {
        // 添加PDF导出专用样式
        element.classList.add('market-pdf-export');
        
        // 确保所有图片都已加载
        const images = element.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            });
        });
        
        await Promise.all(imagePromises);
        
        // 强制重新计算布局
        element.offsetHeight;
    }
    
    /**
     * 生成文件名
     */
    generateFilename() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        // 尝试获取商圈名称
        const areaNameElement = document.querySelector('.market-meta-value');
        const areaName = areaNameElement ? areaNameElement.textContent.trim() : '商圈';
        
        return `商圈调研分析报告_${areaName}_${dateStr}_${timeStr}.pdf`;
    }
    
    /**
     * 记录导出历史
     */
    recordExport(filename, duration, success, error = null) {
        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            filename: filename,
            duration: duration,
            success: success,
            error: error ? error.message : null
        };
        
        this.exportHistory.push(record);
        
        // 只保留最近10条记录
        if (this.exportHistory.length > 10) {
            this.exportHistory = this.exportHistory.slice(-10);
        }
        
        console.log('[商圈分析] 导出历史已记录');
    }
    
    /**
     * 显示导出错误
     */
    showExportError(error) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'market-export-error';
        errorDiv.innerHTML = `
            <div class="market-error-content">
                <h4>PDF导出失败</h4>
                <p>${error.message}</p>
                <button onclick="this.parentElement.parentElement.remove()">关闭</button>
            </div>
        `;
        
        // 添加样式
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 3000);
    }
    
    /**
     * 获取导出历史
     */
    getExportHistory() {
        return [...this.exportHistory];
    }
    
    /**
     * 清除导出历史
     */
    clearExportHistory() {
        this.exportHistory = [];
        console.log('[商圈分析] 导出历史已清除');
    }
    
    /**
     * 获取导出统计
     */
    getExportStats() {
        const history = this.exportHistory;
        const successful = history.filter(record => record.success);
        const failed = history.filter(record => !record.success);
        
        const totalDuration = successful.reduce((sum, record) => sum + record.duration, 0);
        const avgDuration = successful.length > 0 ? totalDuration / successful.length : 0;
        
        return {
            total: history.length,
            successful: successful.length,
            failed: failed.length,
            successRate: history.length > 0 ? (successful.length / history.length * 100).toFixed(1) + '%' : '0%',
            avgDuration: Math.round(avgDuration),
            totalDuration: totalDuration
        };
    }
    
    /**
     * 检查导出环境
     */
    checkExportEnvironment() {
        const checks = {
            htmlToImage: typeof htmlToImage !== 'undefined',
            jsPDF: typeof window.jsPDF !== 'undefined' || (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined'),
            reportContent: document.getElementById('market-report-content') !== null
        };
        
        const allPassed = Object.values(checks).every(check => check);
        
        return {
            checks,
            ready: allPassed,
            missing: Object.keys(checks).filter(key => !checks[key])
        };
    }
    
    /**
     * 预览导出效果
     */
    async previewExport() {
        try {
            const reportElement = document.getElementById('market-report-content');
            if (!reportElement) {
                throw new Error('未找到报告内容');
            }
            
            await this.optimizeForExport(reportElement);
            
            // 创建预览窗口
            const previewWindow = window.open('', '_blank', 'width=800,height=600');
            previewWindow.document.write(`
                <html>
                    <head>
                        <title>商圈分析报告预览</title>
                        <style>
                            body { margin: 20px; font-family: Arial, sans-serif; }
                            .preview-note { background: #e3f2fd; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="preview-note">
                            <strong>预览说明:</strong> 这是PDF导出的预览效果，实际PDF可能略有差异。
                        </div>
                        ${reportElement.outerHTML}
                    </body>
                </html>
            `);
            previewWindow.document.close();
            
        } catch (error) {
            console.error('[商圈分析] 预览失败:', error);
            this.showExportError(error);
        }
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketPDFExporter;
}
