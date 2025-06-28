/**
 * 商圈调研分析 - 内容生成器
 * 负责调用AI生成商圈调研分析内容
 */

class MarketContentGenerator {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.generationHistory = [];
    }
    
    /**
     * 生成商圈调研分析
     * @param {Object} marketData - 商圈数据
     * @returns {Promise<Object>} - 生成的分析数据
     */
    async generateAnalysis(marketData) {
        const startTime = Date.now();
        
        try {
            console.log('[商圈分析] 开始生成商圈调研分析...', marketData);

            // 检查是否启用文档分析
            if (marketData.enableDocumentAnalysis && marketData.documentContent) {
                console.log('[商圈分析] 启用文档分析模式');
                return await this.generateDocumentAnalysis(marketData);
            }

            // 验证数据
            const validation = MarketPromptTemplate.validateMarketData(marketData);
            if (!validation.isValid) {
                throw new Error('数据验证失败: ' + validation.errors.join(', '));
            }
            
            // 显示警告信息
            if (validation.warnings.length > 0) {
                console.warn('[商圈分析] 数据警告:', validation.warnings);
            }
            
            // 构建提示词
            const prompt = MarketPromptTemplate.buildAnalysisPrompt(marketData);
            console.log('[商圈分析] 提示词构建完成，长度:', prompt.length);
            
            // 获取提示词统计
            const promptStats = MarketPromptTemplate.getPromptStats(prompt);
            console.log('[商圈分析] 提示词统计:', promptStats);
            
            // 调用API生成内容
            const rawContent = await this.apiClient.generateContent(prompt, {
                temperature: 0.7,
                max_tokens: 4096
            });
            
            console.log('[商圈分析] AI响应长度:', rawContent.length);
            
            // 解析响应
            const parseResult = MarketPromptTemplate.parseResponse(rawContent);
            if (!parseResult.success) {
                console.error('[商圈分析] 响应解析失败:', parseResult.error);
                throw new Error('AI响应格式错误: ' + parseResult.error);
            }
            
            const analysisData = parseResult.data;
            
            // 添加生成信息
            analysisData.generationInfo = {
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
                promptStats: promptStats,
                inputData: marketData,
                analysisType: 'standard'
            };
            
            // 记录生成历史
            this.recordGeneration(marketData, analysisData, Date.now() - startTime);
            
            console.log('[商圈分析] 分析生成完成，耗时:', Date.now() - startTime, 'ms');
            return analysisData;
            
        } catch (error) {
            console.error('[商圈分析] 生成分析失败:', error);
            
            // 记录失败历史
            this.recordGeneration(marketData, null, Date.now() - startTime, error);
            
            throw error;
        }
    }
    
    /**
     * 重新生成分析（使用不同的参数）
     * @param {Object} marketData - 商圈数据
     * @param {Object} options - 生成选项
     * @returns {Promise<Object>} - 生成的分析数据
     */
    async regenerateAnalysis(marketData, options = {}) {
        console.log('[商圈分析] 重新生成分析...');
        
        // 调整生成参数以获得不同的结果
        const adjustedOptions = {
            temperature: options.temperature || 0.8, // 稍微提高创造性
            max_tokens: options.max_tokens || 4096,
            ...options
        };
        
        // 临时更新API客户端配置
        const originalConfig = { ...this.apiClient.config };
        this.apiClient.updateConfig(adjustedOptions);
        
        try {
            const result = await this.generateAnalysis(marketData);
            return result;
        } finally {
            // 恢复原始配置
            this.apiClient.updateConfig(originalConfig);
        }
    }
    
    /**
     * 生成简化版分析（用于快速预览）
     * @param {Object} marketData - 商圈数据
     * @returns {Promise<Object>} - 简化的分析数据
     */
    async generateQuickAnalysis(marketData) {
        console.log('[商圈分析] 生成快速分析...');
        
        try {
            // 使用更低的token限制和更高的temperature
            const result = await this.apiClient.generateContent(
                MarketPromptTemplate.buildAnalysisPrompt(marketData),
                {
                    temperature: 0.9,
                    max_tokens: 2048
                }
            );
            
            const parseResult = MarketPromptTemplate.parseResponse(result);
            if (parseResult.success) {
                return parseResult.data;
            } else {
                throw new Error('快速分析解析失败');
            }
            
        } catch (error) {
            console.error('[商圈分析] 快速分析失败:', error);
            throw error;
        }
    }
    
    /**
     * 记录生成历史
     * @param {Object} inputData - 输入数据
     * @param {Object} outputData - 输出数据
     * @param {number} duration - 生成耗时
     * @param {Error} error - 错误信息（如果有）
     */
    recordGeneration(inputData, outputData, duration, error = null) {
        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            inputData: inputData,
            outputData: outputData,
            duration: duration,
            success: !error,
            error: error ? error.message : null
        };
        
        this.generationHistory.push(record);
        
        // 只保留最近20条记录
        if (this.generationHistory.length > 20) {
            this.generationHistory = this.generationHistory.slice(-20);
        }
        
        console.log('[商圈分析] 生成历史已记录，当前历史数量:', this.generationHistory.length);
    }
    
    /**
     * 获取生成历史
     * @returns {Array} - 生成历史记录
     */
    getGenerationHistory() {
        return [...this.generationHistory];
    }
    
    /**
     * 清除生成历史
     */
    clearGenerationHistory() {
        this.generationHistory = [];
        console.log('[商圈分析] 生成历史已清除');
    }
    
    /**
     * 获取生成统计
     * @returns {Object} - 统计信息
     */
    getGenerationStats() {
        const history = this.generationHistory;
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
     * 验证生成的分析数据
     * @param {Object} analysisData - 分析数据
     * @returns {Object} - 验证结果
     */
    validateAnalysisData(analysisData) {
        const errors = [];
        const warnings = [];
        
        // 检查必要的字段
        if (!analysisData.marketInfo) {
            errors.push('缺少商圈信息');
        }
        
        if (!analysisData.analysis) {
            errors.push('缺少分析内容');
        } else {
            // 检查分析维度
            const requiredDimensions = ['location', 'traffic', 'competition', 'business', 'consumption', 'potential', 'risk', 'suggestions'];
            requiredDimensions.forEach(dimension => {
                if (!analysisData.analysis[dimension]) {
                    errors.push(`缺少${dimension}分析维度`);
                }
            });
        }
        
        if (!analysisData.overallScore) {
            warnings.push('缺少综合评分');
        }
        
        if (!analysisData.conclusion) {
            warnings.push('缺少总结建议');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * 格式化分析数据用于显示
     * @param {Object} analysisData - 原始分析数据
     * @returns {Object} - 格式化后的数据
     */
    formatAnalysisForDisplay(analysisData) {
        // 确保所有必要的字段都存在
        const formatted = {
            marketInfo: analysisData.marketInfo || {},
            analysis: analysisData.analysis || {},
            overallScore: analysisData.overallScore || 'N/A',
            conclusion: analysisData.conclusion || '暂无总结',
            generationInfo: analysisData.generationInfo || {}
        };
        
        // 为每个分析维度添加默认值
        const dimensions = ['location', 'traffic', 'competition', 'business', 'consumption', 'potential', 'risk', 'suggestions'];
        dimensions.forEach(dimension => {
            if (!formatted.analysis[dimension]) {
                formatted.analysis[dimension] = {
                    title: '未知维度',
                    content: '暂无分析内容',
                    score: 'N/A',
                    highlights: []
                };
            }
        });
        
        return formatted;
    }

    /**
     * 生成基于文档的商圈调研分析
     * @param {Object} marketData - 商圈数据（包含文档内容）
     * @returns {Promise<Object>} - 生成的分析数据
     */
    async generateDocumentAnalysis(marketData) {
        const startTime = Date.now();

        try {
            console.log('[商圈分析] 开始生成文档分析...', {
                areaName: marketData.areaName,
                storeName: marketData.storeName,
                hasDocument: !!marketData.documentContent
            });

            // 构建文档分析提示词
            const prompt = MarketPromptTemplate.buildDocumentAnalysisPrompt(
                marketData,
                marketData.documentContent
            );
            console.log('[商圈分析] 文档分析提示词构建完成，长度:', prompt.length);

            // 调用API生成内容
            const rawContent = await this.apiClient.generateContent(prompt, {
                temperature: 0.7,
                max_tokens: 6144 // 文档分析需要更多token
            });

            console.log('[商圈分析] 文档分析AI响应长度:', rawContent.length);

            // 解析响应
            const parseResult = MarketPromptTemplate.parseResponse(rawContent);
            if (!parseResult.success) {
                console.error('[商圈分析] 文档分析响应解析失败:', parseResult.error);
                throw new Error('文档分析AI响应格式错误: ' + parseResult.error);
            }

            const analysisData = parseResult.data;

            // 添加生成信息
            analysisData.generationInfo = {
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
                inputData: marketData,
                analysisType: 'document',
                documentInfo: {
                    hasDocument: true,
                    storeName: marketData.storeName
                }
            };

            // 记录生成历史
            this.recordGeneration(marketData, analysisData, Date.now() - startTime);

            console.log('[商圈分析] 文档分析生成完成，耗时:', Date.now() - startTime, 'ms');
            return analysisData;

        } catch (error) {
            console.error('[商圈分析] 文档分析失败:', error);

            // 记录失败历史
            this.recordGeneration(marketData, null, Date.now() - startTime, error);

            throw new Error(`文档分析失败: ${error.message}`);
        }
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketContentGenerator;
}
