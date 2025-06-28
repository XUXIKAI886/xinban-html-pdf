/**
 * 商圈调研分析 - 报告渲染器
 * 负责将分析数据渲染成HTML报告
 */

class MarketReportRenderer {
    constructor() {
        this.reportContainer = document.getElementById('market-report-content');
        this.animationDelay = 100; // 动画延迟
    }
    
    /**
     * 渲染完整报告
     * @param {Object} analysisData - 分析数据
     * @param {Object} marketData - 原始商圈数据
     */
    renderReport(analysisData, marketData) {
        if (!this.reportContainer) {
            console.error('[商圈分析] 报告容器未找到');
            return;
        }
        
        console.log('[商圈分析] 开始渲染报告...');
        
        try {
            // 清空容器
            this.reportContainer.innerHTML = '';
            
            // 渲染报告内容
            const reportHTML = this.buildReportHTML(analysisData, marketData);
            this.reportContainer.innerHTML = reportHTML;
            
            // 添加动画效果
            this.addAnimations();
            
            console.log('[商圈分析] 报告渲染完成');
            
        } catch (error) {
            console.error('[商圈分析] 报告渲染失败:', error);
            this.renderErrorReport(error);
        }
    }
    
    /**
     * 构建报告HTML
     * @param {Object} analysisData - 分析数据
     * @param {Object} marketData - 原始商圈数据
     * @returns {string} - HTML字符串
     */
    buildReportHTML(analysisData, marketData) {
        const marketInfo = analysisData.marketInfo || {};
        const analysis = analysisData.analysis || {};
        
        return `
            <div class="market-report-wrapper">
                <!-- 报告头部 -->
                <div class="market-report-header-section">
                    <h1 class="market-report-title">商圈调研分析报告</h1>
                    <div class="market-report-meta">
                        <div class="market-meta-item">
                            <span class="market-meta-label">店铺名称:</span>
                            <span class="market-meta-value">${marketInfo.areaName || marketData.areaName}</span>
                        </div>
                        <div class="market-meta-item">
                            <span class="market-meta-label">经营品类:</span>
                            <span class="market-meta-value">${marketInfo.location || marketData.location}</span>
                        </div>
                        <div class="market-meta-item">
                            <span class="market-meta-label">店铺地址:</span>
                            <span class="market-meta-value">${marketInfo.areaType || marketData.areaType}</span>
                        </div>
                        <div class="market-meta-item">
                            <span class="market-meta-label">分析日期:</span>
                            <span class="market-meta-value">${marketInfo.analysisDate || new Date().toLocaleDateString()}</span>
                        </div>
                        <div class="market-meta-item">
                            <span class="market-meta-label">综合评分:</span>
                            <span class="market-meta-value market-overall-score">${analysisData.overallScore || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 执行摘要 -->
                ${this.renderSummarySection(marketInfo, analysisData)}
                
                <!-- 分析维度 -->
                ${this.renderAnalysisDimensions(analysis)}

                <!-- 文档分析 -->
                ${this.renderDocumentAnalysisSection(analysisData.documentAnalysis)}

                <!-- 优化建议 -->
                ${this.renderRecommendationsSection(analysisData.recommendations)}

                <!-- 总结建议 -->
                ${this.renderConclusionSection(analysisData)}
                
                <!-- 生成信息 -->
                ${this.renderGenerationInfo(analysisData.generationInfo)}
            </div>
        `;
    }
    
