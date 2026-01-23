Page({
  data: {
    cases: [
      { name: '腾讯', desc: '员工心理测评服务', logo: '/pages/assets/logo-tencent.png' },
      { name: '阿里巴巴', desc: '团队建设咨询', logo: '/pages/assets/logo-alibaba.png' },
      { name: '字节跳动', desc: 'HR招聘测评', logo: '/pages/assets/logo-bytedance.png' }
    ]
  },
  contactUs() {
    xhs.navigateTo({ url: '/pages/contact/contact' });
  }
});
