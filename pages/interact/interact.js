Page({
  data: {
    showContactModal: false
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  // 跳转到Bingo游戏
  navigateToBingo() {
    xhs.navigateTo({
      url: '/pages/bingo/bingo'
    });
  },

  // 显示联系我们弹窗
  showContactModal() {
    this.setData({
      showContactModal: true
    });
  },

  // 隐藏联系我们弹窗
  hideContactModal() {
    this.setData({
      showContactModal: false
    });
  },

  // 阻止冒泡
  preventClose() {
    // 空函数，用于阻止点击弹窗内容时关闭
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '互动游戏 - 一起来玩吧！',
      path: '/pages/interact/interact',
      imageUrl: '/pages/assets/share-games.png'
    };
  }
});
