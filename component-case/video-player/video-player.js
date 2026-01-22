
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
    // 剧目id
    album_id: '674548b2c1f9020001e9f9d1',
    // 剧集id
    episode_id: '674548b2c1f9020001e9f9d2',

    // 剧目列表
    album_2_episode_list: [
      {
        albumId: "674548b2c1f9020001e9f9d1",
        albumName: "测试剧目1",
        episodeList: [
          {
            "episodeName": "第一集",
            "episodeId": "674548b2c1f9020001e9f9d2",
          },
          {
            "episodeName": "第二集",
            "episodeId": "674548b2c1f9020001e9f9d3",
          }
        ]
      }
    ],
    height: 200,
  },
  onReady() {
    this.videoContext = xhs.createVideoContext('video-player-test');
  },
  bindVideoPlay() {
    this.videoContext.play();
  },
  bindVideoPause() {
    this.videoContext.pause();
  },
  bindVideoStop() {
    this.videoContext.stop();
  },
  bindVideoSeek() {
    this.videoContext.seek(10);
  },
  toggleVisible() {
    this.setData({
      videoElVisible: !this.data.videoElVisible
    });
  },
  /** demo2 相关方法 */
  ...demo2Methods,
  
  // 处理剧集 id
  handleEpisodeId(e) {
    this.setData({
      episode_id: e.detail.value
    });
  },
  // 处理剧目 id
  handleAlbumId(e) {
    this.setData({
      album_id: e.detail.value
    });
  },
  // 处理剧集切换
  handleEpisodeChange(e) {
    const { albumid, episodeid } = e.currentTarget.dataset;
    console.log('----------lemon video handleEpisodeChange', albumid, episodeid);
    this.setData({
      album_id: albumid,
      episode_id: episodeid
    });
  }
});