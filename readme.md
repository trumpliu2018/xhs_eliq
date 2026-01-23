# 小红书官方演示小程序 - 技术栈文档

## 📋 项目概述

这是一个**小红书官方演示小程序**，用于展示小红书小程序平台的完整开发能力和最佳实践。项目包含 74 个组件案例和 56 个 API 能力演示，是小红书小程序开发的官方学习参考。

- **项目名称**: eliq (小红书演示小程序)
- **平台版本**: libVersion 3.136.0
- **AppID**: 67f67f511b5fea0001b9c22e

---

## 🏗️ 核心技术框架

### 1. 小红书小程序框架

小红书小程序采用类似微信小程序的开发模式，但使用平台特有的命名空间和文件格式。

#### 文件类型
| 文件类型 | 扩展名 | 说明 |
|---------|--------|------|
| 模板文件 | `.xhsml` | 类似微信小程序的 `.wxml`，用于页面结构 |
| 样式文件 | `.css` | 标准 CSS 样式 |
| 逻辑文件 | `.js` | JavaScript 逻辑代码 |
| 配置文件 | `.json` | 页面/组件配置 |
| 骨架屏模板 | `.skeleton.xhsml` | 骨架屏结构文件 |
| 骨架屏样式 | `.skeleton.css` | 骨架屏样式文件 |

#### 全局对象
```javascript
xhs // 小红书小程序全局对象（类似微信的 wx）
App() // 注册小程序
Page() // 注册页面
Component() // 注册组件
```

---

## 📦 项目架构

### 分包结构

```
eliq/
├── 主包 (entry/)
│   ├── component/         # 组件展示页
│   ├── api/              # API 演示页
│   ├── search/           # 搜索页
│   └── guide/            # 运营指南页
│
├── 分包1: component-case/  (74个组件案例)
│   ├── button/           # 按钮组件
│   ├── input/            # 输入框组件
│   ├── video/            # 视频组件
│   ├── map/              # 地图组件
│   ├── post-note-button/ # 发小红书按钮（业务组件）
│   ├── group-chat-card/  # 群聊组件（业务组件）
│   └── ...               # 更多组件
│
├── 分包2: api-case/        (56个API演示)
│   ├── login/            # 登录API
│   ├── request/          # 网络请求
│   ├── storage/          # 数据存储
│   ├── post-note/        # 发布笔记API
│   └── ...               # 更多API
│
└── 独立分包: independentPkg/
    └── pages/index       # 独立页面
```

### 分包配置特点

- ✅ **主包**: 4个核心页面 + TabBar
- ✅ **普通分包**: 按需加载，减少首屏体积
- ✅ **独立分包**: `independent: true`，可独立运行

---

## ⚙️ 开发技术特性

### 编译配置

```json
{
  "enableVDom": true,           // 虚拟DOM支持
  "enableV2": false,            // 旧版渲染引擎关闭
  "useNewCompiler": true,       // 新版编译器
  "es6": true,                  // ES6语法支持
  "postcss": true,              // PostCSS处理
  "minified": true,             // 代码压缩
  "bundle": false,              // 不启用打包
  "useMultiFrameRuntime": true, // 多帧运行时
  "useApiHook": true,           // API Hook
  "useLiteCompiler": true       // 轻量编译器
}
```

### 模板语法 (XHSML)

#### 数据绑定
```xml
<view>{{message}}</view>
<view data-id="{{id}}">数据属性</view>
```

#### 条件渲染
```xml
<view xhs:if="{{condition}}">显示</view>
<view xhs:else>隐藏</view>
```

#### 列表渲染
```xml
<view xhs:for-items="{{items}}" 
      xhs:for-item="item" 
      xhs:key="*item">
  {{item.name}}
</view>
```

#### 事件绑定
```xml
<button bindtap="handleTap">点击</button>
<input bindinput="handleInput" />
<view catch:touchstart="handleTouch">阻止冒泡</view>
```

#### 模板引用
```xml
<!-- 模板定义 -->
<template name="item">
  <view>{{text}}</view>
</template>

<!-- 模板使用 -->
<template is="item" data="{{text: 'hello'}}"/>

<!-- 文件引用 -->
<include src="templates.xhsml" />
```

---

## 🎨 组件系统

### 1. 业务组件（小红书特有）

