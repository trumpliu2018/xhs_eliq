const api = require('../../util/api.js');

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
        xhs.hideLoading();
        const contentHtml = article.content_html || this.markdownToHtml(article.content || '');
        this.setData({
          title: article.title || '',
          summary: article.summary || '',
          contentHtml,
          author: article.author || '',
          view_count: article.view_count || 0,
          isLoading: false
        });
        if (article.title) {
          xhs.setNavigationBarTitle({ title: article.title });
        }
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
    if (!markdown) return '';
    const escape = (s) => {
      if (!s) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
    const parseInline = (text) => {
      const imgs = [];
      let out = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        imgs.push({ alt: alt || '', url: url.trim() });
        return '\x00IMG' + (imgs.length - 1) + '\x00';
      });
      out = escape(out);
      out = out.replace(/\x00IMG(\d+)\x00/g, (_, n) => {
        const { alt: a, url: u } = imgs[parseInt(n, 10)];
        const safeUrl = (u || '').replace(/"/g, '&quot;');
        const safeAlt = (a || '').replace(/"/g, '&quot;');
        return '<img src="' + safeUrl + '" alt="' + safeAlt + '" class="md-img" />';
      });
      out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
      out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
      out = out.replace(/_(.+?)_/g, '<em>$1</em>');
      out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
      out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      return out;
    };
    const lines = markdown.split(/\n/);
    const out = [];
    let i = 0;
    let inCodeBlock = false;
    let codeBlockContent = [];
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = [];
        } else {
          out.push('<pre><code>' + escape(codeBlockContent.join('\n')) + '</code></pre>');
          inCodeBlock = false;
        }
        i++;
        continue;
      }
      if (inCodeBlock) {
        codeBlockContent.push(line);
        i++;
        continue;
      }
      const trimmed = line.trim();
      if (!trimmed) {
        i++;
        continue;
      }
      const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        const level = Math.min(hMatch[1].length, 6);
        out.push('<h' + level + '>' + parseInline(hMatch[2]) + '</h' + level + '>');
        i++;
        continue;
      }
      if (trimmed.startsWith('>')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(parseInline(lines[i].trim().slice(1).trim()));
          i++;
        }
        out.push('<blockquote>' + quoteLines.join('<br/>') + '</blockquote>');
        continue;
      }
      if (/^[-*]\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          const content = lines[i].trim().replace(/^[-*]\s+/, '');
          items.push('<li>' + parseInline(content) + '</li>');
          i++;
        }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const content = lines[i].trim().replace(/^\d+\.\s+/, '');
          items.push('<li>' + parseInline(content) + '</li>');
          i++;
        }
        out.push('<ol>' + items.join('') + '</ol>');
        continue;
      }
      const paraLines = [];
      while (i < lines.length && lines[i].trim() !== '') {
        const l = lines[i];
        if (/^#{1,6}\s+/.test(l) || l.startsWith('```') || l.trim().startsWith('>') || /^[-*]\s+/.test(l.trim()) || /^\d+\.\s+/.test(l.trim())) break;
        paraLines.push(parseInline(l));
        i++;
      }
      if (paraLines.length) {
        out.push('<p>' + paraLines.join('<br/>') + '</p>');
      }
    }
    if (inCodeBlock) {
      out.push('<pre><code>' + escape(codeBlockContent.join('\n')) + '</code></pre>');
    }
    return out.join('');
  }
});
