import axios from 'axios'
import {ElMessage} from 'element-plus'
import router from '../router'
import {addIPToHeaders} from './ipUtils'
import authUtils from './authUtils'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 8000
})

// 请求拦截器：自动添加IP信息和鉴权头
request.interceptors.request.use(
    async (config) => {
        // 为所有请求自动添加IP信息
        config.headers = await addIPToHeaders(config.headers || {})
        
        // 为所有请求自动添加鉴权头
        const authHeaders = authUtils.generateAuthHeaders()
        config.headers = {
            ...config.headers,
            ...authHeaders
        }
        
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 添加重试机制
request.interceptors.response.use(
    response => {
        const {code, msg, data} = response.data
        if (code === 200) return response.data

        // 处理特定错误码
        switch (code) {
            case 400:
                ElMessage.error('请求参数错误')
                break
            case 401:
                ElMessage.error('未授权访问')
                break
            case 403:
                ElMessage.error('访问被拒绝')
                break
            case 429:
                ElMessage.warning('请求过于频繁，请稍后再试')
                break
            default:
                ElMessage.error(msg || '请求失败')
        }

        return Promise.reject(new Error(msg))
    },
    error => {
        if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络')
        } else {
            ElMessage.error('网络错误，请稍后重试')
        }
        return Promise.reject(error)
    }
)

export default request