| 组件名称 | 说明 | 使用场景 |
|---------|------|---------|
| `post-note-button` | 发小红书按钮 | 快速发布笔记入口 |
| `group-chat-card` | 群聊组件 | 群聊卡片展示 |

### 2. 表单组件

| 组件 | 说明 | 主要属性 |
|------|------|---------|
| `button` | 按钮 | type, size, disabled, loading, hover-class |
| `switch` | 开关 | checked, type, color |
| `checkbox` | 复选框 | value, checked, disabled |
| `radio` | 单选框 | value, checked, disabled |
| `input` | 输入框 | value, type, placeholder, maxlength |
| `textarea` | 多行输入 | value, placeholder, maxlength |
| `picker` | 底部滚动选择器 | mode, range, value |
| `picker-view` | 嵌入式滚动选择器 | value, indicator-style |
| `slider` | 滑动选择器 | min, max, value, step |
| `editor` | 富文本编辑器 | placeholder, read-only |
| `form` | 表单容器 | report-submit |
| `label` | 标签 | for |

### 3. 视图容器

| 组件 | 说明 | 特性 |
|------|------|------|
| `view` | 基础视图 | 块级容器，支持 hover-class |
| `scroll-view` | 可滚动视图 | scroll-x, scroll-y, scroll-into-view |
| `swiper` | 滑块视图 | indicator-dots, autoplay, interval |
| `movable-area` | 可移动区域 | 配合 movable-view 使用 |
| `movable-view` | 可移动元素 | direction, inertia, out-of-bounds |
| `cover-view` | 原生组件覆盖层 | 可覆盖 map, video 等原生组件 |

### 4. 基础内容

| 组件 | 说明 | 特性 |
|------|------|------|
| `text` | 文本 | selectable, space, decode |
| `rich-text` | 富文本 | nodes（支持 HTML 字符串或节点数组） |
| `icon` | 图标 | type, size, color |
| `progress` | 进度条 | percent, show-info, stroke-width |

### 5. 媒体组件

| 组件 | 说明 | 特性 |
|------|------|------|
| `image` | 图片 | src, mode, lazy-load, webp |
| `video` | 视频 | src, controls, autoplay, loop |
| `video-player` | 短剧播放器 | **专为短剧业务服务** |
| `camera` | 相机 | mode, device-position, flash |
| `audio` | 音频 | src, controls, loop |

### 6. 地图组件

| 组件 | 说明 | 特性 |
|------|------|------|
| `map` | 地图 | longitude, latitude, markers, polyline |

### 7. 导航组件

| 组件 | 说明 | 特性 |
|------|------|------|
| `navigator` | 页面导航 | url, open-type, hover-class |

### 8. 开放能力组件

| 组件 | 说明 | 特性 |
|------|------|------|
| `webview` | 网页容器 | 承载 H5 页面 |
| `mp-html` | HTML 富文本 | 渲染 HTML 内容 |

### 9. 自定义组件

#### 组件定义
```javascript
// common/component/showbox/index.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    handleTap() {
      this.triggerEvent('custom-event', { value: 'data' })
    }
  }
})
```

#### 组件使用
```json
// 页面配置 button.json
{
  "usingComponents": {
    "showbox": "../../common/component/showbox/index"
  }
}
```

```xml
<!-- 页面使用 -->
<showbox title="标题">
  <view>内容</view>
</showbox>
```

---

## 🔌 核心 API 能力

### 1. 基础能力

#### 系统信息
```javascript
// 同步获取
const systemInfo = xhs.getSystemInfoSync()
console.log(systemInfo.platform) // ios / android
console.log(systemInfo.version)  // 小程序版本

// 异步获取
xhs.getSystemInfo({
  success(res) {
    console.log(res.windowWidth)
    console.log(res.windowHeight)
  }
})
```

#### 版本更新
```javascript
const updateManager = xhs.getUpdateManager()

updateManager.onUpdateReady(() => {
  xhs.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启小程序？',
    success: res => {
      if (res.confirm) {
        updateManager.applyUpdate()
      }
    }
  })
})
```

#### 能力检测
```javascript
const canUse = xhs.canIUse('getLocation')
```

#### 小程序启动
```javascript
// 获取启动参数
const launchOptions = xhs.getLaunchOptionsSync()
const enterOptions = xhs.getEnterOptionsSync()
```

### 2. 路由管理

