/**
 * DeepSeek API 提示词模板
 * 基于现有的品牌定位分析提示词模板
 */

class PromptTemplate {
    /**
     * 构建品牌定位分析提示词
     * @param {Object} storeData - 店铺数据
     * @returns {string} - 完整的提示词
     */
    static buildAnalysisPrompt(storeData) {
        const {
            storeName,
            category,
            address,
            targetGroup,
            priceRange,
            mainProducts,
            features
        } = storeData;
        
        return `# 角色
你是一位专业的美团店铺分析师，能够对店铺的各个方面进行深入分析，并以清晰的格式呈现结果。

## 店铺信息
- 店铺名称：${storeName}
- 经营品类：${category}
- 店铺地址：${address || '未提供'}
- 目标客群：${targetGroup || '未指定'}
- 价格区间：人均${priceRange || '未指定'}
- 主营产品：${mainProducts || '未提供'}
- 经营特色：${features || '未提供'}

## 分析要求
请按照以下8个维度对该店铺进行专业的品牌定位分析，每个维度包含3-5个具体的分析要点和建议：

### 技能 1：产品定位分析
1. 根据产品特点和目标人群，确定产品在市场中的定位。
2. 分析产品的独特卖点和竞争优势。

### 技能 2：主营招牌分析
1. 评估主营招牌产品的吸引力和市场竞争力。
2. 提出改进主营招牌产品的建议。

### 技能 3：人群定位分析
1. 明确目标人群的特征和需求。
2. 分析实际人群与目标人群的差异。
3. 提出针对不同人群的营销策略。

### 技能 4：消费模式分析
1. 研究目标人群的消费习惯和行为模式。
2. 分析消费模式对店铺销售的影响。
3. 提出优化消费模式的建议。

### 技能 5：消费场景分析
1. 描述产品的主要消费场景。
2. 分析不同消费场景下的用户需求。
3. 提出适应不同消费场景的销售策略。

### 技能 6：价格定位分析
1. 评估产品价格在市场中的竞争力。
2. 分析价格定位对销售的影响。
3. 提出合理的价格调整建议。

### 技能 7：店铺名分析
1. 评估店铺名的吸引力和辨识度。
2. 提出改进店铺名的建议。

### 技能 8：销售渠道分析
1. 分析仅通过美团外卖平台销售的优势和劣势。
2. 提出拓展销售渠道的建议。

## 输出格式要求
请严格按照以下HTML格式输出分析结果，确保格式正确且内容专业：

<div class="analysis-section">
    <h2 class="section-title">一、产品定位分析</h2>
    <ul>
        <li>产品特点：[具体分析内容]</li>
        <li>目标人群：[具体分析内容]</li>
        <li>市场定位：[具体分析内容]</li>
        <li>独特卖点：[具体分析内容]</li>
        <li>竞争优势：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">二、主营招牌分析</h2>
    <ul>
        <li>主营招牌：[具体分析内容]</li>
        <li>吸引力：[具体分析内容]</li>
        <li>改进建议：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">三、人群定位分析</h2>
    <ul>
        <li>目标人群特征：[具体分析内容]</li>
        <li>实际人群差异：[具体分析内容]</li>
        <li>营销策略：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">四、消费模式分析</h2>
    <ul>
        <li>消费习惯：[具体分析内容]</li>
        <li>行为模式：[具体分析内容]</li>
        <li>优化建议：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">五、消费场景分析</h2>
    <ul>
        <li>主要场景：[具体分析内容]</li>
        <li>用户需求：[具体分析内容]</li>
        <li>销售策略：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">六、价格定位分析</h2>
    <ul>
        <li>市场竞争力：[具体分析内容]</li>
        <li>价格影响：[具体分析内容]</li>
        <li>调整建议：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">七、店铺名分析</h2>
    <ul>
        <li>吸引力：[具体分析内容]</li>
        <li>改进建议：[具体分析内容]</li>
    </ul>
</div>

<div class="analysis-section">
    <h2 class="section-title">八、销售渠道分析</h2>
    <ul>
        <li>优势：[具体分析内容]</li>
        <li>劣势：[具体分析内容]</li>
        <li>拓展建议：[具体分析内容]</li>
    </ul>
</div>

## 注意事项
1. 分析内容要具体、专业、有针对性
2. 建议要切实可行，具有操作性
3. 语言要简洁明了，避免空泛的表述
4. 每个分析要点要结合店铺的实际情况
5. 严格按照HTML格式输出，不要添加额外的markdown标记
6. 确保所有HTML标签正确闭合

请开始分析：`;
    }
    
    /**
     * 构建简化版提示词（用于测试）
     * @param {Object} storeData - 店铺数据
     * @returns {string} - 简化的提示词
     */
    static buildSimplePrompt(storeData) {
        const { storeName, category } = storeData;
        
        return `请对"${storeName}"（经营品类：${category}）进行简要的品牌定位分析，包含以下3个方面：

1. 产品定位分析
2. 人群定位分析
3. 价格定位分析

请以HTML格式输出，使用以下结构：
<div class="analysis-section">
    <h2>一、产品定位分析</h2>
    <ul>
        <li>分析要点1</li>
        <li>分析要点2</li>
    </ul>
</div>

请确保分析内容专业、具体、有针对性。`;
    }
    
    /**
     * 构建测试连接提示词
     * @returns {string} - 测试提示词
     */
    static buildTestPrompt() {
        return '请回复"API连接成功，品牌定位分析应用已就绪"';
    }
    
    /**
     * 验证店铺数据完整性
     * @param {Object} storeData - 店铺数据
     * @returns {Object} - 验证结果
     */
    static validateStoreData(storeData) {
        const errors = [];
        const warnings = [];
        
        // 必填字段检查
        if (!storeData.storeName) {
            errors.push('店铺名称不能为空');
        }
        
        if (!storeData.category) {
            errors.push('经营品类不能为空');
        }
        
        // 可选字段建议
        if (!storeData.address) {
            warnings.push('建议提供店铺地址以获得更准确的分析');
        }
        
        if (!storeData.targetGroup) {
            warnings.push('建议指定目标客群以获得更精准的分析');
        }
        
        if (!storeData.mainProducts) {
            warnings.push('建议提供主营产品信息以获得更详细的分析');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * 获取提示词统计信息
     * @param {string} prompt - 提示词
     * @returns {Object} - 统计信息
     */
    static getPromptStats(prompt) {
        return {
            length: prompt.length,
            wordCount: prompt.split(/\s+/).length,
            estimatedTokens: Math.ceil(prompt.length / 4) // 粗略估算
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptTemplate;
}
