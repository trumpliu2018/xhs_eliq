// MBTI类型名称映射
const mbtiNames = {
  INTJ: '建筑师', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
  ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者'
};

Page({
  data: {
    userInfo: {
      avatar: '/pages/assets/default-avatar.png',
      name: '小红书用户',
      id: '10086'
    },
    mbtiResult: null,
    stats: {
      tests: 0,
      games: 0,
      days: 1
    },
    cacheSize: '0 KB'
  },

  onLoad() {
    this.loadUserInfo();
    this.loadMBTIResult();
    this.loadStats();
    this.calculateCacheSize();
  },

  onShow() {
    // 每次显示页面时刷新MBTI结果
    this.loadMBTIResult();
  },

  // 加载用户信息
  loadUserInfo() {
    // 尝试从缓存获取用户信息
    const userInfo = xhs.getStorageSync('user_info');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 加载MBTI结果
  loadMBTIResult() {
    const result = xhs.getStorageSync('mbti_result');
    if (result && result.type) {
      this.setData({
        mbtiResult: {
          type: result.type,
          name: mbtiNames[result.type] || result.type
        }
      });
    } else {
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

  // 修改头像
  changeAvatar() {
    xhs.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        const userInfo = this.data.userInfo;
        userInfo.avatar = tempFilePath;
        
        this.setData({ userInfo });
        xhs.setStorageSync('user_info', userInfo);
        
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
  }
});
