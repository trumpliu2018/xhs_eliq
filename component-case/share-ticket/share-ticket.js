
Page({
  data: {
    shareTicket: '',
    shareInfo: null,

    // launchOptions
    launchOptions: null,
    launchOptionKeys: [],
    
    // entryOptions
    entryOptions: null,
    entryOptionKeys: [],
  },
  getLaunchOptions() {
    const options = xhs.getLaunchOptionsSync();
    this.setData({
      launchOptions: options,
      launchOptionKeys: Object.keys(options)
    });
  },
  getEnterOptions() {
    const options = xhs.getEnterOptionsSync();
    this.setData({
      entryOption: options,
      entryOptionKeys: Object.keys(options)
    });
  },
  copyShareTicket(e) {
    console.log('====> 获取到的 shareTicket', e?.target?.dataset?.shareticket);
    xhs.setClipboardData({ data: e?.target?.dataset?.shareticket || '未获取到 shareTicket' });
  },
  bindTextareaNoBindInput(e) {
    this.setData({ shareTicket: e.detail.value });
  },
  getShareInfo() {
    if (!this.data.shareTicket) {
      xhs.showToast({ title: '请先获取 shareTicket' });
      return;
    }

    let _this = this;

    xhs.getShareInfo({ 
      shareTicket: _this.data.shareTicket,
      success(res) {
        console.log('getShareInfo success', res);
        _this.setData({ shareInfo: '获取 shareInfo 信息成功：' + JSON.stringify(res) });
      },
      fail(err) {
        console.log('getShareInfo fail', err);
        _this.setData({ shareInfo: '获取 shareInfo 信息失败：' + JSON.stringify(err) });
      }
    });
  }
});

