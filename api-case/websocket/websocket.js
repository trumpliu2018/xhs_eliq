Page({
  onShareAppMessage() {
    return {
      title: 'WebSocket 测试工具',
      path: 'packageAPI/pages/websocket/websocket',
    };
  },

  data: {
    socketUrl: 'wss://echo.websocket.org',
    socketTask: '',
    message: 'Hello, WebSocket!',
    receivedMsg: '',
    connectionStatus: '未连接'
  },

  onLoad() {
    xhs.onSocketOpen(result => {
      console.log('socket 已连接');
      this.setData({
        connectionStatus: '已连接',
        receivedMsg: 'socket 已成功连接\n\n服务器响应头: ' + JSON.stringify(result.header)
      });
    });
    
    // 在所有设置receivedMsg的地方调用滚动方法
    xhs.onSocketMessage((result) => {
      console.log('收到消息: ' + result.data);
      this.setData({
        receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 收到消息: ' + result.data
      }, () => {
        this.scrollToBottom();  // 消息更新后滚动到底部
      });
    });
    

    xhs.onSocketError((err) => {
      console.error('socket 错误: ', err);
      this.setData({
        connectionStatus: '连接错误',
        receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 错误: ' + JSON.stringify(err)
      });
    });

    xhs.onSocketClose((res) => {
      console.log('socket 已关闭', res);
      this.setData({
        connectionStatus: '已关闭',
        receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 连接已关闭 (code: ' + res.code + ')'
      });
      this.data.socketTask = null;
    });
  },

  urlInputOnChange(e) {
    this.setData({
      socketUrl: e.detail.value
    });
  },

  sendInputOnChange(e) {
    this.setData({
      message: e.detail.value
    });
  },

  // 新增自动滚动到底部的方法
  scrollToBottom() {
    // 使用小程序API获取textarea元素并滚动到底部
    xhs.createSelectorQuery().select('#messageTextarea').boundingClientRect((rect) => {
      xhs.createSelectorQuery().select('#messageTextarea').context((res) => {
        res.context.scrollTop = rect.height;  // 设置滚动条位置到最底部
      }).exec();
    }).exec();
  },

  connect() {
    // 关闭已有连接
    if (this.data.socketTask) {
      xhs.closeSocket();
    }

    this.setData({
      connectionStatus: '连接中...',
      receivedMsg: '正在连接到 ' + this.data.socketUrl + '...'
    });

    console.log('开始连接: ' + this.data.socketUrl);
    this.data.socketTask = xhs.connectSocket({
      url: this.data.socketUrl,
      header: {'content-type':'application/json'},
      method: 'GET',
      protocols: [],
      success: () => {},
      fail: (err) => {
        this.setData({
          connectionStatus: '连接失败',
          receivedMsg: '连接失败: ' + JSON.stringify(err)
        });
      },
      complete: () => {}
    });
  },

  sendMessage() {
    if (!this.data.socketTask) {
      this.setData({
        receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 错误: 请先建立连接'
      });
      return;
    }

    const msg = this.data.message;
    if (!msg.trim()) {
      this.setData({
        receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 错误: 消息不能为空'
      });
      return;
    }

    console.log('发送消息: ' + msg);
    this.setData({
      receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 发送消息: ' + msg
    }, () => {
      this.scrollToBottom();  // 发送消息后滚动到底部
    });

    xhs.sendSocketMessage({
      data: msg,
      fail: (err) => {
        this.setData({
          receivedMsg: this.data.receivedMsg + '\n\n[' + new Date().toLocaleTimeString() + '] 发送失败: ' + JSON.stringify(err)
        });
      }
    });
  },

  onUnload() {
    if (this.data.socketTask) {
      xhs.closeSocket({
        code: 1000,
        reason: '页面关闭'
      });
    }
  },
  
  // 新增关闭连接方法
  closeSocket() {
    if (this.data.socketTask) {
      xhs.closeSocket({
        code: 1000,
        reason: '用户主动关闭',
        success: () => {
          this.setData({
            receivedMsg: this.data.receivedMsg + '\n[系统消息] 连接已关闭',
            connectionStatus: '已关闭'
          });
          this.data.socketTask = null;
        },
        fail: () => {
          this.setData({
            receivedMsg: this.data.receivedMsg + '\n[错误] 关闭连接失败'
          });
        }
      });
    } else {
      this.setData({
        receivedMsg: this.data.receivedMsg + '\n[提示] 没有活跃的连接'
      });
    }
  },
});