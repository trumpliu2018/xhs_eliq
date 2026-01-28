const apiConfig = require('../config/api.config.js');

// API 配置
const API_BASE_URL = apiConfig.baseURL;

// 通用请求方法
function request(url, options = {}) {
  const { method = 'GET', data = {}, needAuth = false } = options;
  
  return new Promise((resolve, reject) => {
    // 构建请求头
    const header = {
      'Content-Type': 'application/json'
    };
    
    // 如果需要认证，添加 token
    if (needAuth) {
      const token = xhs.getStorageSync('auth_token');
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    xhs.request({
      url: `${API_BASE_URL}${url}`,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({
            code: res.statusCode,
            message: res.data.error || res.data.message || '请求失败'
          });
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: err.errMsg || '网络请求失败'
        });
      }
    });
  });
}

// 小红书登录
function xhsLogin(code, nickname = '', avatarUrl = '') {
  return request('/auth/xhs-login', {
    method: 'POST',
    data: {
      code: code,
      nickname: nickname,
      avatar_url: avatarUrl
    }
  });
}

// 获取用户信息
function getUserProfile() {
  return request('/user/profile', {
    method: 'GET',
    needAuth: true
  });
}

// 更新用户信息
function updateUserProfile(data) {
  return request('/user/profile', {
    method: 'PUT',
    data: data,
    needAuth: true
  });
}

// 获取 MBTI 测试题目
function getQuestions() {
  return request('/questions', {
    method: 'GET'
  });
}

// 创建测试会话
function createTestSession() {
  return request('/test/session', {
    method: 'POST',
    needAuth: true
  });
}

// 提交测试答案
function submitAnswers(testSessionId, answers) {
  return request('/test/answers', {
    method: 'POST',
    data: {
      test_session_id: testSessionId,
      answers: answers
    },
    needAuth: true
  });
}

// 获取 MBTI 类型信息
function getMBTIInfo(type) {
  return request(`/mbti-info/${type}`, {
    method: 'GET'
  });
}

module.exports = {
  request,
  xhsLogin,
  getUserProfile,
  updateUserProfile,
  getQuestions,
  createTestSession,
  submitAnswers,
  getMBTIInfo
};