| API | 说明 | 特点 |
|-----|------|------|
| `xhs.navigateTo()` | 保留当前页面，跳转到新页面 | 可返回 |
| `xhs.redirectTo()` | 关闭当前页面，跳转到新页面 | 不可返回 |
| `xhs.navigateBack()` | 返回上一页或多级页面 | delta 参数 |
| `xhs.reLaunch()` | 关闭所有页面，打开新页面 | 重启应用 |
| `xhs.switchTab()` | 跳转到 TabBar 页面 | 关闭其他非 TabBar 页面 |
| `xhs.exitMiniProgram()` | 退出小程序 | 返回到宿主应用 |

```javascript
// 页面跳转示例
xhs.navigateTo({
  url: '/pages/detail/detail?id=123',
  success() {
    console.log('跳转成功')
  }
})
```

### 3. 界面交互

#### 提示框
```javascript
// 加载提示
xhs.showLoading({ title: '加载中...' })
xhs.hideLoading()

// 消息提示
xhs.showToast({
  title: '成功',
  icon: 'success',
  duration: 2000
})

// 模态对话框
xhs.showModal({
  title: '提示',
  content: '确定要删除吗？',
  success(res) {
    if (res.confirm) {
      console.log('用户点击确定')
    }
  }
})

// 操作菜单
xhs.showActionSheet({
  itemList: ['选项1', '选项2', '选项3'],
  success(res) {
    console.log('选中了', res.tapIndex)
  }
})
```

#### 导航栏
```javascript
// 设置导航栏标题
xhs.setNavigationBarTitle({
  title: '新标题'
})

// 设置导航栏颜色
xhs.setNavigationBarColor({
  frontColor: '#ffffff',
  backgroundColor: '#ff0000',
  animation: {
    duration: 400,
    timingFunc: 'easeIn'
  }
})
```

#### TabBar
```javascript
// 设置 TabBar 某一项
xhs.setTabBarItem({
  index: 0,
  text: '新文本',
  iconPath: '/path/to/icon.png',
  selectedIconPath: '/path/to/selected-icon.png'
})

// 设置 TabBar 样式
xhs.setTabBarStyle({
  color: '#333',
  selectedColor: '#FF0000',
  backgroundColor: '#FFF'
})
```

#### 下拉刷新
```javascript
// 开启下拉刷新
xhs.startPullDownRefresh({
  success() {
    console.log('刷新中')
  }
})

// 停止下拉刷新
xhs.stopPullDownRefresh()
```

#### 动画
```javascript
const animation = xhs.createAnimation({
  duration: 1000,
  timingFunction: 'ease',
})

animation.scale(2).rotate(45).step()

this.setData({
  animationData: animation.export()
})
```

#### 节点查询
```javascript
const query = xhs.createSelectorQuery()
query.select('#myId').boundingClientRect()
query.selectViewport().scrollOffset()
query.exec(res => {
  console.log(res[0]) // #myId 的节点信息
  console.log(res[1]) // 显示区域的滚动位置
})
```

#### 节点监听
```javascript
const observer = xhs.createIntersectionObserver()
observer.relativeToViewport().observe('.target', res => {
  console.log('元素是否可见', res.intersectionRatio > 0)
})
```

#### 菜单按钮
```javascript
const rect = xhs.getMenuButtonBoundingClientRect()
console.log(rect.width, rect.height, rect.top, rect.right)
```

### 4. 网络请求

#### HTTP 请求
```javascript
xhs.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: { id: 123 },
  header: {
    'content-type': 'application/json'
  },
  success(res) {
    console.log(res.data)
  },
  fail(err) {
    console.error(err)
  }
})
```

#### SSE 请求（Server-Sent Events）
```javascript
// 支持 SSE 长连接
xhs.request({
  url: 'https://api.example.com/sse',
  enableChunked: true,
  success(res) {
    // 处理流式响应
  }
})
```

#### 文件上传
```javascript
xhs.chooseImage({
  count: 1,
  success(res) {
    const tempFilePath = res.tempFilePaths[0]
    
    const uploadTask = xhs.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      success(res) {
        console.log('上传成功', res.data)
      }
    })
    
    uploadTask.onProgressUpdate(res => {
      console.log('上传进度', res.progress)
    })
  }
})
```

#### 文件下载
```javascript
const downloadTask = xhs.downloadFile({
  url: 'https://example.com/file.pdf',
  success(res) {
    xhs.openDocument({
      filePath: res.tempFilePath
    })
  }
})

downloadTask.onProgressUpdate(res => {
  console.log('下载进度', res.progress)
})
```

