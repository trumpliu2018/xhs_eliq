function getRandomColor() {
  const rgb = [];
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16);
    color = color.length === 1 ? `0${color}` : color;
    rgb.push(color);
  }
  return `#${rgb.join('')}`;
}

const demo2Methods = {
  handleLoadedMetadata(e) {
    console.log('----------lemon video handleLoadedMetadata', e, this.videoContext);
    if (this.videoContext) {
      this.videoContext.play();
    }
  },
  handlePlay(e)  {
    console.log('----------lemon video handlePlay', e);
  },
  handleWaiting(e) {
    console.log('----------lemon video handleWaiting', e);
  },
  handleVideoTimeUpdate(e) {
    console.log('----------lemon video time update', e);
  },
  handleVideoPause(e) {
    console.log('----------lemon video pause', e);
  },
  handleVideoEnd() {
    console.log('----------lemon video end', e);
  },
  handleProgress(e) {
    console.log('----------lemon video handleProgress', e);
  },
  handFullscreen(isFullscreen) {
    console.log('----------lemon video full screen', isFullscreen);
  },
  handleError(e) {
    console.log('----------lemon video handleError', e);
    console.log('视频错误信息:');
    console.log(e.detail.errMsg);
  },
};

Page({
  onShareAppMessage() {
    return {
      title: 'video',
      path: 'page/component/pages/video/video'
    };
  },
  data: {
    videoElVisible: true,
    src: '',
    danmuList: [{
      text: '第 1s 出现的弹幕',
      color: '#ff0000',
      time: 1
    }, {
      text: '第 3s 出现的弹幕',
      color: '#ff00ff',
      time: 3
    }],
    height: 200,
    showMute: false
  },
  // onReady() {
  //   this.videoContext = xhs.createVideoContext('myVideo2');
  // },
  // setToggle() {
  //   this.setData({
  //     videoElVisible: !this.data.videoElVisible
  //   });
  // },
  // bindVideoPlay() {
  //   this.videoContext.play();
  // },
  // bindVideoPause() {
  //   this.videoContext.pause();
  // },
  // bindVideoStop() {
  //   this.videoContext.stop();
  // },
  // bindVideoSeek() {
  //   this.videoContext.seek(10);
  // },
  // bindVideoSendDanmu() {
  //   this.videoContext.sendDanmu({
  //     text: '小红书小程序',
  //     color: getRandomColor(),
  //     time: 12
  //   });
  // },
  // bindVideoMute() {
  //   this.setData({
  //     showMute: !this.data.showMute
  //   });
  // },
  // /** demo2 相关方法 */
  // ...demo2Methods,

  // // 手势
  // touchStart(e) {
  //   console.log('====> touch start', e);
  // },
  // touchMove(e) {
  //   console.log('====> touch move', e);
  // },
  // touchEnd(e) {
  //   console.log('====> touch end', e);
  // },
});