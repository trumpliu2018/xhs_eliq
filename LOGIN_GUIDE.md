# 小红书登录功能使用指南

## 功能概述

本项目已集成小红书小程序登录功能，支持用户使用小红书账号快速登录。

## 技术实现

### 1. 登录流程

**小红书小程序登录方式（与微信小程序不同）：**

小红书小程序没有 `xhs.getUserInfo()` API，需要使用 button 组件的 `open-type="getUserInfo"` 来获取用户授权。

```
用户点击登录按钮 (open-type="getUserInfo")
    ↓
触发 bindgetuserinfo 事件，获取用户信息（昵称、头像）
    ↓
调用 xhs.login() 获取 code
    ↓
将 code、昵称、头像发送到后端 API
    ↓
后端验证 code，返回 token 和用户信息
    ↓
前端保存 token 和用户信息到本地存储
    ↓
登录成功
```

**关键区别：**
- ❌ 不能使用 `xhs.getUserInfo()` API
- ✅ 必须使用 `<button open-type="getUserInfo">` 组件
- ✅ 通过 `bindgetuserinfo` 事件获取用户信息

### 2. API 接口

#### 小红书登录接口

```
POST /api/auth/xhs-login
```

**请求参数：**
```json
{
  "code": "小程序登录凭证",
  "nickname": "用户昵称（可选）",
  "avatar_url": "用户头像URL（可选）"
}
```

**响应数据：**
```json
{
  "token": "JWT Token",
  "user": {
    "id": 用户ID,
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "mbti_type": "MBTI类型（如果已测评）",
    "phone": "手机号",
    "email": "邮箱",
    "is_active": true,
    "role": "user",
    "created_at": "创建时间",
    "updated_at": "更新时间"
  }
}
```

### 3. 文件结构

```
/util/
  ├── api.js        # API 请求工具类
  ├── auth.js       # 认证工具类（登录、退出、状态检查）
  
/config/
  └── api.config.js # API 配置文件（开发/生产环境）

/pages/profile/
  ├── profile.js    # 个人中心页面（包含登录功能）
  ├── profile.xhsml # 个人中心模板
  └── profile.css   # 个人中心样式
```

## 配置说明

### 修改 API 地址

编辑 `config/api.config.js` 文件：

```javascript
const ENV = 'development'; // 'development' | 'production'

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8080/api', // 开发环境API地址
    timeout: 10000
  },
  production: {
    baseURL: 'https://your-api.com/api', // 生产环境API地址
    timeout: 10000
  }
};
```

## 小红书登录实现示例

### XHSML 模板（使用 button 组件）

```xml
<!-- 未登录状态 -->
<button 
  class="login-button" 
  open-type="getUserInfo" 
  bindgetuserinfo="handleGetUserInfo">
  点击登录
</button>
```

### JavaScript 处理（profile.js）

```javascript
const auth = require('../../util/auth.js');
const api = require('../../util/api.js');

Page({
  // 处理用户信息授权
  handleGetUserInfo(e) {
    console.log('handleGetUserInfo:', e);
    
    if (e.detail.userInfo) {
      // 用户同意授权
      const { nickName, avatarUrl } = e.detail.userInfo;
      
      xhs.showLoading({ title: '登录中...' });

      // 1. 获取 code
      xhs.login({
        success: (loginRes) => {
          const code = loginRes.code;
          
          // 2. 发送到后端
          api.xhsLogin(code, nickName, avatarUrl)
            .then((res) => {
              xhs.hideLoading();
              
              // 保存登录信息
              auth.saveAuthInfo(res.token, res.user);
              
              xhs.showToast({
                title: '登录成功',
                icon: 'success'
              });
            })
            .catch((err) => {
              xhs.hideLoading();
              xhs.showToast({
                title: err.message || '登录失败',
                icon: 'none'
              });
            });
        }
      });
    } else {
      // 用户拒绝授权
      xhs.showModal({
        title: '需要授权',
        content: '登录需要获取您的基本信息',
        showCancel: false
      });
    }
  }
});
```

## 使用方法

### 1. 在任何页面检查登录状态

```javascript
const auth = require('../../util/auth.js');

Page({
  onLoad() {
    if (auth.isLoggedIn()) {
      // 已登录
      const user = auth.getCurrentUser();
      console.log('当前用户:', user);
    } else {
      // 未登录
      console.log('用户未登录');
    }
  }
});
```

### 2. 在任何页面调用登录

```javascript
const auth = require('../../util/auth.js');

Page({
  handleLogin() {
    auth.login()
      .then((res) => {
        console.log('登录成功:', res);
        // 处理登录成功后的逻辑
      })
      .catch((err) => {
        console.error('登录失败:', err);
      });
  }
});
```

### 3. 退出登录

