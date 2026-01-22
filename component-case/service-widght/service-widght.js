
Page({
  data: {
    resourceId: '',
    serviceInfo: null,

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
    console.log('====> 获取到的 resourceId', e?.target?.dataset?.shareticket);
    xhs.setClipboardData({ data: e?.target?.dataset?.shareticket || '未获取到 resourceId' });
  },
  bindTextareaNoBindInput(e) {
    this.setData({ resourceId: e.detail.value });
  },
  getServiceToken() {
    if (!this.data.resourceId) {
      xhs.showToast({ title: '请先获取 resourceId' });
      return;
    }

    let _this = this;

    xhs.createReservation({ 
      resourceId: _this.data.resourceId,
      success(res) {
        console.log('createReservation success', res);
        _this.setData({ serviceInfo: '获取 serviceInfo 信息成功：' + JSON.stringify(res) });
      },
      fail(err) {
        console.log('createReservation fail', err);
        _this.setData({ serviceInfo: '获取 serviceInfo 信息失败：' + JSON.stringify(err) });
      }
    });
  },
  getServiceTokenByTouch() {
    let _this = this;
    xhs.createReservation({
      resourceId: _this.data.resourceId,
      success: res => {
        console.log('createReservation success', res);
        _this.setData({ serviceInfo: '获取 serviceInfo 信息成功：' + JSON.stringify(res) });
      },
      fail: err => {
        console.log('createReservation fail', err);
        _this.setData({ serviceInfo: '获取 serviceInfo 信息失败：' + JSON.stringify(err) });
      }
    });
  }
});

