# MBTI 性格测评小程序

## 文章详情页 Markdown 依赖

文章详情使用 [marked](https://github.com/markedjs/marked) 将 Markdown 转为 HTML。首次使用需安装依赖并构建 npm：

1. 在项目根目录执行：
   ```bash
   npm install
   ```
2. 在开发者工具中：**工具 → 构建 npm**（若使用微信/小红书等小程序 IDE）。
3. 构建完成后，文章详情页会使用 marked 渲染 Markdown；若未构建，将使用简易回退（仅转义 + 换行）。

## 项目结构

- `pages/article-detail/` 文章详情（星球文章）
- `pages/planet/` 星球列表
- `util/api.js` 接口封装
