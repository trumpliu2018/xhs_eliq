Page({
  data: {
    onShareAppMessageResult: null,
    onShareChatResult: null,
    onShareTimelineResult: null,
    onCopyUrlResult: null
  },
  // 内心
  onShareAppMessage(args) {
    console.log(' ==== onShareAppMessage 站内分享 log ===', args);
    this.setData({
      onShareAppMessageResult: args
    });
    return {
      title: '这是测试转发标题',
      path: '/component-case/share-sample/share-sample?id=123',
      content: 'onShareAppMessage 默认 content',
      success() {
        xhs.showToast({
          title: 'onShareAppMessage 开发者回调，分享成功！',
        });
      },
      fail() {
        xhs.showToast({
          title: 'onShareAppMessage 开发者回调，分享失败！',
        });
      }
    };
  },
  onShareChat(args) {
    console.log('==== onShareTimeline 微信(私信) log ===', args); // { from: 'menu'}
    this.setData({
      onShareChatResult: args
    });
    return {
      title: 'onShareChat测试',
      path: '/component-case/share-sample/share-sample',
      imageUrl: 'https://scm-dam-oss-cn-cdn.baozun.com/uat/baozun/20240822/179306699/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240821155654.jpg',
      success() {
        xhs.showToast({
          title: 'onShareChat 开发者回调，分享成功！',
        });
      },
      fail() {
        xhs.showToast({
          title: 'onShareChat 开发者回调，分享失败！！',
        });
      }
    };
  },
  onShareTimeline(args) {
    console.log('==== onShareTimeline 微信(朋友圈) log ===', args);
    this.setData({
      onShareTimelineResult: args
    });
    return {
      title: 'onShareTimeline测试',
      success() {
        xhs.showToast({
          title: 'onShareTimeline 开发者回调，分享成功！',
        });
      },
      fail() {
        xhs.showToast({
          title: 'onShareTimeline 开发者回调，分享失败！！',
        });
      },
    };
  },
  onCopyUrl(args) {
    console.log(' ==== onCopyUrl 点击回调 log ===', args);
    this.setData({
      onCopyUrlResult: args
    });
    return {
      query: 'a=1&b=2&c=3',
      success() {
        xhs.showToast({
          title: 'onCopyUrl 开发者回调，分享成功！',
        });
      },
      fail() {
        xhs.showToast({
          title: 'onCopyUrl 开发者回调，分享失败！！',
        });
      }
    };
  }
});
