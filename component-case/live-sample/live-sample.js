
Page({
  data: {
    // 直播预约 id 
    trailerId: '',
    // 直播预约信息
    trailerInfo: '',
    // 直播间 id 
    roomId: '',
    // 直播间跳转信息
    jumpInfo: '',
    // 直播间回放信息
    replayInfo: ''
  },
  handleTrailerIdInput(e) {
    this.setData({ trailerId: e.detail.value });
  },
  handleLiveBooking() {
    if (!this.data.trailerId) {
      xhs.showToast({ title: '请先获取 trailerId' });
      return;
    }

    let _this = this;

    xhs.reserveLivestream({ 
      trailerId: String(_this.data.trailerId),
      success(res) {
        console.log('reserveLivestream success', res);
        _this.setData({ trailerInfo: '获取 trailerInfo 信息成功：' + JSON.stringify(res) });
      },
      fail(err) {
        console.log('reserveLivestream fail', err);
        _this.setData({ trailerInfo: '获取 trailerInfo 信息失败：' + JSON.stringify(err) });
      }
    });
  },
  bindRoomIdInput(e) {
    this.setData({ roomId: e.detail.value });
  },
  handleLiveJump() {
    if (!this.data.roomId) {
      xhs.showToast({ title: '请先获取 roomId' });
      return;
    }

    let _this = this;
    xhs.openLivestream({ 
      roomId: String(_this.data.roomId),
      success(res) {
        console.log('openLivestream success', res);
        _this.setData({ jumpInfo: `跳转直播间成功[${_this.data.roomId}]: ${JSON.stringify(res)}`});
      },
      fail(err) {
        console.log('openLivestream fail', err);
        _this.setData({ jumpInfo: `跳转直播间失败[${_this.data.roomId}]: ${JSON.stringify(err)}`});
      }
    });
  },
  handleLiveReplay() {
    if (!this.data.roomId) {
      xhs.showToast({ title: '请先获取 roomId' });
      return;
    }

    let _this = this;
    xhs.replayLivestream({ 
      roomId: String(_this.data.roomId),
      success(res) {
        console.log('replayLivestream success', res);
        _this.setData({ replayInfo: `跳转直播间回放成功[${_this.data.roomId}]: ${JSON.stringify(res)}`});
      },
      fail(err) {
        console.log('replayLivestream fail', err);
        _this.setData({ replayInfo: `跳转直播间回放失败[${_this.data.roomId}]: ${JSON.stringify(err)}`});
      }
    });
  },
});

