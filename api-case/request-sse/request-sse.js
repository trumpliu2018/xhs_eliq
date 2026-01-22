const urls = [
  {
    name: "SSE GET请求",
    url: "https://sse.dev/test?interval=1",
    method: "GET",
  },
  // {
  //   name: "SSE GET请求",
  //   url: "http://10.21.79.82:3123/sse",
  //   method: "GET",
  // },
  // {
  //   name: "SSE POST请求",
  //   url: "http://10.21.79.82:3123/sse",
  //   method: "POST",
  // },
  {
    name: "普通GET请求",
    url: "https://echo.free.beeceptor.com/sample-request?author=beeceptor",
    method: "GET",
  },
  {
    name: "普通POST请求",
    url: "https://echo.free.beeceptor.com/sample-request?author=beeceptor",
    method: "POST",
  },
  {
    name: "接口404",
    url: "http://www.baidu.com/not-found",
    method: "GET",
  },
];

Page({
  data: {
    statusText: "",
    messages: [
      // {
      //   data: "示例数据1",
      //   id: "示例id1",
      //   retry: "示例retry1",
      //   event: "示例event1",
      // },
    ],
    responseData: null, // 响应数据
    isConnected: false,
    enbaleChunked: true, // 启用分块传输

    currentIndex: 0,
    urls: [...urls],
  },
  requestTask: null,

  toggleEnableChunked(event) {
    console.log("切换分块传输状态", event.detail.value);
    this.setData({
      enbaleChunked: event.detail.value,
    });
  },

  toggleConnect() {
    if (this.data.isConnected) {
      this.stopRequest();
    } else {
      this.startRequest();
    }
  },

  clearMessages() {
    this.setData({
      messages: [],
      responseData: null,
    });
  },

  startRequest() {
    this.setData({
      statusText: "正在连接服务器...",
      messages: [],
      responseData: null,
      isConnected: true,
    });
    this.streamText = "";
    // https://sse.dev/
    const url = this.data.urls[this.data.currentIndex].url;
    const method = this.data.urls[this.data.currentIndex].method;
    this.requestTask = wx.request({
      url: url, // SSE test endpoint
      method: method,
      enableChunked: this.data.enbaleChunked, // Key for SSE
      data: {
        timestamp: Date.now(),
        url: url,
        message: "Hello!",
      },
      success: (res) => {
        console.log("Request success:", res);

        if (res.statusCode >= 200 && res.statusCode < 400) {
          this.setData({
            statusText: `请求成功: ${res.statusCode}`,
            responseData: {
              statusCode: res.statusCode,
              data: typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data,
              header: typeof res.header === 'object' ? JSON.stringify(res.header, null, 2) : res.header,
              timestamp: new Date().toLocaleString()
            }
          });
        } else {
          this.setData({
            statusText: `服务器返回错误状态码: ${res.statusCode}`,
            messages: [],
            isConnected: false,
          });
        }
      },
      fail: (err) => {
        console.error("Request failed:", err);
        this.setData({
          statusText: `连接错误: ${err.message || err.errMsg || "未知错误"}`,
          messages: [],
          isConnected: false,
        });
      },
      complete: (res) => {
        console.log("Request complete.", typeof res);
        this.setData({
          isConnected: false,
        });
      },
    });
    this.onChunkReceivedBind = this.onChunkReceived.bind(this);
    this.onHeadersReceivedBind = this.onHeadersReceived.bind(this);
    this.requestTask?.onHeadersReceived(this.onHeadersReceivedBind);
    this.requestTask?.onChunkReceived(this.onChunkReceivedBind);
  },

  onHeadersReceived(headers) {
    console.log("Received headers:", headers);
  },

  onChunkReceived(res) {
    console.log("Received chunk:", res);
    const messages = this.data.messages || [];
    const obj = {};
    for (const line of res.data?.trim()?.split("\n")) {
      // 使用正则表达式提取字段名和值
      const match = line.match(/^(data|id|retry|event):(.*)$/);
      if (match) {
        const [, fieldName, value] = match;
        obj[fieldName] = value.trim();
      }
    }
    this.setData({
      messages: [...messages, obj],
    });
  },

  stopRequest() {
    if (this.requestTask) {
      this.requestTask?.offChunkReceived(this.onChunkReceivedBind);
      this.requestTask?.offHeadersReceived(this.onHeadersReceivedBind);
      this.requestTask?.abort();
      this.requestTask = null;
    }
    this.setData({
      statusText: "",
      isConnected: false,
    });
  },

  onUnload() {
    this.stopRequest();
  },

  // 显示ActionSheet
  showActionSheet() {
    const itemList = this.data.urls.map((item) => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const tapIndex = res.tapIndex;
        this.setData({
          currentIndex: tapIndex,
        });
      },
      fail: (err) => {
        console.error("ActionSheet 展示失败：", err);
      },
    });
  },

  // 设置URL方法（保留原来的功能）
  setUrl(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
    });
  },
});
