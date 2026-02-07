const api = require('../../util/api.js');
let marked;
try {
  marked = require('marked');
} catch (e) {
  console.warn('marked 未安装，请在小程序根目录执行 npm install 并在 IDE 中构建 npm');
}

Page({
  data: {
    title: '',
    summary: '',
    contentHtml: '',
    author: '',
    view_count: 0,
    isLoading: true
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      xhs.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.articleId = id;
    xhs.showLoading({ title: '加载中...' });
    api.getArticle(id)
      .then((article) => {
        const htmlPromise = article.content_html
          ? Promise.resolve(article.content_html)
          : this.markdownToHtml(article.content || '');
        return htmlPromise.then((contentHtml) => {
          xhs.hideLoading();
          const finalHtml = typeof contentHtml === 'string' ? contentHtml : String(contentHtml || '');
          this.setData({
            title: article.title || '',
            summary: article.summary || '',
            contentHtml: finalHtml,
            author: article.author || '',
            view_count: article.view_count || 0,
            isLoading: false
          });
          if (article.title) {
            xhs.setNavigationBarTitle({ title: article.title });
          }
        });
      })
      .catch((err) => {
        xhs.hideLoading();
        console.error('获取文章失败:', err);
        xhs.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        });
        this.setData({ isLoading: false });
      });
  },

  markdownToHtml(markdown) {
    if (!markdown) return Promise.resolve('');
    if (typeof marked !== 'undefined' && marked.parse) {
      const DefaultRenderer = typeof marked.Renderer === 'function' ? marked.Renderer : function () {};
      const defaultRenderer = new DefaultRenderer();
      const renderer = new DefaultRenderer();
      // 小程序 rich-text 对 <blockquote> 可能无样式，改为带 class + 内联样式的 div，保证引用可见
      renderer.blockquote = function (quote) {
        const inner = typeof quote === 'string' ? quote : (defaultRenderer.blockquote ? defaultRenderer.blockquote.call(this, quote) : String(quote));
        const style = 'margin:16px 0;padding:14px 18px;border-left:4px solid #FF2442;background:rgba(255,36,66,0.06);color:#666;line-height:1.7;border-radius:0 8px 8px 0;display:block;box-sizing:border-box;';
        return '<div class="md-blockquote" style="' + style + '">' + inner + '</div>';
      };
      // 有序/无序列表：rich-text 内 >>> 可能不生效，用内联样式保证缩进
      renderer.list = function (token) {
        const html = defaultRenderer.list ? defaultRenderer.list.call(this, token) : '';
        return html
          .replace(/<ol([^>]*)>/g, '<ol$1 style="margin:12px 0;padding-left:36px;line-height:1.8;">')
          .replace(/<ul([^>]*)>/g, '<ul$1 style="margin:12px 0;padding-left:24px;line-height:1.8;">')
          .replace(/<li>/g, '<li style="margin-bottom:8px;padding-left:4px;">');
      };
      if (marked.use) {
        marked.use({ gfm: true, breaks: true, renderer: renderer });
      } else {
        marked.setOptions({ gfm: true, breaks: true, renderer: renderer });
      }
      const result = marked.parse(markdown);
      return Promise.resolve(result).then((html) => typeof html === 'string' ? html : '');
    }
    return Promise.resolve(this.markdownToHtmlFallback(markdown));
  },

  markdownToHtmlFallback(markdown) {
    if (!markdown) return '';
    return markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  }
});
