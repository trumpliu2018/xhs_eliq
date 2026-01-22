Page({
  data: {
    authInfo: "",
    showLoading: true,
  },
  bindInput(e) {
    this.setData({
      authInfo: e.detail.value
    });
  },
  changeLoading(e) {
    this.setData({
      showLoading: e.detail.value
    });
  },
  auth() {
    if (!xhs.alipayAuth) {
      xhs.showModal({
        title: 'xhs.alipayAuth 方法不存在'
      });
    }

    const { authInfo, showLoading } = this.data;
    console.log("%c Line:19 🍆 authInfo", "color:#ffdd4d", authInfo);
    console.log("%c Line:19 🌽 showLoading", "color:#ed9ec7", showLoading);

    xhs.alipayAuth({
      authInfo,
      showLoading,
      success(res) {
        xhs.showModal({
          title: '支付宝授权成功',
          content: JSON.stringify(res),
        });
      },
      fail(err) {
        xhs.showModal({
          title: '支付宝授权失败',
          content: JSON.stringify(err),
        });
      }
    });
  }
});
