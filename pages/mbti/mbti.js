Page({
  data: {
    selectedType: '',
    personalityTypes: [
      { code: 'INTJ', name: '建筑师' },
      { code: 'INTP', name: '逻辑学家' },
      { code: 'ENTJ', name: '指挥官' },
      { code: 'ENTP', name: '辩论家' },
      { code: 'INFJ', name: '提倡者' },
      { code: 'INFP', name: '调停者' },
      { code: 'ENFJ', name: '主人公' },
      { code: 'ENFP', name: '竞选者' },
      { code: 'ISTJ', name: '物流师' },
      { code: 'ISFJ', name: '守卫者' },
      { code: 'ESTJ', name: '总经理' },
      { code: 'ESFJ', name: '执政官' },
      { code: 'ISTP', name: '鉴赏家' },
      { code: 'ISFP', name: '探险家' },
      { code: 'ESTP', name: '企业家' },
      { code: 'ESFP', name: '表演者' }
    ],
    reviews: [
      {
        avatar: '/pages/assets/avatar1.png',
        username: '小红',
        mbti: 'INFP',
        content: '测评结果非常准确！帮助我更好地理解了自己的性格特点，推荐给大家！'
      },
      {
        avatar: '/pages/assets/avatar2.png',
        username: '阿明',
        mbti: 'ENTJ',
        content: '专业的性格分析，对我的职业规划很有帮助，值得一试！'
      },
      {
        avatar: '/pages/assets/avatar3.png',
        username: '晓雯',
        mbti: 'ISFJ',
        content: '界面设计很美观，测评过程体验流畅，结果分析也很详细。'
      }
    ]
  },

  onLoad() {
    // 检查是否已经完成过测评
    const mbtiResult = xhs.getStorageSync('mbti_result');
    if (mbtiResult) {
      this.setData({
        selectedType: mbtiResult.type
      });
    }
  },

  onShow() {
    // 每次显示页面时检查测评结果
    const mbtiResult = xhs.getStorageSync('mbti_result');
    if (mbtiResult) {
      this.setData({
        selectedType: mbtiResult.type
      });
    }
  },

  // 点击人格类型卡片
  onPersonalityTap(e) {
    const code = e.currentTarget.dataset.code;
    this.setData({
      selectedType: code
    });
    
    // 可以跳转到该类型的详情页
    xhs.showToast({
      title: `选择了${code}类型`,
      icon: 'none'
    });
  },

  // 开始测评
  startTest() {
    xhs.navigateTo({
      url: '/pages/test/test'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: 'MBTI性格测评 - 探索你的性格密码',
      path: '/pages/mbti/mbti',
      imageUrl: '/pages/assets/share-mbti.png'
    };
  }
});
