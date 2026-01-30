const api = require('../../util/api.js');
const auth = require('../../util/auth.js');

// MBTI 16种人格类型详细数据（备用）
const mbtiData = {
  INTJ: {
    name: '建筑师',
    tagline: '富有想象力和战略性的思想家',
    description: 'INTJ型人格富有创造力、独立性强，善于战略规划和系统性思考。他们追求知识和效率，在解决复杂问题时展现出卓越的分析能力。',
    image: '/pages/assets/mbti/INTJ.png',
    traits: [
      { icon: '🎯', title: '战略思维', desc: '善于制定长期规划和目标' },
      { icon: '💡', title: '创新思维', desc: '喜欢探索新观点和可能性' },
      { icon: '📚', title: '终身学习', desc: '对知识有强烈的渴望' },
      { icon: '🔍', title: '独立思考', desc: '重视逻辑和客观分析' }
    ],
    careers: ['战略顾问', '软件架构师', '科学家', '金融分析师', '管理咨询师', '系统工程师'],
    celebrities: [
      { name: '埃隆·马斯克', avatar: '/pages/assets/celeb/musk.png' },
      { name: '马克·扎克伯格', avatar: '/pages/assets/celeb/zuckerberg.png' }
    ]
  },
  INTP: {
    name: '逻辑学家',
    tagline: '具有创新精神的发明家',
    description: 'INTP型人格热爱理论和抽象概念，善于发现事物之间的逻辑联系。他们是天生的问题解决者，对知识有着永不满足的好奇心。',
    image: '/pages/assets/mbti/INTP.png',
    traits: [
      { icon: '🧩', title: '逻辑思维', desc: '擅长分析和推理' },
      { icon: '🔬', title: '好奇求知', desc: '对未知充满探索欲望' },
      { icon: '💭', title: '抽象思维', desc: '善于处理复杂的理论概念' },
      { icon: '🎨', title: '独创性', desc: '提出独特的解决方案' }
    ],
    careers: ['程序员', '数学家', '物理学家', '研究员', '哲学家', '游戏设计师'],
    celebrities: [
      { name: '阿尔伯特·爱因斯坦', avatar: '/pages/assets/celeb/einstein.png' },
      { name: '比尔·盖茨', avatar: '/pages/assets/celeb/gates.png' }
    ]
  },
  ENTJ: {
    name: '指挥官',
    tagline: '大胆、富有想象力且意志强大的领导者',
    description: 'ENTJ型人格是天生的领导者，他们果断、自信，善于组织和动员他人。在追求目标时表现出强大的决心和执行力。',
    image: '/pages/assets/mbti/ENTJ.png',
    traits: [
      { icon: '👑', title: '领导力', desc: '天生的组织者和决策者' },
      { icon: '🎯', title: '目标导向', desc: '专注于实现长期目标' },
      { icon: '💪', title: '坚定果断', desc: '能够快速做出决策' },
      { icon: '📈', title: '效率至上', desc: '追求最优解决方案' }
    ],
    careers: ['CEO', '企业家', '律师', '项目经理', '投资银行家', '军事指挥官'],
    celebrities: [
      { name: '史蒂夫·乔布斯', avatar: '/pages/assets/celeb/jobs.png' },
      { name: '玛格丽特·撒切尔', avatar: '/pages/assets/celeb/thatcher.png' }
    ]
  },
  ENTP: {
    name: '辩论家',
    tagline: '聪明好奇的思想家',
    description: 'ENTP型人格充满智慧和创造力，喜欢挑战传统观念。他们善于辩论，能够从多个角度看待问题，是天生的创新者。',
    image: '/pages/assets/mbti/ENTP.png',
    traits: [
      { icon: '💬', title: '善于辩论', desc: '喜欢探讨各种观点' },
      { icon: '🌟', title: '创新思维', desc: '不断寻找新的可能性' },
      { icon: '🎭', title: '适应力强', desc: '能快速应对变化' },
      { icon: '🧠', title: '智慧机敏', desc: '思维敏捷反应快' }
    ],
    careers: ['创业者', '营销策划', '发明家', '记者', '政治顾问', '产品经理'],
    celebrities: [
      { name: '托马斯·爱迪生', avatar: '/pages/assets/celeb/edison.png' },
      { name: '小罗伯特·唐尼', avatar: '/pages/assets/celeb/rdj.png' }
    ]
  },
  INFJ: {
    name: '提倡者',
    tagline: '安静而神秘的理想主义者',
    description: 'INFJ型人格温和而坚定，拥有强烈的同理心和洞察力。他们致力于帮助他人成长，追求深层次的意义和价值。',
    image: '/pages/assets/mbti/INFJ.png',
    traits: [
      { icon: '💖', title: '同理心', desc: '能深刻理解他人感受' },
      { icon: '🌈', title: '理想主义', desc: '追求有意义的人生' },
      { icon: '🔮', title: '洞察力', desc: '善于理解复杂的人和情境' },
      { icon: '🌸', title: '温和坚定', desc: '外表温和内心坚韧' }
    ],
    careers: ['心理咨询师', '作家', '教师', '社会工作者', 'NGO工作者', '人力资源'],
    celebrities: [
      { name: '尼尔森·曼德拉', avatar: '/pages/assets/celeb/mandela.png' },
      { name: '特蕾莎修女', avatar: '/pages/assets/celeb/teresa.png' }
    ]
  },
  INFP: {
    name: '调停者',
    tagline: '富有诗意和善良的利他主义者',
    description: 'INFP型人格温柔、理想化，内心世界丰富。他们追求真实和意义，在帮助他人实现潜能的过程中找到自己的价值。',
    image: '/pages/assets/mbti/INFP.png',
    traits: [
      { icon: '✨', title: '创造力', desc: '拥有丰富的想象力' },
      { icon: '💝', title: '同情心', desc: '关心他人的福祉' },
      { icon: '🎨', title: '艺术气质', desc: '追求美和意义' },
      { icon: '🌿', title: '真诚', desc: '忠于自己的价值观' }
    ],
    careers: ['作家', '艺术家', '心理咨询师', '翻译', '编辑', '音乐家'],
    celebrities: [
      { name: 'J.K.罗琳', avatar: '/pages/assets/celeb/rowling.png' },
      { name: '约翰尼·德普', avatar: '/pages/assets/celeb/depp.png' }
    ]
  },
  ENFJ: {
    name: '主人公',
    tagline: '富有魅力且鼓舞人心的领导者',
    description: 'ENFJ型人格热情、负责任，天生的导师和领导者。他们善于激励他人，在帮助团队达成目标时展现卓越的组织能力。',
    image: '/pages/assets/mbti/ENFJ.png',
    traits: [
      { icon: '🌟', title: '魅力四射', desc: '能够激励和影响他人' },
      { icon: '🤝', title: '善于沟通', desc: '出色的人际交往能力' },
      { icon: '💪', title: '责任感强', desc: '认真对待承诺' },
      { icon: '🎯', title: '组织能力', desc: '善于协调和规划' }
    ],
    careers: ['教师', '人力资源总监', '公关经理', '培训师', '政治家', '销售总监'],
    celebrities: [
      { name: '奥普拉·温弗瑞', avatar: '/pages/assets/celeb/oprah.png' },
      { name: '奥巴马', avatar: '/pages/assets/celeb/obama.png' }
    ]
  },
  ENFP: {
    name: '竞选者',
    tagline: '热情洋溢且富有创造力的自由灵魂',
    description: 'ENFP型人格充满激情和创意，对生活充满好奇。他们善于社交，能够在各种环境中建立深厚的人际关系。',
    image: '/pages/assets/mbti/ENFP.png',
    traits: [
      { icon: '🎉', title: '热情洋溢', desc: '对生活充满激情' },
      { icon: '💡', title: '创意无限', desc: '不断产生新想法' },
      { icon: '🌈', title: '乐观积极', desc: '看到生活中的可能性' },
      { icon: '🤗', title: '善于交际', desc: '容易与人建立联系' }
    ],
    careers: ['市场营销', '记者', '演员', '心理咨询师', '活动策划', 'UI/UX设计师'],
    celebrities: [
      { name: '罗宾·威廉姆斯', avatar: '/pages/assets/celeb/williams.png' },
      { name: '艾伦·德杰尼勒斯', avatar: '/pages/assets/celeb/ellen.png' }
    ]
  },
  ISTJ: {
    name: '物流师',
    tagline: '务实且注重事实的可靠个体',
    description: 'ISTJ型人格注重细节、有条理，是最可靠的人格类型之一。他们尊重传统和规则，在工作中表现出极高的责任心。',
    image: '/pages/assets/mbti/ISTJ.png',
    traits: [
      { icon: '📋', title: '有条不紊', desc: '做事井井有条' },
      { icon: '⚖️', title: '重视规则', desc: '遵守既定的制度' },
      { icon: '💼', title: '责任心强', desc: '认真完成每项任务' },
      { icon: '🔒', title: '值得信赖', desc: '言出必行' }
    ],
    careers: ['会计师', '审计师', '项目经理', '法官', '军官', '数据分析师'],
    celebrities: [
      { name: '乔治·华盛顿', avatar: '/pages/assets/celeb/washington.png' },
      { name: '安吉拉·默克尔', avatar: '/pages/assets/celeb/merkel.png' }
    ]
  },
  ISFJ: {
    name: '守卫者',
    tagline: '非常专注而温暖的守护者',
    description: 'ISFJ型人格温和、可靠，总是愿意帮助他人。他们注重细节，善于照顾他人的需求，是团队中不可或缺的支持者。',
    image: '/pages/assets/mbti/ISFJ.png',
    traits: [
      { icon: '🛡️', title: '保护欲强', desc: '关心和照顾他人' },
      { icon: '💖', title: '热心助人', desc: '乐于提供支持' },
      { icon: '📝', title: '注重细节', desc: '细致周到' },
      { icon: '🤲', title: '无私奉献', desc: '为他人付出' }
    ],
    careers: ['护士', '教师', '图书管理员', '行政助理', '社会工作者', '营养师'],
    celebrities: [
      { name: '特蕾莎修女', avatar: '/pages/assets/celeb/teresa.png' },
      { name: '凯特·米德尔顿', avatar: '/pages/assets/celeb/kate.png' }
    ]
  },
  ESTJ: {
    name: '总经理',
    tagline: '出色的管理者，无与伦比的管理才能',
    description: 'ESTJ型人格务实、果断，天生的组织者和管理者。他们重视秩序和效率，善于制定和执行计划。',
    image: '/pages/assets/mbti/ESTJ.png',
    traits: [
      { icon: '👔', title: '管理才能', desc: '擅长组织和领导' },
      { icon: '⚡', title: '高效执行', desc: '注重结果和效率' },
      { icon: '📊', title: '系统思维', desc: '善于建立体系' },
      { icon: '🎖️', title: '原则性强', desc: '坚持规则和标准' }
    ],
    careers: ['企业管理', '法官', '军官', '警察', '银行经理', '运营总监'],
    celebrities: [
      { name: '亨利·福特', avatar: '/pages/assets/celeb/ford.png' },
      { name: '玛莎·斯图尔特', avatar: '/pages/assets/celeb/stewart.png' }
    ]
  },
  ESFJ: {
    name: '执政官',
    tagline: '极有同情心、爱社交的奉献者',
    description: 'ESFJ型人格热情、负责，善于营造和谐的氛围。他们关心他人的感受，是团队中的凝聚力所在。',
    image: '/pages/assets/mbti/ESFJ.png',
    traits: [
      { icon: '🤝', title: '善于社交', desc: '喜欢与人互动' },
      { icon: '💝', title: '关心他人', desc: '注重他人的需求' },
      { icon: '🎭', title: '和谐导向', desc: '营造和谐氛围' },
      { icon: '👥', title: '团队精神', desc: '重视集体利益' }
    ],
    careers: ['护士', '教师', '活动策划', '人力资源', '客户服务经理', '公关专员'],
    celebrities: [
      { name: '泰勒·斯威夫特', avatar: '/pages/assets/celeb/swift.png' },
      { name: '詹妮弗·洛佩兹', avatar: '/pages/assets/celeb/lopez.png' }
    ]
  },
  ISTP: {
    name: '鉴赏家',
    tagline: '大胆而实际的实验家',
    description: 'ISTP型人格善于动手实践，喜欢探索事物的工作原理。他们冷静、理性，在解决技术问题时展现出色的能力。',
    image: '/pages/assets/mbti/ISTP.png',
    traits: [
      { icon: '🔧', title: '动手能力强', desc: '擅长技术和操作' },
      { icon: '🧊', title: '冷静理性', desc: '不受情绪影响' },
      { icon: '🎯', title: '问题解决', desc: '善于找到实用方案' },
      { icon: '🏃', title: '行动派', desc: '喜欢实践而非理论' }
    ],
    careers: ['机械工程师', '飞行员', '警察', '消防员', '外科医生', '运动员'],
    celebrities: [
      { name: '克林特·伊斯特伍德', avatar: '/pages/assets/celeb/eastwood.png' },
      { name: '迈克尔·乔丹', avatar: '/pages/assets/celeb/jordan.png' }
    ]
  },
  ISFP: {
    name: '探险家',
    tagline: '灵活而迷人的艺术家',
    description: 'ISFP型人格温和、敏感，拥有独特的审美眼光。他们活在当下，享受生活的每个瞬间，用自己的方式表达创意。',
    image: '/pages/assets/mbti/ISFP.png',
    traits: [
      { icon: '🎨', title: '艺术天赋', desc: '具有审美和创造力' },
      { icon: '🌸', title: '温和友善', desc: '平易近人' },
      { icon: '🎭', title: '活在当下', desc: '享受现在的时光' },
      { icon: '🦋', title: '追求自由', desc: '不喜欢被束缚' }
    ],
    careers: ['艺术家', '设计师', '摄影师', '音乐家', '造型师', '厨师'],
    celebrities: [
      { name: '迈克尔·杰克逊', avatar: '/pages/assets/celeb/mj.png' },
      { name: '奥黛丽·赫本', avatar: '/pages/assets/celeb/hepburn.png' }
    ]
  },
  ESTP: {
    name: '企业家',
    tagline: '精明、善于感知且充满活力的冒险家',
    description: 'ESTP型人格精力充沛、善于应变，喜欢生活在聚光灯下。他们勇于冒险，在压力下能够做出快速决策。',
    image: '/pages/assets/mbti/ESTP.png',
    traits: [
      { icon: '⚡', title: '行动力强', desc: '喜欢即时行动' },
      { icon: '🎲', title: '敢于冒险', desc: '不畏惧挑战' },
      { icon: '🎯', title: '适应力强', desc: '能快速应对变化' },
      { icon: '🌟', title: '魅力十足', desc: '善于社交和说服' }
    ],
    careers: ['企业家', '销售', '警察', '消防员', '演员', '运动员'],
    celebrities: [
      { name: '唐纳德·特朗普', avatar: '/pages/assets/celeb/trump.png' },
      { name: '布鲁斯·威利斯', avatar: '/pages/assets/celeb/willis.png' }
    ]
  },
  ESFP: {
    name: '表演者',
    tagline: '自发的、充满活力和热情的表演者',
    description: 'ESFP型人格热情洋溢、外向开朗，是天生的表演者。他们热爱生活，善于为他人带来欢乐和正能量。',
    image: '/pages/assets/mbti/ESFP.png',
    traits: [
      { icon: '🎭', title: '表演天赋', desc: '喜欢成为焦点' },
      { icon: '🎉', title: '乐观开朗', desc: '充满正能量' },
      { icon: '🌈', title: '享受当下', desc: '活在此刻' },
      { icon: '💃', title: '活力四射', desc: '精力充沛' }
    ],
    careers: ['演员', '主持人', '活动策划', '旅游顾问', '销售', '时尚设计师'],
    celebrities: [
      { name: '玛丽莲·梦露', avatar: '/pages/assets/celeb/monroe.png' },
      { name: '威尔·史密斯', avatar: '/pages/assets/celeb/smith.png' }
    ]
  }
};