#### WebSocket
```javascript
const socketTask = xhs.connectSocket({
  url: 'wss://example.com/socket'
})

socketTask.onOpen(() => {
  console.log('WebSocket 连接已打开')
  socketTask.send({ data: 'Hello' })
})

socketTask.onMessage(res => {
  console.log('收到消息', res.data)
})

socketTask.onClose(() => {
  console.log('WebSocket 连接已关闭')
})
```

### 5. 数据存储

#### 同步存储
```javascript
// 存储数据
xhs.setStorageSync('key', 'value')

// 读取数据
const value = xhs.getStorageSync('key')

// 清空数据
xhs.clearStorageSync()

// 获取存储信息
const info = xhs.getStorageInfoSync()
console.log(info.keys, info.currentSize, info.limitSize)
```

#### 异步存储
```javascript
// 存储数据
xhs.setStorage({
  key: 'userInfo',
  data: { name: '张三', age: 25 },
  success() {
    console.log('存储成功')
  }
})

// 读取数据
xhs.getStorage({
  key: 'userInfo',
  success(res) {
    console.log(res.data)
  }
})

// 清空数据
xhs.clearStorage()
```

### 6. 媒体处理

#### 图片
```javascript
// 选择图片
xhs.chooseImage({
  count: 9,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success(res) {
    const tempFilePaths = res.tempFilePaths
  }
})

// 预览图片
xhs.previewImage({
  current: 'https://example.com/image.jpg',
  urls: ['image1.jpg', 'image2.jpg', 'image3.jpg']
})

// 保存图片到相册
xhs.saveImageToPhotosAlbum({
  filePath: tempFilePath,
  success() {
    xhs.showToast({ title: '保存成功' })
  }
})

// 获取图片信息
xhs.getImageInfo({
  src: 'https://example.com/image.jpg',
  success(res) {
    console.log(res.width, res.height, res.type)
  }
})
```

#### 视频
```javascript
// 选择视频
xhs.chooseVideo({
  sourceType: ['album', 'camera'],
  maxDuration: 60,
  camera: 'back',
  success(res) {
    console.log(res.tempFilePath)
  }
})
```

### 7. 位置服务

```javascript
// 获取当前位置
xhs.getLocation({
  type: 'gcj02',
  success(res) {
    console.log(res.latitude, res.longitude)
  }
})

// 开启位置更新
xhs.startLocationUpdate({
  success() {
    xhs.onLocationChange(res => {
      console.log('位置变化', res.latitude, res.longitude)
    })
  }
})

// 停止位置更新
xhs.stopLocationUpdate()

// 选择位置
xhs.chooseLocation({
  success(res) {
    console.log(res.name, res.address)
  }
})

// 打开地图
xhs.openLocation({
  latitude: 39.9042,
  longitude: 116.4074,
  name: '天安门',
  address: '北京市东城区'
})
```

### 8. 开放接口（小红书特有）

#### 🔥 发布笔记
```javascript
xhs.postNote({
  title: '笔记标题',
  content: '笔记内容',
  images: ['image1.jpg', 'image2.jpg'],
  success(res) {
    console.log('发布成功', res.noteId)
  }
})
```

#### 🔥 支付宝授权
```javascript
xhs.alipayAuth({
  success(res) {
    console.log('授权成功', res.authCode)
  }
})
```

#### 登录
```javascript
xhs.login({
  success(res) {
    console.log('登录成功', res.code)
    // 将 code 发送到后端换取 openid/session_key
  }
})

// 检查登录态
xhs.checkSession({
  success() {
    console.log('登录态有效')
  },
  fail() {
    console.log('登录态失效，需要重新登录')
  }
})
```

#### 用户信息
```javascript
// 获取用户信息（需用户授权）
xhs.getUserProfile({
  desc: '用于完善用户资料',
  success(res) {
    console.log(res.userInfo)
    // { nickName, avatarUrl, gender, city, province, country }
  }
})

// 打开用户主页
xhs.openUserProfile({
  userId: 'user_id'
})

// 获取账号信息
const accountInfo = xhs.getAccountInfoSync()
console.log(accountInfo.miniProgram.appId)
console.log(accountInfo.miniProgram.version)
```

#### 支付
```javascript
xhs.requestPayment({
  timeStamp: '',
  nonceStr: '',
  package: '',
  signType: 'MD5',
  paySign: '',
  success(res) {
    console.log('支付成功')
  }
})
```

