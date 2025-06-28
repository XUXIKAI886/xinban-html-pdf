/**
 * 商圈调研分析 - DeepSeek API 客户端
 * 负责与DeepSeek API的通信，专用于商圈调研分析
 */

class MarketAPIClient {
    constructor() {
        this.config = {
            baseURL: 'https://api.deepseek.com/chat/completions',
            apiKey: 'sk-e46e6e0c271145a4aefdb762e00ecdaf',
            model: 'deepseek-chat',
            temperature: 0.7,
            max_tokens: 4096,
            timeout: 30000 // 30秒超时
        };
        
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000, // 1秒
            backoffMultiplier: 2
        };
    }
    
    /**
     * 调用DeepSeek API生成商圈分析内容
     * @param {string} prompt - 提示词
     * @param {Object} options - 可选配置
     * @returns {Promise<string>} - 生成的内容
     */
    async generateContent(prompt, options = {}) {
        const requestConfig = {
            ...this.config,
            ...options
        };
        
        const requestBody = {
            model: requestConfig.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一位专业的商圈调研分析师，具有丰富的商业地产和市场分析经验，能够对商圈的各个方面进行深入分析，并以清晰的格式呈现结果。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: requestConfig.temperature,
            max_tokens: requestConfig.max_tokens,
            stream: false
        };
        
        return await this.makeRequestWithRetry(requestBody);
    }
    
    /**
     * 带重试机制的请求
     * @param {Object} requestBody - 请求体
     * @returns {Promise<string>} - API响应内容
     */
    async makeRequestWithRetry(requestBody) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                console.log(`[商圈分析] API调用尝试 ${attempt}/${this.retryConfig.maxRetries}`);
                
                const response = await this.makeRequest(requestBody);
                console.log('[商圈分析] API调用成功');
                return response;
                
            } catch (error) {
                lastError = error;
                console.error(`[商圈分析] API调用失败 (尝试 ${attempt}/${this.retryConfig.maxRetries}):`, error.message);
                
                // 如果是最后一次尝试，直接抛出错误
                if (attempt === this.retryConfig.maxRetries) {
                    break;
                }
                
                // 如果是客户端错误（4xx），不重试
                if (error.status && error.status >= 400 && error.status < 500) {
                    console.log('[商圈分析] 客户端错误，不重试');
                    break;
                }
                
                // 等待后重试
                const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
                console.log(`[商圈分析] 等待 ${delay}ms 后重试...`);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }
    
    /**
     * 发起API请求
     * @param {Object} requestBody - 请求体
     * @returns {Promise<string>} - API响应内容
     */
    async makeRequest(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(this.config.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new MarketAPIError(
                    `API请求失败: ${response.status} ${response.statusText}`,
                    response.status,
                    errorData
                );
            }
            
            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0) {
                throw new MarketAPIError('API返回数据格式异常：没有choices字段');
            }
            
            const content = data.choices[0].message?.content;
            if (!content) {
                throw new MarketAPIError('API返回数据格式异常：没有content字段');
            }
            
            return content;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new MarketAPIError('API请求超时', 408);
            }
            
            if (error instanceof MarketAPIError) {
                throw error;
            }
            
            // 网络错误
            throw new MarketAPIError(`网络错误: ${error.message}`);
        }
    }
    
    /**
     * 流式生成内容（暂未实现）
     * @param {string} prompt - 提示词
     * @param {Function} onChunk - 接收数据块的回调函数
     * @param {Object} options - 可选配置
     */
    async generateContentStream(prompt, onChunk, options = {}) {
        // TODO: 实现流式输出
        console.log('[商圈分析] 流式输出功能暂未实现，使用普通模式');
        const content = await this.generateContent(prompt, options);
        onChunk(content);
    }
    
    /**
     * 验证API连接
     * @returns {Promise<boolean>} - 连接是否成功
     */
    async testConnection() {
        try {
            console.log('[商圈分析] 测试API连接...');
            
            const testPrompt = '请简单回复"商圈分析连接成功"';
            const response = await this.generateContent(testPrompt, {
                max_tokens: 50,
                temperature: 0
            });
            
            console.log('[商圈分析] API连接测试成功:', response);
            return true;
            
        } catch (error) {
            console.error('[商圈分析] API连接测试失败:', error);
            return false;
        }
    }
    
    /**
     * 获取API使用统计（模拟）
     * @returns {Object} - 使用统计信息
     */
    getUsageStats() {
        // TODO: 实现真实的使用统计
        return {
            totalRequests: 0,
            totalTokens: 0,
            lastRequestTime: null
        };
    }
    
    /**
     * 更新API配置
     * @param {Object} newConfig - 新的配置
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('[商圈分析] API配置已更新:', this.config);
    }
    
    /**
     * 睡眠函数
     * @param {number} ms - 毫秒数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 商圈分析API错误类
 */
class MarketAPIError extends Error {
    constructor(message, status = null, data = null) {
        super(message);
        this.name = 'MarketAPIError';
        this.status = status;
        this.data = data;
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarketAPIClient, MarketAPIError };
}
