const auth = require('../../util/auth.js');
const api = require('../../util/api.js');

// MBTI类型名称映射
const mbtiNames = {
  INTJ: '建筑师', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
  ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者'
};

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      avatar: 'https://nengying-1304691500.cos.ap-shanghai.myqcloud.com/avatar.png',
      nickname: '未登录',
      id: null,
      mbti_type: null
    },
    mbtiResult: null,
    stats: {
      tests: 0,
      games: 0,
      days: 1
    },
    cacheSize: '0 KB',
    showUpdateForm: false,
    updateForm: {
      nickname: '',
      mbti_type: '',
      avatar: ''
    },
    mbtiTypes: [
      { type: 'ENFJ', name: '主人公', avatar: '/pages/assets/avatar/enfj.png' },
      { type: 'ENFP', name: '竞选者', avatar: '/pages/assets/avatar/enfp.png' },
      { type: 'ENTJ', name: '指挥官', avatar: '/pages/assets/avatar/entj.png' },
      { type: 'ENTP', name: '辩论家', avatar: '/pages/assets/avatar/entp.png' },
      { type: 'ESFJ', name: '执政官', avatar: '/pages/assets/avatar/esfj.png' },
      { type: 'ESFP', name: '表演者', avatar: '/pages/assets/avatar/esfp.png' },
      { type: 'ESTJ', name: '总经理', avatar: '/pages/assets/avatar/estj.png' },
      { type: 'ESTP', name: '企业家', avatar: '/pages/assets/avatar/estp.png' },
      { type: 'INFJ', name: '提倡者', avatar: '/pages/assets/avatar/infj.png' },
      { type: 'INFP', name: '调停者', avatar: '/pages/assets/avatar/infp.png' },
      { type: 'INTJ', name: '建筑师', avatar: '/pages/assets/avatar/intj.png' },
      { type: 'INTP', name: '逻辑学家', avatar: '/pages/assets/avatar/intp.png' },
      { type: 'ISFJ', name: '守护者', avatar: '/pages/assets/avatar/isfj.png' },
      { type: 'ISFP', name: '探险家', avatar: '/pages/assets/avatar/isfp.png' },
      { type: 'ISTJ', name: '物流师', avatar: '/pages/assets/avatar/istj.png' },
      { type: 'ISTP', name: '鉴赏家', avatar: '/pages/assets/avatar/istp.png' }
    ]
  },

  onLoad() {
    this.checkLoginStatus(); // 会自动调用 loadMBTIResult()
    this.loadStats();
    this.calculateCacheSize();
  },

  onShow() {
    // 每次显示页面时检查登录状态和刷新数据
    this.checkLoginStatus(); // 会自动调用 loadMBTIResult()
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      this.loadUserInfo();
    } else {
      // 未登录，使用默认数据
      this.setData({
        userInfo: {
          avatar: 'https://nengying-1304691500.cos.ap-shanghai.myqcloud.com/avatar.png',
          nickname: '未登录',
          id: null,
          mbti_type: null
        }
      }, () => {
        // userInfo更新后，重新加载MBTI结果
        this.loadMBTIResult();
      });
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = auth.getCurrentUser();
    if (userInfo) {
      this.setData({ userInfo }, () => {
        // userInfo更新后，重新加载MBTI结果
        this.loadMBTIResult();
      });
    }
  },

  // 加载MBTI结果
  loadMBTIResult() {
    const userInfo = this.data.userInfo;
    
    // 优先使用用户信息中的 mbti_type（服务器数据）
    if (userInfo && userInfo.mbti_type) {
      this.setData({
        mbtiResult: {
          type: userInfo.mbti_type,
          name: mbtiNames[userInfo.mbti_type] || userInfo.mbti_type
        }
      });
      return;
    }
    
    // 其次使用本地存储的测评结果
    const result = xhs.getStorageSync('mbti_result');
    if (result && result.type) {
      this.setData({
        mbtiResult: {
          type: result.type,
          name: mbtiNames[result.type] || result.type
        }
      });
    } else {
      // 都没有，显示未测评
      this.setData({
        mbtiResult: null
      });
    }
  },

  // 加载统计数据
  loadStats() {
    const stats = xhs.getStorageSync('user_stats') || {
      tests: 0,
      games: 0,
      days: 1
    };
    this.setData({ stats });
  },

  // 计算缓存大小
  calculateCacheSize() {
    try {
      const info = xhs.getStorageInfoSync();
      const sizeKB = Math.round(info.currentSize);
      const sizeMB = (sizeKB / 1024).toFixed(2);
      
      this.setData({
        cacheSize: sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`
      });
    } catch (e) {
      this.setData({ cacheSize: '0 KB' });
    }
  },

  // 处理用户信息授权（小红书推荐方式）
  handleGetUserInfo(e) {
    console.log('handleGetUserInfo:', e);
    
    if (e.detail.userInfo) {
      // 用户同意授权
      const { nickName, avatarUrl } = e.detail.userInfo;
      
      xhs.showLoading({
        title: '登录中...'
      });

      // 1. 获取 code
      xhs.login({
        success: (loginRes) => {
          const code = loginRes.code;
          
          console.log('login code:', code);
          if (!code) {
            xhs.hideLoading();
            xhs.showToast({
              title: '登录失败',
              icon: 'none'
            });
            return;
          }

          // 2. 发送到后端
          api.xhsLogin(code, nickName, avatarUrl)
            .then((res) => {
              xhs.hideLoading();
              console.log('Login success:', res);
              
              // 保存登录信息
              auth.saveAuthInfo(res.token, res.user);
              
              xhs.showToast({
                title: '登录成功',
                icon: 'success'
              });

              // 刷新页面
              this.checkLoginStatus();
              this.loadStats();
            })
            .catch((err) => {
              xhs.hideLoading();
              console.error('Login failed:', err);
              
              xhs.showToast({
                title: err.message || '登录失败',
                icon: 'none'
              });
            });
        },
        fail: (err) => {
          xhs.hideLoading();
          console.error('xhs.login failed:', err);
          
          xhs.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 用户拒绝授权
      xhs.showModal({
        title: '需要授权',
        content: '登录需要获取您的基本信息',
        showCancel: false
      });
    }
  },

  // 登录（备用方法）
  handleLogin() {
    auth.login()
      .then((res) => {
        console.log('Login success:', res);
        this.checkLoginStatus();
        this.loadStats();
      })
      .catch((err) => {
        console.error('Login failed:', err);
      });
  },

  // 退出登录
  handleLogout() {
    auth.logout()
      .then((confirmed) => {
        if (confirmed) {
          this.checkLoginStatus();
          
          // 清空统计数据
          this.setData({
            stats: { tests: 0, games: 0, days: 1 },
            mbtiResult: null
          });
        }
      });
  },

  // 修改头像
  changeAvatar() {
    if (!this.data.isLoggedIn) {
      xhs.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    xhs.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // TODO: 上传头像到服务器
        // 这里暂时只更新本地
        const userInfo = this.data.userInfo;
        userInfo.avatar = tempFilePath;
        
        this.setData({ userInfo });
        auth.saveAuthInfo(auth.getToken(), userInfo);
        
        xhs.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      }
    });
  },

  // 查看MBTI结果
  viewMBTIResult() {
    xhs.navigateTo({
      url: '/pages/result/result'
    });
  },

  // 去测评
  goToTest() {
    xhs.switchTab({
      url: '/pages/mbti/mbti'
    });
  },

  // 导航到指定页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    xhs.navigateTo({ url });
  },

  // 清除缓存
  clearCache() {
    xhs.showModal({
      title: '确认清除缓存？',
      content: '清除缓存不会删除您的测评结果',
      success: (res) => {
        if (res.confirm) {
          xhs.showLoading({ title: '清除中...' });
          
          setTimeout(() => {
            // 保留重要数据
            const mbtiResult = xhs.getStorageSync('mbti_result');
            const userInfo = xhs.getStorageSync('user_info');
            const userStats = xhs.getStorageSync('user_stats');
            
            // 清除所有缓存
            xhs.clearStorage();
            
            // 恢复重要数据
            if (mbtiResult) xhs.setStorageSync('mbti_result', mbtiResult);
            if (userInfo) xhs.setStorageSync('user_info', userInfo);
            if (userStats) xhs.setStorageSync('user_stats', userStats);
            
            xhs.hideLoading();
            xhs.showToast({
              title: '清除成功',
              icon: 'success'
            });
            
            this.calculateCacheSize();
          }, 1000);
        }
      }
    });
  },

  // 检查更新
  checkUpdate() {
    xhs.showLoading({ title: '检查中...' });
    
    setTimeout(() => {
      xhs.hideLoading();
      xhs.showModal({
        title: '当前已是最新版本',
        content: 'v1.0.0',
        showCancel: false
      });
    }, 1000);
  },

  // 分享应用
  shareApp() {
    xhs.showShareMenu({
      withShareTicket: true
    });
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: 'MBTI性格测评 - 探索你的性格密码',
      path: '/pages/mbti/mbti',
      imageUrl: '/pages/assets/share-app.png'
    };
  },

  // 显示更新信息弹窗
  showUpdateModal() {
    if (!this.data.isLoggedIn) {
      xhs.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 预填充当前用户信息
    const userInfo = this.data.userInfo;
    this.setData({
      showUpdateForm: true,
      updateForm: {
        nickname: userInfo.nickname || '',
        mbti_type: userInfo.mbti_type || '',
        avatar: userInfo.avatar || ''
      }
    });
  },

  // 隐藏更新信息弹窗
  hideUpdateModal() {
    this.setData({
      showUpdateForm: false
    });
  },

  // 阻止弹窗关闭（点击弹窗内容区域）
  preventClose() {
    // 阻止事件冒泡
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({
      'updateForm.nickname': e.detail.value
    });
  },

  // 选择MBTI类型
  selectMBTIType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'updateForm.mbti_type': type
    });
  },

  // 提交更新
  submitUpdate() {
    const { nickname, mbti_type } = this.data.updateForm;

    // 验证
    if (!nickname || !nickname.trim()) {
      xhs.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (!mbti_type) {
      xhs.showToast({
        title: '请选择MBTI类型',
        icon: 'none'
      });
      return;
    }

    xhs.showLoading({
      title: '更新中...'
    });

    // 调用更新API
    api.updateUserProfile({
      nickname: nickname.trim(),
      mbti_type: mbti_type,
      avatar: ''
    })
      .then((res) => {
        xhs.hideLoading();
        
        xhs.showToast({
          title: '更新成功',
          icon: 'success'
        });

        // 更新本地用户信息
        const userInfo = this.data.userInfo;
        userInfo.nickname = nickname.trim();
        userInfo.mbti_type = mbti_type;
        
        // 根据MBTI类型更新头像
        const avatarPath = `/pages/assets/avatar/${mbti_type.toLowerCase()}.png`;
        userInfo.avatar = avatarPath;

        this.setData({
          userInfo: userInfo,
          showUpdateForm: false
        });

        // 保存到本地存储
        auth.saveAuthInfo(auth.getToken(), userInfo);

        // 更新MBTI结果显示
        this.setData({
          mbtiResult: {
            type: mbti_type,
            name: mbtiNames[mbti_type] || mbti_type
          }
        });

        // 同时保存到 mbti_result 存储
        xhs.setStorageSync('mbti_result', {
          type: mbti_type,
          name: mbtiNames[mbti_type] || mbti_type
        });
      })
      .catch((err) => {
        xhs.hideLoading();
        
        console.error('Update profile failed:', err);
        
        xhs.showToast({
          title: err.message || '更新失败',
          icon: 'none',
          duration: 2000
        });
      });
  }
});