#### 分享
```javascript
// 显示分享菜单
xhs.showShareMenu({
  withShareTicket: true
})

// 隐藏分享菜单
xhs.hideShareMenu()

// 页面级分享配置
Page({
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  }
})
```

#### 授权设置
```javascript
// 提前向用户发起授权请求
xhs.authorize({
  scope: 'scope.userLocation',
  success() {
    xhs.getLocation()
  }
})

// 获取用户的当前设置
xhs.getSetting({
  success(res) {
    console.log(res.authSetting)
  }
})

// 打开设置页面
xhs.openSetting({
  success(res) {
    console.log(res.authSetting)
  }
})
```

#### 收货地址
```javascript
xhs.chooseAddress({
  success(res) {
    console.log(res.userName)
    console.log(res.telNumber)
    console.log(res.provinceName)
    console.log(res.cityName)
    console.log(res.detailInfo)
  }
})
```

### 9. 设备能力

#### 截屏录屏
```javascript
// 设置截屏录屏时的视觉效果
xhs.setVisualEffectOnCapture({
  visualEffect: 'hidden' // 或 'none'
})

// 获取录屏状态
xhs.getScreenRecordingState({
  success(res) {
    console.log('是否在录屏', res.state)
  }
})

// 监听用户截屏
xhs.onUserCaptureScreen(() => {
  console.log('用户进行了截屏操作')
})

// 监听录屏状态变化
xhs.onScreenRecorderStateChange(res => {
  console.log('录屏状态', res.state)
})
```

#### 屏幕亮度
```javascript
xhs.setScreenBrightness({
  value: 0.8 // 0-1 之间
})
```

#### 剪贴板
```javascript
// 设置剪贴板内容
xhs.setClipboardData({
  data: 'hello world',
  success() {
    xhs.showToast({ title: '复制成功' })
  }
})

// 获取剪贴板内容
xhs.getClipboardData({
  success(res) {
    console.log(res.data)
  }
})
```

#### 网络状态
```javascript
xhs.getNetworkType({
  success(res) {
    console.log(res.networkType) // wifi, 2g, 3g, 4g, 5g, none
  }
})
```

#### 拨打电话
```javascript
xhs.makePhoneCall({
  phoneNumber: '10086'
})
```

#### 扫码
```javascript
xhs.scanCode({
  success(res) {
    console.log('扫码结果', res.result)
    console.log('扫码类型', res.scanType)
  }
})
```

### 10. 文件系统

```javascript
const fs = xhs.getFileSystemManager()

// 写入文件
fs.writeFile({
  filePath: `${xhs.env.USER_DATA_PATH}/test.txt`,
  data: 'hello world',
  encoding: 'utf8',
  success() {
    console.log('写入成功')
  }
})

// 读取文件
fs.readFile({
  filePath: `${xhs.env.USER_DATA_PATH}/test.txt`,
  encoding: 'utf8',
  success(res) {
    console.log(res.data)
  }
})

// 追加文件
fs.appendFile({
  filePath: `${xhs.env.USER_DATA_PATH}/test.txt`,
  data: '\nnew line'
})

// 删除文件
fs.unlink({
  filePath: `${xhs.env.USER_DATA_PATH}/test.txt`
})

// 重命名文件
fs.rename({
  oldPath: 'old.txt',
  newPath: 'new.txt'
})

// 复制文件
fs.copyFile({
  srcPath: 'source.txt',
  destPath: 'dest.txt'
})

// 创建目录
fs.mkdir({
  dirPath: `${xhs.env.USER_DATA_PATH}/mydir`,
  recursive: true
})

// 读取目录
fs.readdir({
  dirPath: `${xhs.env.USER_DATA_PATH}`,
  success(res) {
    console.log(res.files)
  }
})

// 删除目录
fs.rmdir({
  dirPath: `${xhs.env.USER_DATA_PATH}/mydir`,
  recursive: true
})

// 获取文件信息
fs.stat({
  path: `${xhs.env.USER_DATA_PATH}/test.txt`,
  success(res) {
    console.log(res.stats.isFile())
    console.log(res.stats.size)
  }
})

// 检查文件是否存在
fs.access({
  path: `${xhs.env.USER_DATA_PATH}/test.txt`,
  success() {
    console.log('文件存在')
  }
})
```

