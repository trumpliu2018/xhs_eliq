const onScreenRecordingStateHandler = function (res) {
  console.log('onScreenRecordingStateChanged', res?.state);
  if (res?.state && this.data.recordState !== res?.state) {
    this.setData({
      recordState: res?.state,
      screenRecordingState: res,
    });
  }
};

function onUserCaptureHandler(res) {
  console.log('截屏回调 userCaptureHandler: ', res);
  this.setData({
    captureScreenTimes: this.data.captureScreenTimes + 1,
  });
}

Page({
  data: {
    // 截屏
    visualEffect: 'none',

    // 查询录屏的开关状态
    isRecording: 'off',
    isRecordingState: null,
    
    // 录屏状态
    recordState: 'stop',
    screenRecordingState: null,

    onScreenRecordingStateChanged: false,
    onUserCaptureScreen: false,
    captureScreenTimes: 0,
  },
  onLoad() {
    // 监听用户截屏事件
    const userCaptureHandler = this.userCaptureHandler = onUserCaptureHandler.bind(this);
    xhs.onUserCaptureScreen(userCaptureHandler);

    // 监听用户录屏事件
    const screenRecordingStateHandler = this.screenRecordingStateHandler = onScreenRecordingStateHandler.bind(this);
    xhs.onScreenRecordingStateChanged(screenRecordingStateHandler);

    xhs.showToast({ title: '正在监听用户截屏事件、录屏事件！！' });
  },
  handleSetVisualEffectOnCapture() {
    const _this = this;
    this.setData({
      visualEffect: this.data.visualEffect === 'none' ? 'hidden' : 'none',
    });
    xhs.setVisualEffectOnCapture({
      visualEffect: _this.data.visualEffect,
      success(res) {
        console.log('setVisualEffectOnCapture success', res);
      },
      fail(err) {
        console.log('setVisualEffectOnCapture fail', err.errMsg);
      },
    });
  },
  handleGetScreenRecordingState() {
    const _this = this;
    xhs.getScreenRecordingState({
      success(res) {
        console.log('getScreenRecordingState success', res?.state);
        if (res?.state === 'on') {
          _this.setData({
            isRecording: 'on',
            isRecordingState: res
          });
        } else {
          _this.setData({
            isRecording: 'off',
            isRecordingState: res
          });
        }
      },
      fail(err) {
        console.log('getScreenRecordingState fail', err.errMsg);
      },
    });
  },
  // 取消「截屏」监听
  handleOffCaptureScreen() {
    if (this.userCaptureHandler) {
      xhs.offUserCaptureScreen(this.userCaptureHandler);
      this.userCaptureHandler = null;
    } else {
      this.userCaptureHandler = onUserCaptureHandler;
    }
    
    xhs.showToast({
      title: '取消截屏监听, 接下来将无法监听到截屏事件，截屏次数不会更新！',
    });
  },
  // 取消「录屏」监听
  handleOffScreenRecordingState() {
    if (this.screenRecordingStateHandler) {
      xhs.offScreenRecordingStateChanged(this.screenRecordingStateHandler);
      this.screenRecordingStateHandler = null;
      xhs.showToast({
        title: '取消录屏监听, 接下来将无法观测到录屏消息！',
      });
      this.setData({
        screenRecordingState: null
      });
    }
  },
});
