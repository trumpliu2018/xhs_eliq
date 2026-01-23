Page({
  data: {
    // 可以添加一些动态数据，比如游戏统计等
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

  // 跳转到飞行棋
  navigateToChess() {
    xhs.navigateTo({
      url: '/pages/flight-chess/flight-chess'
    });
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
