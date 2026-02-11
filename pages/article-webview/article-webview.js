Page({
  data: {
    url: ''
  },

  onLoad(options) {
    const id = options && options.id;
    if (!id) {
      xhs.showToast({
        title: '文章参数错误',
        icon: 'none'
      });
      return;
    }

    const url = `https://mbti.nengwing.com/articles/${id}`;
    this.setData({ url });
  }
});

