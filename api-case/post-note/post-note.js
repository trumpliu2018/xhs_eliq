const tooLongImage = [
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/5e92fb1a30559c583a93bf1558d7d91d50eff18d.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/86f50d192e6821b2695268bae172ca1366646e12.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/f292915797d7e64daef628e12ecd3c6fd98aef11.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/56728cb9c2277b7059c28dda225aae8e5b816bf2.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/dae561c266536462ebd22bef76ad20fb0055cadc.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/2e9c9e9979512030c1979376b5795a3299dbb6d4.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/188808b7204daa338cdf83766f2e2e62fc53f3af.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/254b58b8bec12b2cee3ba7db1a82a46b09e660df.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/5c0350f8e988c73db984cffbf8edbb176f3f0b7f.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/4d1d0d0290896ef42bd5a146430139b4dcad623f.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/fed3bd2db6461d81439d790cd4e5aae67bd3e9ce.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/16a745a03e2016c624e49a92fad477ac8f73d0ed.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/932588729251f9250c0a4837d9a5d1616e81608a.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/5d13c12e63299966296084e4473076202be7b90d.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/38048acf3efe1687b91d3115be7ca018f60268a5.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/5e1716df0cb98170c57c6e44bcebff7ef6c8afe2.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/9c1a1e4c23da7ef5d8a7142b363015ef86517ded.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/3d03a8dd1b328a2aa8f5be868704a44f9b868b93.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/82c3a1d86168e664ec29143502d4367e144ee192.png' },
  { url: 'https://picasso-static.xiaohongshu.com/fe-platform/d56c5611536791c9fae8d00f77a13598da91d120.png' },
];

const video_resources = {
  video_url: 'https://fe-video-qc.xhscdn.com/fe-platform/4b30caabcac0ad43c1db48415a355343156d8eeb.mp4',
  cover_url: 'https://picasso-static.xiaohongshu.com/fe-platform/5e92fb1a30559c583a93bf1558d7d91d50eff18d.png',
};

Page({
  data: {
    showTip: true,
    noteTitle: '🌳探秘神秘古老森林，聆听自然私语！',
    noteContent: '踏入这片古老森林，仿佛穿越到了远古时代。粗壮的树木遮天蔽日，阳光透过树叶的缝隙洒下，形成一道道金色的光柱。地上铺满了厚厚的落叶，踩上去发出清脆的声响。森林中弥漫着清新的松香气息，偶尔还能听到鸟儿的啼鸣声，充满了神秘与宁静。',
    mediaInfo: JSON.stringify({
      image_resources: tooLongImage.slice(0, 18),
    }),
    tags: "古老森林,森林探秘,自然宁静,神秘之境",
    miniappSessionInfo: JSON.stringify({
      customData: "用户自定义数据",
      userId: "12345"
    }),
    componentMounted: true,
    apiSuccess: false,
    apiFail: false,
    apiComplete: false,
    apiResultText: ""
  },

  resetApiData() {
    this.setData({
      apiSuccess: false,
      apiFail: false,
      apiComplete: false,
      apiResultText: ""
    });
  },

  updateApiData(type, res) {
    if (type === 'success') {
      this.setData({
        apiSuccess: true,
        apiResultText: JSON.stringify(res)
      });
    } else if (type === 'fail') {
      this.setData({
        apiFail: true,
        apiResultText: JSON.stringify(res)
      });
    } else if (type === 'complete') {
      this.setData({
        apiComplete: true
      });
    }
  },

  callPostNoteApi() {
    this.resetApiData();

    const params = {
      title: this.data.noteTitle,
      content: this.data.noteContent,
      mediaInfo: this.data.mediaInfo,
      tags: this.data.tags,
      miniappSessionInfo: this.data.miniappSessionInfo,
      componentMounted: this.data.componentMounted,
      success: (res) => {
        this.updateApiData('success', res);
      },
      fail: (res) => {
        this.updateApiData('fail', res);
      },
      complete: (res) => {
        this.updateApiData('complete', res);
      }
    };
    console.log("%c Line:96 🎂 params", "font-size:16px;color:#465975", params);
    xhs.postNote(params);
  },

  bindInputNoteTitle(e) {
    this.setData({
      noteTitle: e.detail.value,
    });
  },

  bindInputNoteContent(e) {
    this.setData({
      noteContent: e.detail.value,
    });
  },

  bindInputTags(e) {
    this.setData({
      tags: e.detail.value,
    });
  },

  bindInputMediaInfo(e) {
    this.setData({
      mediaInfo: e.detail.value,
    });
  },

  bindInputMiniappSessionInfo(e) {
    this.setData({
      miniappSessionInfo: e.detail.value,
    });
  },

  toggleComponentMounted() {
    this.setData({
      componentMounted: !this.data.componentMounted,
    });
  },

  // 修改媒体信息的快捷方法
  changeMediaInfoToImageResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0, 1),
      }),
    });
  },

  changeMediaInfoToSameImageResource() {
    const image = tooLongImage[0];
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: Array.from({ length: 18 }, () => image),
      })
    });
  },

  changeMediaInfoToDifferentImageResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0, 18),
      }),
    });
  },

  changeMediaInfoToVideoResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        video_resources: video_resources,
      }),
    });
  },

  changeMediaInfoTooLong() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0),
      }),
    });
  },
});