    /**
     * 渲染摘要部分
     */
    renderSummarySection(marketInfo, analysisData) {
        return `
            <div class="market-report-section market-summary-section">
                <h2 class="market-section-title">
                    <i class="market-icon">📊</i>
                    执行摘要
                </h2>
                <div class="market-summary-content">
                    <p class="market-summary-text">
                        ${marketInfo.summary || '本报告对该商圈进行了全面的调研分析，从多个维度评估了商圈的投资价值和发展潜力。'}
                    </p>
                    <div class="market-score-display">
                        <div class="market-score-circle">
                            <span class="market-score-number">${analysisData.overallScore || 'N/A'}</span>
                            <span class="market-score-label">综合评分</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染分析维度
     */
    renderAnalysisDimensions(analysis) {
        // 新的竞争对手文档分析格式，只有2个维度
        const dimensions = [
            { key: 'competition', icon: '⚔️', title: '竞争环境分析' },
            { key: 'opportunities', icon: '📈', title: '市场机会分析' }
        ];

        return dimensions.map(dimension => {
            const data = analysis[dimension.key] || {};
            return `
                <div class="market-report-section market-analysis-section" data-dimension="${dimension.key}">
                    <h2 class="market-section-title">
                        <i class="market-icon">${dimension.icon}</i>
                        ${data.title || dimension.title}
                        <span class="market-dimension-score">${data.score || 'N/A'}</span>
                    </h2>
                    <div class="market-analysis-content">
                        <div class="market-analysis-text">
                            ${this.formatAnalysisContent(data.content || '暂无分析内容')}
                        </div>
                        ${this.renderHighlights(data.highlights || [])}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * 渲染关键要点
     */
    renderHighlights(highlights) {
        if (!highlights || highlights.length === 0) {
            return '';
        }
        
        return `
            <div class="market-highlights">
                <h4 class="market-highlights-title">关键要点</h4>
                <ul class="market-highlights-list">
                    ${highlights.map(highlight => `
                        <li class="market-highlight-item">${highlight}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    /**
     * 渲染总结部分
     */
    renderConclusionSection(analysisData) {
        return `
            <div class="market-report-section market-conclusion-section">
                <h2 class="market-section-title">
                    <i class="market-icon">🎯</i>
                    总结建议
                </h2>
                <div class="market-conclusion-content">
                    <p class="market-conclusion-text">
                        ${analysisData.conclusion || '基于以上分析，建议投资者综合考虑各项因素，制定合适的投资策略。'}
                    </p>
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染生成信息
     */
    renderGenerationInfo(generationInfo) {
        if (!generationInfo) return '';
        
        return `
            <div class="market-report-section market-generation-info">
                <h3 class="market-section-title">分析信息</h3>
                <div class="market-generation-details">
                    <span class="market-generation-item">生成时间: ${new Date(generationInfo.timestamp).toLocaleString()}</span>
                    <span class="market-generation-item">分析耗时: ${generationInfo.duration}ms</span>
                    <span class="market-generation-item">AI模型: DeepSeek Chat</span>
                </div>
            </div>
        `;
    }
    
    /**
     * 格式化分析内容
     */
    formatAnalysisContent(content) {
        if (!content) return '';
        
        // 将换行符转换为段落
        return content
            .split('\n')
            .filter(line => line.trim())
            .map(line => `<p>${line.trim()}</p>`)
            .join('');
    }
    
    /**
     * 添加动画效果
     */
    addAnimations() {
        const sections = this.reportContainer.querySelectorAll('.market-report-section');
        
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.6s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * this.animationDelay);
        });
    }
    
    /**
     * 渲染错误报告
     */
    renderErrorReport(error) {
        if (!this.reportContainer) return;
        
        this.reportContainer.innerHTML = `
            <div class="market-error-report">
                <div class="market-error-icon">❌</div>
                <h2 class="market-error-title">报告生成失败</h2>
                <p class="market-error-message">
                    很抱歉，生成商圈分析报告时出现了错误。请检查输入信息后重试。
                </p>
                <div class="market-error-details">
                    <strong>错误详情:</strong> ${error.message}
                </div>
                <button class="market-btn market-btn-primary" onclick="location.reload()">
                    重新尝试
                </button>
            </div>
        `;
    }
    
    /**
     * 清空报告
     */
    clearReport() {
        if (this.reportContainer) {
            this.reportContainer.innerHTML = '';
        }
    }
    
    /**
     * 获取报告HTML用于PDF导出
     */
    getReportHTML() {
        return this.reportContainer ? this.reportContainer.innerHTML : '';
    }
    
    /**
     * 渲染文档分析部分
     * @param {Object} documentAnalysis - 文档分析数据
     * @returns {string} - HTML字符串
     */
    renderDocumentAnalysisSection(documentAnalysis) {
        if (!documentAnalysis) {
            return '';
        }

        const competitorStores = documentAnalysis.competitorStores || [];
        const competitorSummary = documentAnalysis.competitorSummary || {};

        return `
            <div class="market-report-section market-document-analysis-section">
                <h2 class="market-section-title">
                    <i class="market-icon">📄</i>
                    竞争对手分析
                </h2>
                <div class="market-document-analysis-content">
                    ${competitorStores.length > 0 ? `
                        <div class="market-competitor-stores">
                            <h3 class="market-subsection-title">竞争对手店铺信息</h3>
                            ${competitorStores.map(store => `
                                <div class="market-competitor-store">
                                    <h4 class="market-store-name">${store.storeName}</h4>
                                    <div class="market-store-details">
                                        <div class="market-store-products">
                                            <strong>产品：</strong>${(store.products || []).join('、')}
                                        </div>
                                        <div class="market-store-price">
                                            <strong>价格区间：</strong>${store.priceRange || '未知'}
                                        </div>
                                        <div class="market-store-features">
                                            <strong>特色：</strong>${(store.features || []).join('、')}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${Object.keys(competitorSummary).length > 0 ? `
                        <div class="market-competitor-summary">
                            <h3 class="market-subsection-title">竞争对手总结</h3>
                            <div class="market-summary-content">
                                ${competitorSummary.productTypes ? `
                                    <div class="market-summary-item">
                                        <strong>主要产品类型：</strong>${competitorSummary.productTypes.join('、')}
                                    </div>
                                ` : ''}
                                ${competitorSummary.pricingStrategy ? `
                                    <div class="market-summary-item">
                                        <strong>定价策略：</strong>${competitorSummary.pricingStrategy}
                                    </div>
                                ` : ''}
                                ${competitorSummary.commonFeatures ? `
                                    <div class="market-summary-item">
                                        <strong>共同特点：</strong>${competitorSummary.commonFeatures.join('、')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 渲染优化建议部分
     * @param {Object} recommendations - 建议数据
     * @returns {string} - HTML字符串
     */
    renderRecommendationsSection(recommendations) {
        if (!recommendations) {
            return '';
        }

        const sections = [
            { key: 'products', icon: '🍽️', title: '产品策略建议' },
            { key: 'pricing', icon: '💰', title: '定价策略建议' },
            { key: 'marketing', icon: '📢', title: '营销策略建议' }
        ];

        return `
            <div class="market-report-section market-recommendations-section">
                <h2 class="market-section-title">
                    <i class="market-icon">💡</i>
                    优化建议
                </h2>
                <div class="market-recommendations-content">
                    ${sections.map(section => {
                        const data = recommendations[section.key] || {};
                        const suggestions = data.suggestions || [];

                        if (suggestions.length === 0) {
                            return '';
                        }

                        return `
                            <div class="market-recommendation-category">
                                <h3 class="market-recommendation-title">
                                    <i class="market-icon">${section.icon}</i>
                                    ${data.title || section.title}
                                </h3>
                                <ul class="market-recommendation-list">
                                    ${suggestions.map(suggestion => `
                                        <li class="market-recommendation-item">${suggestion}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 设置动画延迟
     */
    setAnimationDelay(delay) {
        this.animationDelay = delay;
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketReportRenderer;
}
