Page({
  data: {},
  onShareAppMessage(args) {
    console.log(' ==== onShareAppMessage 站内分享 log ===', args);
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '这是测试 promise 转发标题',
        });
      }, 2000);
    });
    return {
      title: '这是测试转发标题',
      path: 'pages/index/detail?id=123',
      promise,
    };
  },
  onShareTimeline(res) {
    console.log(' ==== onShareTimeline 微信朋友圈分享 log ===', res);
    return {
      title: '这是微信「朋友圈」测试标题',
      path: 'pages/index/index?id=123',
    };
  },
  onShareChat(res) {
    console.log(' ==== onShareTimeline 微信聊天分享 log ===', res);
    return {
      title: '这是微信「聊天」测试标题',
      path: 'pages/index/index',
    };
  },
  nav() {
    xhs.navigateTo({
      url: '../detail/index',
    });
  },
  navAsync() {
    xhs.navigateTo({
      url: '../async/index',
    });
  },
});
