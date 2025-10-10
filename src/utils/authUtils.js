import CryptoJS from 'crypto-js'

/**
 * 签名验证工具类
 * 用于生成请求签名，与后端SignInterceptor配合使用
 */
class AuthUtils {
    constructor() {
        // 从环境变量获取密钥，如果没有配置则使用默认值
        this.secretKey = import.meta.env.VITE_SECRET_KEY || 'default-secret-key'
    }

    /**
     * 生成随机nonce值
     * @returns {string} 随机字符串
     */
    generateNonce() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36)
    }

    /**
     * 获取当前时间戳（毫秒）
     * @returns {string} 时间戳字符串
     */
    getTimestamp() {
        return Date.now().toString()
    }

    /**
     * 生成SHA256签名
     * @param {string} timestamp 时间戳
     * @param {string} nonce 随机数
     * @param {string} secretKey 密钥
     * @returns {string} SHA256签名
     */
    generateSignature(timestamp, nonce, secretKey) {
        const data = timestamp + nonce + secretKey
        return CryptoJS.SHA256(data).toString()
    }

    /**
     * 生成完整的鉴权头信息
     * @returns {Object} 包含X-Timestamp、X-Nonce、X-Sign的请求头对象
     */
    generateAuthHeaders() {
        const timestamp = this.getTimestamp()
        const nonce = this.generateNonce()
        const sign = this.generateSignature(timestamp, nonce, this.secretKey)

        return {
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'X-Sign': sign
        }
    }

    /**
     * 验证时间戳是否在有效期内（5分钟）
     * @param {string} timestamp 时间戳
     * @returns {boolean} 是否有效
     */
    isTimestampValid(timestamp) {
        const now = Date.now()
        const ts = parseInt(timestamp)
        const validity = 5 * 60 * 1000 // 5分钟
        
        return Math.abs(now - ts) <= validity
    }

    /**
     * 更新密钥
     * @param {string} newSecretKey 新的密钥
     */
    updateSecretKey(newSecretKey) {
        this.secretKey = newSecretKey
    }
}

// 创建单例实例
const authUtils = new AuthUtils()

export default authUtils
