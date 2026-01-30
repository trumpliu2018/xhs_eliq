Component({
  data: {
    showModal: false,
    modalTitle: '',
    qrcodeUrl: '',
    email: 'engagementboy@163.com'
  },

  methods: {
    // 显示二维码
    showQRCode(e) {
      const { title, qrcode } = e.currentTarget.dataset;
      this.setData({
        showModal: true,
        modalTitle: title,
        qrcodeUrl: qrcode
      });
    },

    // 隐藏弹窗
    hideModal() {
      this.setData({
        showModal: false
      });
    },

    // 阻止冒泡
    preventClose() {
      // 空函数，用于阻止点击弹窗内容时关闭
    },

    // 复制邮箱
    copyEmail() {
      xhs.setClipboardData({
        data: this.data.email,
        success: () => {
          xhs.showToast({
            title: '邮箱已复制',
            icon: 'success'
          });
        }
      });
    }
  }
});