Page({
  data: {
    result: null,
    dimensions: [],
    contacts: [
      {
        type: 'wechat',
        name: '微信咨询',
        value: 'MBTI_Consultant',
        icon: '/pages/assets/icon-wechat.png'
      },
      {
        type: 'xiaohongshu',
        name: '小红书',
        value: '@MBTI心理测评',
        icon: '/pages/assets/icon-xhs.png'
      },
      {
        type: 'douyin',
        name: '抖音',
        value: '@MBTI性格解析',
        icon: '/pages/assets/icon-douyin.png'
      },
      {
        type: 'phone',
        name: '电话咨询',
        value: '400-123-4567',
        icon: '/pages/assets/icon-phone.png'
      },
      {
        type: 'email',
        name: '邮箱',
        value: 'contact@mbti.com',
        icon: '/pages/assets/icon-email.png'
      }
    ]
  },

  onLoad() {
    // 优先从用户资料中获取MBTI类型
    let mbtiType = null;
    let testResult = null;
    
    // 1. 首先检查用户是否有mbti_type
    if (auth.isLoggedIn()) {
      const userInfo = auth.getCurrentUser();
      if (userInfo && userInfo.mbti_type) {
        mbtiType = userInfo.mbti_type;
      }
    }
    
    // 2. 如果用户没有mbti_type，从测评结果获取
    if (!mbtiType) {
      testResult = xhs.getStorageSync('mbti_result');
      if (testResult && testResult.type) {
        mbtiType = testResult.type;
      }
    }
    
    // 3. 如果都没有，提示用户
    if (!mbtiType) {
      xhs.showModal({
        title: '提示',
        content: '还没有MBTI类型信息，请先完成测评或更新资料',
        showCancel: false,
        success: () => {
          xhs.redirectTo({
            url: '/pages/mbti/mbti'
          });
        }
      });
      return;
    }

    xhs.showLoading({
      title: '加载中...'
    });

    // 从API获取MBTI信息
    api.getMBTIInfo(mbtiType)
      .then((mbtiInfo) => {
        xhs.hideLoading();
        
        // 将markdown格式转换为HTML
        const descriptionHtml = this.markdownToHtml(mbtiInfo.description || '');
        
        // 设置结果数据
        this.setData({
          result: {
            type: mbtiInfo.type,
            name: mbtiInfo.name,
            brief: mbtiInfo.brief,
            description: mbtiInfo.description,
            descriptionHtml: descriptionHtml,
            image: `/pages/assets/avatar/${mbtiInfo.type.toLowerCase()}.png`
          }
        });
      })
      .catch((err) => {
        console.error('获取MBTI信息失败:', err);
        xhs.hideLoading();
        
        // 使用本地备用数据
        const mbtiInfo = mbtiData[mbtiType];
        if (mbtiInfo) {
          const descriptionHtml = this.markdownToHtml(mbtiInfo.description || '');
          
          this.setData({
            result: {
              type: mbtiType,
              name: mbtiInfo.name,
              brief: mbtiInfo.tagline,
              description: mbtiInfo.description,
              descriptionHtml: descriptionHtml,
              image: `/pages/assets/avatar/${mbtiType.toLowerCase()}.png`
            }
          });
        } else {
          xhs.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      });
  },

  // 将简单的markdown格式转换为HTML
  markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // 按双换行符分割段落
    const paragraphs = html.split(/\n\n+/);
    const processedParagraphs = [];
    
    paragraphs.forEach(para => {
      para = para.trim();
      if (!para) return;
      
      // 检查是否是列表项（以 - 或 • 开头）
      if (para.match(/^[-•]\s+/m)) {
        // 处理列表
        const items = para.split(/\n/).filter(line => line.trim());
        const listItems = items.map(item => {
          const content = item.replace(/^[-•]\s+/, '').trim();
          return `<li>${content}</li>`;
        }).join('');
        processedParagraphs.push(`<ul>${listItems}</ul>`);
      } else {
        // 普通段落，处理单个换行符为<br/>
        const content = para.replace(/\n/g, '<br/>');
        processedParagraphs.push(`<p>${content}</p>`);
      }
    });
    
    return processedParagraphs.join('');
  },

  // 从API返回的result对象计算维度得分
  calculateDimensionsFromResult(result) {
    if (!result) return [];

    const dimensions = [];

    // E-I 维度
    const scoreEI = result.score_ei || 0;
    dimensions.push({
      left: '外向 E',
      right: '内向 I',
      leftScore: scoreEI > 0 ? scoreEI : 0,
      rightScore: scoreEI < 0 ? Math.abs(scoreEI) : 0,
      leftPercent: scoreEI > 0 ? 100 : 0,
      rightPercent: scoreEI < 0 ? 100 : 0
    });

    // S-N 维度
    const scoreSN = result.score_sn || 0;
    dimensions.push({
      left: '感觉 S',
      right: '直觉 N',
      leftScore: scoreSN > 0 ? scoreSN : 0,
      rightScore: scoreSN < 0 ? Math.abs(scoreSN) : 0,
      leftPercent: scoreSN > 0 ? 100 : 0,
      rightPercent: scoreSN < 0 ? 100 : 0
    });

    // T-F 维度
    const scoreTF = result.score_tf || 0;
    dimensions.push({
      left: '思考 T',
      right: '情感 F',
      leftScore: scoreTF > 0 ? scoreTF : 0,
      rightScore: scoreTF < 0 ? Math.abs(scoreTF) : 0,
      leftPercent: scoreTF > 0 ? 100 : 0,
      rightPercent: scoreTF < 0 ? 100 : 0
    });

    // J-P 维度
    const scoreJP = result.score_jp || 0;
    dimensions.push({
      left: '判断 J',
      right: '知觉 P',
      leftScore: scoreJP > 0 ? scoreJP : 0,
      rightScore: scoreJP < 0 ? Math.abs(scoreJP) : 0,
      leftPercent: scoreJP > 0 ? 100 : 0,
      rightPercent: scoreJP < 0 ? 100 : 0
    });

    return dimensions;
  },

  // 计算维度得分（旧版本，兼容本地数据）
  calculateDimensions(scores) {
    return [
      {
        left: '外向 E',
        right: '内向 I',
        leftScore: scores.E,
        rightScore: scores.I,
        leftPercent: (scores.E / (scores.E + scores.I)) * 100,
        rightPercent: (scores.I / (scores.E + scores.I)) * 100
      },
      {
        left: '感觉 S',
        right: '直觉 N',
        leftScore: scores.S,
        rightScore: scores.N,
        leftPercent: (scores.S / (scores.S + scores.N)) * 100,
        rightPercent: (scores.N / (scores.S + scores.N)) * 100
      },
      {
        left: '思考 T',
        right: '情感 F',
        leftScore: scores.T,
        rightScore: scores.F,
        leftPercent: (scores.T / (scores.T + scores.F)) * 100,
        rightPercent: (scores.F / (scores.T + scores.F)) * 100
      },
      {
        left: '判断 J',
        right: '感知 P',
        leftScore: scores.J,
        rightScore: scores.P,
        leftPercent: (scores.J / (scores.J + scores.P)) * 100,
        rightPercent: (scores.P / (scores.J + scores.P)) * 100
      }
    ];
  },



  // 处理联系方式点击
  handleContact(e) {
    const { type, value } = e.currentTarget.dataset;
    
    switch(type) {
      case 'wechat':
      case 'xiaohongshu':
      case 'douyin':
      case 'email':
        xhs.setClipboardData({
          data: value,
          success: () => {
            xhs.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            });
          }
        });
        break;
      case 'phone':
        xhs.makePhoneCall({
          phoneNumber: value
        });
        break;
    }
  },

  // 分享结果
  shareResult() {
    // 小红书小程序的分享功能
    xhs.showShareMenu({
      withShareTicket: true
    });
  },

  // 重新测评
  retakeTest() {
    xhs.showModal({
      title: '确认重新测评？',
      content: '当前测评结果将被覆盖',
      success: (res) => {
        if (res.confirm) {
          xhs.removeStorageSync('mbti_result');
          xhs.removeStorageSync('mbti_test_progress');
          xhs.redirectTo({
            url: '/pages/test/test'
          });
        }
      }
    });
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: `我是${this.data.result.type} - ${this.data.result.name}`,
      path: '/pages/mbti/mbti',
      imageUrl: this.data.result.image
    };
  }
});
