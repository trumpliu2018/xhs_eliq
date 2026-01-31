// API 配置文件
// 根据环境自动选择 API 地址

const ENV = 'production'; // 'development' | 'production'

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8080/api',
    timeout: 10000
  },
  production: {
    baseURL: 'https://mbti.nengwing.com/api', // 生产环境需要替换为实际的 API 地址
    timeout: 10000
  }
};

module.exports = {
  baseURL: API_CONFIG[ENV].baseURL,
  timeout: API_CONFIG[ENV].timeout
};
