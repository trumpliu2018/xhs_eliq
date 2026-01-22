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
    noteTitle: '🌳探秘神秘古老森林，聆听自然私语！',
    noteContent: '踏入这片古老森林，仿佛穿越到了远古时代。粗壮的树木遮天蔽日，阳光透过树叶的缝隙洒下，形成一道道金色的光柱。地上铺满了厚厚的落叶，踩上去发出清脆的声响。森林中弥漫着清新的松香气息，偶尔还能听到鸟儿的啼鸣声，充满了神秘与宁静。',
    mediaInfo: JSON.stringify({
      image_resources: tooLongImage.slice(0, 18),
    }),
    tags: "古老森林,森林探秘,自然宁静,神秘之境",
    showFloatingButton: true,
    // 用户选择媒体相关字段
    userSelectedMedia: [], // 用户选择的媒体文件
    userSelectedMediaType: '', // 选择的媒体类型：'image' 或 'video'
    userMediaInfo: JSON.stringify({}), // 用户选择媒体的mediaInfo格式，初始化为空对象
  },
  onLoad() {
    setTimeout(() => { this.removeSkeleton?.(); }, 1000);
  },
  bindFocus(e) {
    this.setData({
      showFloatingButton: false,
    });
  },
  bindBlur(e) {
    this.setData({
      showFloatingButton: true,
    });
  },
  bindError(e) {
    xhs.showModal({
      title: '发生错误',
      content: e.detail.errMsg,
    });
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
  // 改成 1 张图片
  changeMediaInfoToImageResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0, 1),
      }),
    });
  },
  // 改成 18 张相同的图片
  changeMediaInfoToSameImageResource() {
    const image = tooLongImage[0];
    this.setData({
      mediaInfo: JSON.stringify({
        // 重复 18 次
        image_resources: Array.from({ length: 18 }, () => image),
      })
    });
  },
  // 改成 18 张不同的图片
  changeMediaInfoToDifferentImageResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0, 18),
      }),
    });
  },
  // 改成视频
  changeMediaInfoToVideoResource() {
    this.setData({
      mediaInfo: JSON.stringify({
        video_resources: video_resources,
      }),
    });
  },
  // 改成 19 张图片
  changeMediaInfoTooLong() {
    this.setData({
      mediaInfo: JSON.stringify({
        image_resources: tooLongImage.slice(0),
      }),
    });
  },

  // ========== 用户选择本地媒体相关方法 ==========

  // 用户选择本地媒体文件
  chooseUserMedia() {
    const that = this;
    xhs.chooseMedia({
      count: 18, // 最多选择18个文件
      mediaType: ['image', 'video'], // 支持图片和视频
      sourceType: ['album', 'camera'], // 支持相册和拍摄
      maxDuration: 60, // 视频最长60秒
      camera: 'back', // 默认后置摄像头
      success(res) {
        console.log('用户选择媒体成功:', res);
        const tempFiles = res.tempFiles;

        if (tempFiles && tempFiles.length > 0) {
          // 检查是否混合选择了图片和视频
          const imageFiles = tempFiles.filter(file => file.fileType === 'image');
          const videoFiles = tempFiles.filter(file => file.fileType === 'video');

          if (imageFiles.length > 0 && videoFiles.length > 0) {
            xhs.showModal({
              title: '提示',
              content: '不能同时选择图片和视频，请重新选择',
              showCancel: false
            });
            return;
          }

          // 检查视频数量
          if (videoFiles.length > 1) {
            xhs.showModal({
              title: '提示',
              content: '只能选择1个视频文件',
              showCancel: false
            });
            return;
          }

          // 检查图片数量
          if (imageFiles.length > 18) {
            xhs.showModal({
              title: '提示',
              content: '最多只能选择18张图片',
              showCancel: false
            });
            return;
          }

          that.setData({
            userSelectedMedia: tempFiles,
            userSelectedMediaType: tempFiles[0].fileType
          });

          // 转换为mediaInfo格式
          that.convertUserMediaToInfo();
        }
      },
      fail(err) {
        console.error('用户选择媒体失败:', err);
        xhs.showModal({
          title: '选择失败',
          content: err.errMsg || '选择媒体文件失败',
          showCancel: false
        });
      }
    });
  },

  // 将用户选择的媒体转换为mediaInfo格式
  convertUserMediaToInfo() {
    const { userSelectedMedia, userSelectedMediaType } = this.data;

    if (!userSelectedMedia || userSelectedMedia.length === 0) {
      return;
    }

    let mediaInfo = {};

    if (userSelectedMediaType === 'image') {
      // 转换图片资源
      mediaInfo.image_resources = userSelectedMedia.map(file => ({
        url: file.tempFilePath,
        width: file.width || 0,
        height: file.height || 0,
        size: file.size || 0
      }));
    } else if (userSelectedMediaType === 'video') {
      // 转换视频资源
      const videoFile = userSelectedMedia[0];
      mediaInfo.video_resources = {
        video_url: videoFile.tempFilePath,
        cover_url: videoFile.thumbTempFilePath || '', // 视频封面
        duration: videoFile.duration || 0,
        width: videoFile.width || 0,
        height: videoFile.height || 0,
        size: videoFile.size || 0
      };
    }

    console.log("%c Line:226 🍖 mediaInfo", "font-size:16px;color:#465975", mediaInfo);

    this.setData({
      userMediaInfo: JSON.stringify(mediaInfo)
    });

    // 调试信息：打印转换后的媒体信息
    console.log('用户选择媒体转换完成:', {
      mediaType: userSelectedMediaType,
      fileCount: userSelectedMedia.length,
      mediaInfo: mediaInfo,
      mediaInfoString: JSON.stringify(mediaInfo)
    });

    // 额外验证：确保数据正确设置
    console.log('验证userMediaInfo设置:', this.data.userMediaInfo);
  },

  // 清空用户选择的媒体
  clearUserMedia() {
    this.setData({
      userSelectedMedia: [],
      userSelectedMediaType: '',
      userMediaInfo: JSON.stringify({}) // 重置为空对象而不是空字符串
    });
  },
});
