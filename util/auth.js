const api = require('./api.js');

// 检查是否已登录
function isLoggedIn() {
  const token = xhs.getStorageSync('auth_token');
  const user = xhs.getStorageSync('user_info');
  return !!(token && user);
}

// 获取当前用户信息
function getCurrentUser() {
  return xhs.getStorageSync('user_info');
}

// 获取 Token
function getToken() {
  return xhs.getStorageSync('auth_token');
}

// 保存登录信息
function saveAuthInfo(token, user) {
  xhs.setStorageSync('auth_token', token);
  xhs.setStorageSync('user_info', user);
}

// 清除登录信息
function clearAuthInfo() {
  xhs.removeStorageSync('auth_token');
  xhs.removeStorageSync('user_info');
}

// 小红书登录流程
function login() {
  return new Promise((resolve, reject) => {
    xhs.showLoading({
      title: '登录中...'
    });

    // 1. 调用小红书登录，获取 code
    xhs.login({
      success: (loginRes) => {
        console.log('xhs.login success:', loginRes);
        const code = loginRes.code;

        if (!code) {
          xhs.hideLoading();
          reject(new Error('获取登录凭证失败'));
          return;
        }

        // 2. 直接将 code 发送到后端进行登录
        // 小红书小程序中，用户信息需要后端通过 code 换取 openid 后从服务端获取
        // 或者使用 button 组件的 open-type="getUserInfo" 获取
        api.xhsLogin(code, '', '')
          .then((res) => {
            console.log('Backend login success:', res);
            xhs.hideLoading();

            // 3. 保存 token 和用户信息
            if (res.token && res.user) {
              saveAuthInfo(res.token, res.user);
              
              xhs.showToast({
                title: '登录成功',
                icon: 'success'
              });

              resolve(res);
            } else {
              reject(new Error('登录响应数据异常'));
            }
          })
          .catch((err) => {
            xhs.hideLoading();
            console.error('Backend login failed:', err);
            
            xhs.showToast({
              title: err.message || '登录失败',
              icon: 'none'
            });

            reject(err);
          });
      },
      fail: (err) => {
        console.error('xhs.login failed:', err);
        xhs.hideLoading();
        
        xhs.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });

        reject(err);
      }
    });
  });
}

// 退出登录
function logout() {
  return new Promise((resolve) => {
    xhs.showModal({
      title: '确认退出？',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          clearAuthInfo();
          
          xhs.showToast({
            title: '已退出登录',
            icon: 'success'
          });

          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

// 刷新用户信息
function refreshUserInfo() {
  return new Promise((resolve, reject) => {
    if (!isLoggedIn()) {
      reject(new Error('未登录'));
      return;
    }

    api.getUserProfile()
      .then((user) => {
        // 更新本地用户信息
        const token = getToken();
        saveAuthInfo(token, user);
        resolve(user);
      })
      .catch((err) => {
        // 如果是 401 未授权，清除登录信息
        if (err.code === 401) {
          clearAuthInfo();
        }
        reject(err);
      });
  });
}

module.exports = {
  isLoggedIn,
  getCurrentUser,
  getToken,
  saveAuthInfo,
  clearAuthInfo,
  login,
  logout,
  refreshUserInfo
};
