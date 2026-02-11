const api = require('../../util/api.js');

Page({
  data: {
    articles: [],
    isLoading: false,
    hasMore: true,
    page: 1,
    size: 10
  },

  onLoad() {
    this.loadArticles();
  },

  onShow() {
    // 从详情返回时可刷新
  },

  loadArticles() {
    if (this.data.isLoading || !this.data.hasMore) return;
    this.setData({ isLoading: true });

    api.getArticles({ page: this.data.page, size: this.data.size })
      .then((res) => {
        const rawList = res.items || (Array.isArray(res) ? res : []);
        const articles = this.data.page === 1 ? rawList : [...this.data.articles, ...rawList];
        const hasMore = rawList.length >= this.data.size;
        const nextPage = this.data.page + 1;
        this.setData({
          articles,
          isLoading: false,
          hasMore,
          page: nextPage
        });
      })
      .catch((err) => {
        console.error('获取文章列表失败:', err);
        xhs.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
        this.setData({
          isLoading: false,
          articles: this.data.page === 1 ? [] : this.data.articles
        });
      });
  },

  onArticleTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    xhs.navigateTo({
      url: `/pages/article-webview/article-webview?id=${id}`
    });
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadArticles();
    setTimeout(() => xhs.stopPullDownRefresh(), 500);
  }
});
