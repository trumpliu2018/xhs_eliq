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
    method: 'GET',
    needAuth: true
  });
}

// 获取当前测试会话
function getCurrentTestSession() {
  return request('/test/session/current', {
    method: 'GET',
    needAuth: true
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
      answers: answers // [{question_id: number, answer: 'yes'|'no'}]
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

// ====== Bingo游戏相关API ======

// 加入房间
function joinRoom(roomCode, mbtiType) {
  return request(`/bingo/rooms/${roomCode}/join`, {
    method: 'POST',
    data: {
      mbti_type: mbtiType
    },
    needAuth: true
  });
}

// 获取房间参与者列表
function getRoomParticipants(roomCode) {
  return request(`/bingo/rooms/${roomCode}/participants`, {
    method: 'GET',
    needAuth: true
  });
}

// 获取MBTI特质列表（26条：1条介绍 + 25条特质）
function getBingoTraits(mbtiType) {
  return request(`/bingo/traits/${mbtiType}`, {
    method: 'GET',
    needAuth: true
  });
}

// 获取收到的评价数据
function getReceivedEvaluations(roomId, targetId) {
  return request(`/bingo/interactions/received?room_id=${roomId}&target_id=${targetId}`, {
    method: 'GET',
    needAuth: true
  });
}

// 创建评价（选中格子）
function createBingoInteraction(roomId, targetId, traitId) {
  return request('/bingo/interactions', {
    method: 'POST',
    data: {
      room_id: roomId,
      target_id: targetId,
      trait_id: traitId
    },
    needAuth: true
  });
}

// 删除评价（取消选中）
function deleteBingoInteraction(roomId, targetId, traitId) {
  return request('/bingo/interactions', {
    method: 'DELETE',
    data: {
      room_id: roomId,
      target_id: targetId,
      trait_id: traitId
    },
    needAuth: true
  });
}

module.exports = {
  request,
  xhsLogin,
  getUserProfile,
  updateUserProfile,
  getQuestions,
  getCurrentTestSession,
  createTestSession,
  submitAnswers,
  getMBTIInfo,
  joinRoom,
  getRoomParticipants,
  getBingoTraits,
  getReceivedEvaluations,
  createBingoInteraction,
  deleteBingoInteraction
};