### 11. 性能监测

```javascript
// 获取性能数据
const performance = xhs.getPerformance()
const entries = performance.getEntries()

// 监听性能数据
const observer = performance.createObserver(list => {
  console.log(list.getEntries())
})

observer.observe({ entryTypes: ['navigation', 'render', 'script'] })
```

### 12. 第三方平台

```javascript
// 获取第三方平台配置
xhs.getExtConfig({
  success(res) {
    console.log(res.extConfig)
  }
})

// 同步获取
const extConfig = xhs.getExtConfigSync()
```

---

## 🎯 特色功能

### 1. 直播预约
小红书小程序支持直播预约功能，用户可以预约感兴趣的直播。

### 2. 分享快照控制
支持站外分享时的截屏控制，可以自定义分享卡片的快照内容。

```javascript
// 分享配置
Page({
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg',
      // 控制快照
      withShareTicket: true
    }
  }
})
```

### 3. ShareTicket 支持
支持群分享回调，可以获取分享者信息。

```javascript
// 获取分享详情
xhs.getShareInfo({
  shareTicket: 'ticket_string',
  success(res) {
    console.log('分享到的群信息', res)
  }
})
```

### 4. 短剧播放器
专为短剧业务设计的播放器组件 `<video-player>`，提供专业的短剧播放体验。

### 5. 服务组件 Token 查询
支持服务组件 token 的查询和管理。

### 6. 错误监听机制

```javascript
App({
  onError(error) {
    console.log('全局错误监听', error)
  },
  
  onUnhandledRejection({ reason, promise }) {
    console.log('未处理的 Promise 拒绝', reason)
  }
})
```

---

## 🛠️ 工程化实践

### 1. 模块化

项目采用 CommonJS 模块规范：

```javascript
// 导出
module.exports = {
  formatTime,
  formatLocation
}

// 导入
const util = require('../../util/util.js')
const config = require('../../config.js')
```

### 2. 代码复用

#### 工具函数封装
```javascript
// util/util.js
function formatTime(time) {
  // 时间格式化逻辑
}

function compareVersion(v1, v2) {
  // 版本号比较逻辑
}

module.exports = {
  formatTime,
  compareVersion
}
```

#### 页面配置合并
```javascript
// util/mergePageOptions.js
function mergePageOptions(pageObject, templateJs) {
  return Object.assign({}, pageObject, templateJs)
}

// 使用
const __templateJs = require("./templates.js")
const __mergePageOptions = require("../../util/mergePageOptions.js")
Page(__mergePageOptions(pageObject, __templateJs))
```

### 3. 骨架屏技术

每个页面都可以配置骨架屏，提升首屏加载体验：

```
button/
├── button.xhsml          # 页面模板
├── button.js             # 页面逻辑
├── button.css            # 页面样式
├── button.skeleton.xhsml # 骨架屏模板
└── button.skeleton.css   # 骨架屏样式
```

```javascript
// 页面加载完成后移除骨架屏
Page({
  onLoad() {
    setTimeout(() => {
      this.removeSkeleton?.()
    }, 500)
  }
})
```

### 4. 性能优化

#### 分包加载
```json
{
  "subPackages": [
    {
      "root": "component-case",
      "name": "component-case",
      "pages": ["button/button", "input/input"]
    }
  ]
}
```

#### 独立分包
```json
{
  "subPackages": [
    {
      "root": "independentPkg",
      "independent": true,
      "pages": ["pages/index"]
    }
  ]
}
```

#### 按需加载
- 组件懒加载
- 图片懒加载：`<image lazy-load="{{true}}" />`

### 5. 配置管理

统一配置文件 `config.js`：

```javascript
module.exports = {
  component: [
    {
      name: '业务组件',
      list: [...]
    }
  ],
  api: [
    {
      name: '基础',
      list: [...]
    }
  ],
  requestUrl: 'https://e.xiaohongshu.com/home'
}
```

---

## 🎨 UI 设计系统

### 1. 全局样式

```css
/* app.css */
@import "./common/global.css";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: -apple-system-font, Helvetica Neue, Helvetica, sans-serif;
  font-size: 100px; /* rem 基准 */
  color: #333;
  background-color: #EFF1F2;
}

.container {
  font-size: .14rem; /* 14px */
  overflow: hidden;
}
```

### 2. 响应式单位

采用 rem 单位，基准为 100px：
- `.14rem` = 14px
- `.16rem` = 16px
- `.20rem` = 20px

