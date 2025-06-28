/**
 * html2pdf.js 库加载器
 * 动态加载html2pdf.js库
 */

class HTML2PDFLoader {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
    }
    
    /**
     * 加载html2pdf.js库
     * @returns {Promise<boolean>} - 加载是否成功
     */
    async loadLibrary() {
        // 如果已经加载，直接返回
        if (this.isLoaded) {
            return true;
        }
        
        // 如果正在加载，返回现有的Promise
        if (this.isLoading) {
            return this.loadPromise;
        }
        
        this.isLoading = true;
        
        this.loadPromise = new Promise((resolve, reject) => {
            // 检查是否已经存在html2pdf
            if (typeof html2pdf !== 'undefined') {
                this.isLoaded = true;
                this.isLoading = false;
                resolve(true);
                return;
            }
            
            // 创建script标签加载库
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            
            script.onload = () => {
                console.log('html2pdf.js 库加载成功');
                this.isLoaded = true;
                this.isLoading = false;
                resolve(true);
            };
            
            script.onerror = (error) => {
                console.error('html2pdf.js 库加载失败:', error);
                this.isLoading = false;
                reject(new Error('html2pdf.js 库加载失败'));
            };
            
            document.head.appendChild(script);
        });
        
        return this.loadPromise;
    }
    
    /**
     * 检查库是否已加载
     * @returns {boolean} - 是否已加载
     */
    isLibraryLoaded() {
        return this.isLoaded && typeof html2pdf !== 'undefined';
    }
    
    /**
     * 获取html2pdf实例
     * @returns {Function|null} - html2pdf函数或null
     */
    getHTML2PDF() {
        if (this.isLibraryLoaded()) {
            return html2pdf;
        }
        return null;
    }
}

// 创建全局实例
window.html2pdfLoader = new HTML2PDFLoader();

// 自动加载库
document.addEventListener('DOMContentLoaded', () => {
    console.log('开始自动加载html2pdf.js库...');
    window.html2pdfLoader.loadLibrary()
        .then(() => {
            console.log('html2pdf.js库自动加载成功');
        })
        .catch(error => {
            console.warn('html2pdf.js 自动加载失败:', error);
        });
});

// 也在window.onload时尝试加载
window.addEventListener('load', () => {
    if (!window.html2pdfLoader.isLibraryLoaded()) {
        console.log('window.onload时重新尝试加载html2pdf.js库...');
        window.html2pdfLoader.loadLibrary().catch(error => {
            console.warn('window.onload时html2pdf.js加载失败:', error);
        });
    }
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTML2PDFLoader;
}
