/**
 * 报告渲染器
 * 负责将生成的分析内容渲染为美观的HTML报告
 */

class ReportRenderer {
    constructor() {
        this.reportContainer = document.getElementById('report-content');
    }
    
    /**
     * 渲染完整报告
     * @param {Object} reportData - 报告数据
     * @param {Object} storeData - 店铺数据
     */
    renderReport(reportData, storeData) {
        if (!this.reportContainer) {
            throw new Error('报告容器未找到');
        }
        
        console.log('开始渲染报告...', reportData);
        
        try {
            // 清空容器
            this.reportContainer.innerHTML = '';
            
            // 渲染报告标题
            this.renderReportTitle(storeData);
            
            // 渲染店铺基本信息
            this.renderStoreInfo(storeData);
            
            // 渲染分析内容
            this.renderAnalysisContent(reportData.content);
            
            // 渲染报告元数据（可选）
            if (reportData.metadata) {
                this.renderMetadata(reportData.metadata);
            }
            
            // 添加动画效果
            this.addAnimations();
            
            console.log('报告渲染完成');
            
        } catch (error) {
            console.error('报告渲染失败:', error);
            this.renderError('报告渲染失败: ' + error.message);
        }
    }
    
    /**
     * 渲染报告标题
     * @param {Object} storeData - 店铺数据
     */
    renderReportTitle(storeData) {
        const titleHTML = `
            <div class="report-title-section">
                <h1 class="report-title">${storeData.storeName} 品牌定位分析报告</h1>
                <p class="report-subtitle">呈尚策划运营部专业分析</p>
                <p class="report-date">生成时间：${new Date().toLocaleString('zh-CN')}</p>
            </div>
        `;
        
        this.reportContainer.insertAdjacentHTML('beforeend', titleHTML);
    }
    
    /**
     * 渲染店铺基本信息
     * @param {Object} storeData - 店铺数据
     */
    renderStoreInfo(storeData) {
        const infoHTML = `
            <div class="store-info">
                <h3>店铺基本信息</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">店铺名称：</span>
                        <span class="info-value">${storeData.storeName}</span>
                    </div>
                    ${storeData.category ? `
                    <div class="info-item category">
                        <span class="info-label">经营品类：</span>
                        <span class="info-value">${storeData.category}</span>
                    </div>
                    ` : ''}
                    ${storeData.address ? `
                    <div class="info-item address">
                        <span class="info-label">店铺地址：</span>
                        <span class="info-value">${storeData.address}</span>
                    </div>
                    ` : ''}
                    ${storeData.targetGroup ? `
                    <div class="info-item">
                        <span class="info-label">目标客群：</span>
                        <span class="info-value">${storeData.targetGroup}</span>
                    </div>
                    ` : ''}
                    ${storeData.priceRange ? `
                    <div class="info-item">
                        <span class="info-label">价格区间：</span>
                        <span class="info-value">人均${storeData.priceRange}</span>
                    </div>
                    ` : ''}
                    ${storeData.mainProducts ? `
                    <div class="info-item">
                        <span class="info-label">主营产品：</span>
                        <span class="info-value">${storeData.mainProducts}</span>
                    </div>
                    ` : ''}
                    ${storeData.features ? `
                    <div class="info-item">
                        <span class="info-label">经营特色：</span>
                        <span class="info-value">${storeData.features}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.reportContainer.insertAdjacentHTML('beforeend', infoHTML);
    }
    
    /**
     * 渲染分析内容
     * @param {string} content - 分析内容HTML
     */
    renderAnalysisContent(content) {
        if (!content) {
            this.renderError('分析内容为空');
            return;
        }
        
        // 创建分析内容容器
        const analysisContainer = document.createElement('div');
        analysisContainer.className = 'analysis-container';
        
        try {
            // 直接插入HTML内容
            analysisContainer.innerHTML = content;
            
            // 验证和修复HTML结构
            this.validateAndFixHTML(analysisContainer);
            
            // 添加到报告容器
            this.reportContainer.appendChild(analysisContainer);
            
        } catch (error) {
            console.error('分析内容渲染失败:', error);
            this.renderError('分析内容格式错误: ' + error.message);
        }
    }
    
    /**
     * 验证和修复HTML结构
     * @param {HTMLElement} container - 容器元素
     */
    validateAndFixHTML(container) {
        // 确保所有分析区块都有正确的类名
        const sections = container.querySelectorAll('div');
        sections.forEach((section, index) => {
            if (!section.className.includes('analysis-section')) {
                section.className = 'analysis-section';
            }
        });
        
        // 确保所有标题都有正确的类名
        const titles = container.querySelectorAll('h2');
        titles.forEach(title => {
            if (!title.className.includes('section-title')) {
                title.className = 'section-title';
            }
        });
        
        // 处理列表项，添加强调样式
        const listItems = container.querySelectorAll('li');
        listItems.forEach(item => {
            const text = item.textContent;
            
            // 检测并高亮关键词
            const keywords = ['建议', '优势', '劣势', '特点', '策略', '分析', '改进'];
            keywords.forEach(keyword => {
                if (text.includes(keyword + '：') || text.includes(keyword + ':')) {
                    const regex = new RegExp(`(${keyword}[：:])`, 'g');
                    item.innerHTML = item.innerHTML.replace(regex, '<strong>$1</strong>');
                }
            });
        });
    }
    
    /**
     * 渲染元数据信息（已禁用）
     * @param {Object} metadata - 元数据
     */
    renderMetadata(metadata) {
        // 不再渲染底部的报告信息
        // 保留方法以避免调用错误，但不执行任何操作
    }
    
    /**
     * 渲染错误信息
     * @param {string} message - 错误消息
     */
    renderError(message) {
        const errorHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>报告生成出现问题</h3>
                <p class="error-message">${message}</p>
                <div class="error-actions">
                    <button onclick="window.app.showInputSection()" class="btn btn-primary">
                        返回重新生成
                    </button>
                </div>
            </div>
        `;
        
        this.reportContainer.innerHTML = errorHTML;
    }
    
    /**
     * 添加动画效果
     */
    addAnimations() {
        // 为分析区块添加渐入动画
        const sections = this.reportContainer.querySelectorAll('.analysis-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
            section.classList.add('fade-in');
        });
        
        // 为报告容器添加整体动画
        this.reportContainer.classList.add('report-fade-in');
    }
    
    /**
     * 获取报告HTML（用于PDF导出）
     * @returns {string} - 完整的报告HTML
     */
    getReportHTML() {
        if (!this.reportContainer) {
            return '';
        }
        
        // 克隆容器以避免修改原始内容
        const clone = this.reportContainer.cloneNode(true);
        
        // 移除动画类（PDF不需要）
        const animatedElements = clone.querySelectorAll('.fade-in, .report-fade-in');
        animatedElements.forEach(el => {
            el.classList.remove('fade-in', 'report-fade-in');
        });
        
        return clone.innerHTML;
    }
    
    /**
     * 清空报告内容
     */
    clearReport() {
        if (this.reportContainer) {
            this.reportContainer.innerHTML = '';
        }
    }
    
    /**
     * 更新报告样式主题
     * @param {string} theme - 主题名称
     */
    updateTheme(theme) {
        // TODO: 实现主题切换功能
        console.log('主题切换功能暂未实现:', theme);
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportRenderer;
}