### 3. 四级按钮体系

| 级别 | 样式类名 | 说明 |
|-----|---------|------|
| 一级 | `_ui-button` | 主按钮，红色背景 |
| 二级 | `_ui-button-transparent` | 透明按钮，红色边框 |
| 三级 | `_ui-button-gray` | 灰色背景按钮 |
| 四级 | `_ui-button-transparent-gray` | 透明灰色按钮 |

### 4. 常用工具类

```css
._mt8 { margin-top: 8px; }
._ml8 { margin-left: 8px; }
._px10 { padding: 0 10px; }
```

### 5. 可复用组件

- `<showbox>`: 展示容器
- `<box>`: 内容盒子
- `<container>`: 页面容器
- `<apipan>`: API 面板
- `<api-status>`: API 状态

---

## 📱 页面生命周期

### App 生命周期

```javascript
App({
  onLaunch(options) {
    // 小程序初始化
    console.log('App launched', options)
  },
  
  onShow(options) {
    // 小程序显示
    console.log('App shown', options)
  },
  
  onHide() {
    // 小程序隐藏
  },
  
  onError(error) {
    // 错误监听
  },
  
  onUnhandledRejection({ reason, promise }) {
    // Promise 拒绝监听
  },
  
  onPageNotFound(res) {
    // 页面不存在
    xhs.redirectTo({
      url: '/pages/error/error'
    })
  },
  
  getLaunchOptionsSync(options) {
    // 获取启动参数
  },
  
  getEnterOptionsSync(options) {
    // 获取进入参数
  }
})
```

### Page 生命周期

```javascript
Page({
  data: {
    // 页面数据
  },
  
  onLoad(options) {
    // 页面加载，接收路由参数
    console.log('Page loaded', options)
  },
  
  onShow() {
    // 页面显示
  },
  
  onReady() {
    // 页面首次渲染完成
  },
  
  onHide() {
    // 页面隐藏
  },
  
  onUnload() {
    // 页面卸载
  },
  
  onPullDownRefresh() {
    // 下拉刷新
    xhs.stopPullDownRefresh()
  },
  
  onReachBottom() {
    // 上拉触底
  },
  
  onPageScroll(e) {
    // 页面滚动
    console.log(e.scrollTop)
  },
  
  onShareAppMessage() {
    // 分享配置
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  },
  
  onTabItemTap(item) {
    // Tab 点击
    console.log(item.index, item.pagePath, item.text)
  }
})
```

### Component 生命周期

```javascript
Component({
  lifetimes: {
    created() {
      // 组件实例创建
    },
    
    attached() {
      // 组件进入页面节点树
    },
    
    ready() {
      // 组件布局完成
    },
    
    moved() {
      // 组件实例被移动
    },
    
    detached() {
      // 组件实例被移除
    }
  },
  
  pageLifetimes: {
    show() {
      // 组件所在页面显示
    },
    
    hide() {
      // 组件所在页面隐藏
    },
    
    resize(size) {
      // 组件所在页面尺寸变化
    }
  }
})
```

---

## 📊 项目统计

### 文件规模

- **主包页面**: 4 个
- **分包1 (component-case)**: 74 个组件案例
- **分包2 (api-case)**: 56 个 API 演示
- **独立分包**: 1 个独立页面
- **自定义组件**: 5 个公共组件
- **工具函数**: 3 个工具模块

### 组件分类统计

| 分类 | 数量 |
|------|------|
| 业务组件 | 2 |
| 表单组件 | 12 |
| 视图容器 | 4 |
| 基础内容 | 5 |
| 媒体组件 | 4 |
| 地图组件 | 1 |
| 导航组件 | 1 |
| 开放能力 | 9 |
| 自定义组件 | 1 |

### API 分类统计

| 分类 | 数量 |
|------|------|
| 基础 | 4 |
| 路由 | 1 |
| 界面 | 13 |
| 网络 | 5 |
| 数据缓存 | 2 |
| 媒体 | 2 |
| 位置 | 2 |
| 开放接口 | 9 |
| 设备 | 6 |
| 文件 | 3 |
| 第三方平台 | 1 |

---

## 🔧 开发工具

### 推荐工具链

1. **小红书开发者工具**: 官方 IDE
2. **编辑器**: VSCode / WebStorm
3. **版本控制**: Git
4. **调试工具**: Chrome DevTools（通过开发者工具）

