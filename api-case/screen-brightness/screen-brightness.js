Page({
  onShareAppMessage() {
    return {
      title: '屏幕亮度',
      path: 'packageAPI/pages/screen-brightness/screen-brightness',
    };
  },

  data: {
    screenBrightness: 0,
    isAndroid: false,
    getBrightnessResp: null,
  },

  onLoad() {
    this._updateScreenBrightness();
    const { platform } = xhs.getSystemInfoSync();
    this.setData({ isAndroid: platform === 'android' });
  },

  changeBrightness(e) {
    const value = Number.parseFloat(
      (e.detail.value).toFixed(1),
    );
    this.setData({
      screenBrightness: Number.parseFloat(
        e.detail.value.toFixed(1),
      ),
    });
    xhs.setScreenBrightness({ value });
  },

  setFollowSystemBrightness() {
    if (!this.data.isAndroid) {
      return;
    }
    xhs.setScreenBrightness({ value: -1 });
    this.setData({ screenBrightness: -1 });
  },

  _updateScreenBrightness() {
    xhs.getScreenBrightness({
      success: res => {
        this.setData({
          screenBrightness: Number.parseFloat((res.value || 0).toFixed(1)),
        });
      }
    });
  },

  handleGetScreenBrightness() {
    xhs.getScreenBrightness({
      success: res => {
        this.setData({
          getBrightnessResp: res,
        });
      },
      fail: err => {
        this.setData({
          getBrightnessResp: { errMsg: err?.errMsg || 'fail' },
        });
      }
    });
  },
});