```javascript
const auth = require('../../util/auth.js');

Page({
  handleLogout() {
    auth.logout()
      .then((confirmed) => {
        if (confirmed) {
          console.log('已退出登录');
          // 处理退出登录后的逻辑
        }
      });
  }
});
```

### 4. 调用需要认证的 API

```javascript
const api = require('../../util/api.js');

Page({
  getUserInfo() {
    api.getUserProfile()
      .then((user) => {
        console.log('用户信息:', user);
        this.setData({ userInfo: user });
      })
      .catch((err) => {
        console.error('获取用户信息失败:', err);
        
        // 如果是 401 未授权，引导用户登录
        if (err.code === 401) {
          auth.login();
        }
      });
  }
});
```

## 本地存储

登录后，系统会在本地存储以下数据：

- `auth_token`: JWT Token（用于 API 认证）
- `user_info`: 用户信息对象

## 注意事项

### 1. 小程序权限配置

确保在 `app.json` 中配置了必要的权限：

```json
{
  "permission": {
    "scope.userInfo": {
      "desc": "用于获取您的昵称、头像等信息"
    }
  }
}
```

### 2. 后端配置

后端需要配置小红书小程序的 AppID 和 AppSecret：

```go
// 在后端配置文件中
XHS_APP_ID=your_app_id
XHS_APP_SECRET=your_app_secret
```

### 3. 网络请求域名

在小红书小程序后台配置服务器域名白名单：

- 开发环境：`http://localhost:8080`（仅限开发工具）
- 生产环境：`https://your-api.com`

### 4. 调试

开发环境可以通过以下方式查看登录状态：

```javascript
// 在控制台执行
console.log('Token:', xhs.getStorageSync('auth_token'));
console.log('User:', xhs.getStorageSync('user_info'));
```

## 常见问题

### Q1: 错误：xhs.getUserInfo is not a function

**A:** 这是正常的！小红书小程序**没有** `xhs.getUserInfo()` API。

**解决方案：**
使用 button 组件的 `open-type="getUserInfo"` 代替：

```xml
<button open-type="getUserInfo" bindgetuserinfo="handleGetUserInfo">
  点击登录
</button>
```

### Q2: 登录失败，提示"获取登录凭证失败"

**A:** 检查以下几点：
1. 确认 xhs.login() API 是否正常工作
2. 检查网络连接
3. 查看控制台错误日志
4. 确认后端服务是否正常运行

### Q3: 用户拒绝授权怎么办？

**A:** 当用户点击 button 时拒绝授权，`e.detail.userInfo` 会是 `undefined`：

```javascript
handleGetUserInfo(e) {
  if (e.detail.userInfo) {
    // 用户同意授权
  } else {
    // 用户拒绝授权
    xhs.showModal({
      title: '需要授权',
      content: '登录需要获取您的基本信息',
      showCancel: false
    });
  }
}
```

### Q4: 小红书 vs 微信小程序 API 对比

| 功能 | 微信小程序 | 小红书小程序 |
|------|-----------|-------------|
| 获取登录凭证 | `wx.login()` | `xhs.login()` ✅ |
| 获取用户信息 | `wx.getUserInfo()` | ❌ 不存在 |
| 获取用户信息（新） | `<button open-type="getUserInfo">` | `<button open-type="getUserInfo">` ✅ |
| 获取用户资料（新） | `wx.getUserProfile()` | 需要查看最新文档 |

### Q5: Token 过期怎么办？

**A:** 当 API 返回 401 错误时，说明 Token 已过期，需要重新登录：

```javascript
api.request('/some-api', { needAuth: true })
  .catch((err) => {
    if (err.code === 401) {
      auth.clearAuthInfo(); // 清除过期的登录信息
      auth.login();         // 重新登录
    }
  });
```

### Q6: 如何在请求拦截器中统一处理 Token？

**A:** 已在 `util/api.js` 中实现，所有需要认证的请求只需设置 `needAuth: true`：

```javascript
api.request('/user/profile', {
  method: 'GET',
  needAuth: true  // 自动在 header 中添加 Authorization: Bearer {token}
});
```

## 测试

### 测试登录流程

1. 打开小程序，进入"我"页面
2. 如果未登录，会显示"点击登录"按钮
3. 点击登录按钮
4. 授权后，登录成功，显示用户信息
5. 点击"退出登录"，清除登录状态

### 测试 API 调用

```javascript
// 在控制台执行
const auth = require('./util/auth.js');
const api = require('./util/api.js');

// 登录
auth.login().then(() => {
  // 调用需要认证的 API
  api.getUserProfile().then(user => {
    console.log('用户信息:', user);
  });
});
```

## 更新日志

- **v1.0.0** (2024-01-23)
  - ✅ 实现小红书登录功能
  - ✅ 集成 JWT Token 认证
  - ✅ 支持用户信息管理
  - ✅ 添加登录状态检查
  - ✅ 实现自动 Token 刷新机制