### VSCode 插件推荐

- 语法高亮支持
- 代码片段
- 智能提示

---

## 📚 学习路径

### 新手入门

1. 了解小程序基本概念
2. 学习 XHSML 模板语法
3. 掌握数据绑定和事件处理
4. 练习基础组件使用

### 进阶开发

1. 组件化开发
2. API 能力深入
3. 性能优化技巧
4. 分包策略

### 高级应用

1. 复杂业务场景处理
2. 自定义组件开发
3. 第三方平台对接
4. 线上问题排查

---

## 🎉 小红书平台特色

### 与微信小程序的主要区别

| 特性 | 小红书小程序 | 微信小程序 |
|------|-------------|-----------|
| 全局对象 | `xhs` | `wx` |
| 模板文件 | `.xhsml` | `.wxml` |
| 发布笔记 | ✅ `postNote()` | ❌ |
| 群聊组件 | ✅ `group-chat-card` | ❌ |
| 短剧播放器 | ✅ `video-player` | ❌ |
| 支付宝授权 | ✅ `alipayAuth()` | ❌ |
| SSE 请求 | ✅ 支持 | 部分支持 |

### 独特优势

1. **内容创作**: 深度集成小红书内容生态
2. **社交属性**: 群聊、分享能力强大
3. **电商闭环**: 从内容到交易的完整链路
4. **用户画像**: 精准的年轻女性用户群体
5. **品牌营销**: 适合品牌宣传和种草

---

## 📄 配置文件说明

### project.config.json

```json
{
  "compileType": "miniprogram",
  "libVersion": "3.136.0",
  "appid": "your-appid",
  "projectname": "project-name",
  "setting": {
    "enableVDom": true,
    "es6": true,
    "postcss": true,
    "minified": true
  }
}
```

### app.json

```json
{
  "pages": [
    "pages/index/index"
  ],
  "subPackages": [],
  "window": {
    "navigationBarTitleText": "小程序标题",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f7f7f7"
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/icon.png",
        "selectedIconPath": "images/icon-active.png"
      }
    ]
  },
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于定位"
    }
  }
}
```

### page.json

```json
{
  "navigationBarTitleText": "页面标题",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "custom-component": "/components/custom/index"
  }
}
```

---

## 🚀 最佳实践

### 1. 性能优化

- ✅ 使用分包加载减少首屏体积
- ✅ 图片懒加载和压缩
- ✅ 避免频繁 setData
- ✅ 合理使用骨架屏
- ✅ 减少 WXML 节点深度
- ✅ 使用虚拟 DOM 模式

### 2. 代码规范

- ✅ 统一的代码风格
- ✅ 合理的文件组织
- ✅ 清晰的命名规范
- ✅ 完善的注释文档
- ✅ 模块化和组件化

### 3. 用户体验

- ✅ 加载状态提示
- ✅ 错误处理和提示
- ✅ 流畅的页面过渡
- ✅ 合理的交互反馈
- ✅ 无障碍访问支持

### 4. 安全规范

- ✅ 数据加密传输
- ✅ 敏感信息保护
- ✅ 权限合理申请
- ✅ 输入验证和过滤
- ✅ 防止 XSS 和注入攻击

---

## 📞 相关资源

- **官方文档**: 小红书开发者平台
- **开发者社区**: 小红书开发者论坛
- **示例代码**: 本项目 (eliq)
- **问题反馈**: 开发者工具反馈通道

---

## 📝 版本历史

- **v3.136.0**: 当前版本
  - 支持虚拟 DOM
  - 新增短剧播放器
  - 优化编译性能
  - 完善 API 能力

---

## 🎓 总结

小红书小程序是一个功能完整、生态成熟的小程序平台。通过本技术栈文档，开发者可以：

1. **快速上手**: 了解基础概念和开发流程
2. **深入学习**: 掌握组件和 API 使用
3. **最佳实践**: 学习工程化和优化技巧
4. **平台特色**: 利用小红书独特能力

本示例项目涵盖了小红书小程序开发的方方面面，是学习和参考的最佳资源。建议开发者：

- 🔍 **通读文档**: 全面了解平台能力
- 💻 **实践代码**: 运行和修改示例代码
- 🎯 **关注特色**: 重点学习平台独特功能
- 🚀 **持续优化**: 不断提升应用性能和体验

祝您开发顺利！ 🎉
