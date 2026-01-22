Page({
  data: {
    onShareAppMessageResult: null,
    onShareChatResult: null,
    onShareTimelineResult: null,
    onCopyUrlResult: null
  },
  onShareLandingClick() {
    xhs.previewImage({
      current: "https://picasso-static.xiaohongshu.com/fe-platform/a2f1eca7501ff9abe939ef17964315d07cb7123e.png",
      urls: ["https://picasso-static.xiaohongshu.com/fe-platform/a2f1eca7501ff9abe939ef17964315d07cb7123e.png"],
    });
  },
  onShareAppMessage(args) {
    return {
      title: '测试转发',
      path: 'component-case/share-snapshoot/share-snapshoot?id=123',
      content: 'onShareAppMessage 默认 content'
    };
  },
  onShareChat(args) {
    return {
      title: 'onShareChat h5 转发测试: ' + args.from,
      path: 'component-case/share-snapshoot/share-snapshoot',
      query: 'a=1&b=2&c=3',
      externalImageUrl: 'https://picasso-static.xiaohongshu.com/fe-platform/a2f1eca7501ff9abe939ef17964315d07cb7123e.png',
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
  onCopyUrl() {
    return {
      query: 'a=1&b=2&c=3',
      externalImageUrl: 'https://picasso-static.xiaohongshu.com/fe-platform/a2f1eca7501ff9abe939ef17964315d07cb7123e.png',
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
  },
});
