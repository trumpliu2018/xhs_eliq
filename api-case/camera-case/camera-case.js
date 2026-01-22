// 配置数组定义
const DEVICE_POSITION_OPTIONS = [
  { name: '后置摄像头', value: 'back' },
  { name: '前置摄像头', value: 'front' }
];

const FLASH_OPTIONS = [
  { name: '自动', value: 'auto' },
  { name: '开启', value: 'on' },
  { name: '关闭', value: 'off' },
  { name: '常亮', value: 'torch' }
];

const QUALITY_OPTIONS = [
  { name: '高质量', value: 'high' },
  { name: '普通', value: 'normal' },
  { name: '低质量', value: 'low' },
  { name: '原始', value: 'original' }
];

const RESOLUTION_OPTIONS = [
  { name: '低分辨率', value: 'low' },
  { name: '中分辨率', value: 'medium' },
  { name: '高分辨率', value: 'high' }
];

const MODE_OPTIONS = [
  { name: '普通模式', value: 'normal' },
  { name: '扫码模式', value: 'scanCode' }
];

Page({
  data: {
    imageSrc: '', // 拍摄的图片路径

    zoom: 1,
    maxZoom: 1, // 相机最大缩放倍数

    // 拍照模式
    mode:   '',
    modeName: '',

    // 摄像头位置设置
    devicePosition: DEVICE_POSITION_OPTIONS[0].value,
    devicePositionName: DEVICE_POSITION_OPTIONS[0].name,
    
    // 闪光灯设置
    flash: FLASH_OPTIONS[0].value,
    flashName: FLASH_OPTIONS[0].name,
    
    // 拍照质量设置
    quality: QUALITY_OPTIONS[0].value,
    qualityName: QUALITY_OPTIONS[0].name,
    
    // 分辨率设置 只在初始化时有效，不能动态变更
    resolution: '',
    resolutionName: '',
    
    selfieMirror: false, // 是否开启自拍镜像

    scanResult: null, // 扫码结果

    showPage: false // 控制页面显示
  },
  
  // 防抖定时器
  zoomTimer: null,
  
  onReady() {
    this.setData({
      // 模式设置 只在初始化时有效，不能动态变更
      mode: wx.getStorageSync('mode') || MODE_OPTIONS[0].value,
      modeName: wx.getStorageSync('modeName') || MODE_OPTIONS[0].name,
      // 分辨率设置 只在初始化时有效，不能动态变更
      resolution: wx.getStorageSync('resolution') || RESOLUTION_OPTIONS[0].value,
      resolutionName: wx.getStorageSync('resolutionName') || RESOLUTION_OPTIONS[0].name,
    }, () => {
      console.log('页面准备就绪，当前模式:', this.data.mode, '分辨率:', this.data.resolution);
      this.setData({
        showPage: true // 页面准备就绪后显示
      });
    });
  },
  
  takePhoto() {
    console.log('takePhoto 开始执行, ctx:', this.ctx);
    
    if (!this.ctx) {
      wx.showToast({
        title: '相机未初始化，请稍后重试',
        icon: 'none'
      });
      return;
    }
    
    this.ctx.takePhoto({
      quality: this.data.quality, // 使用用户选择的质量
      selfieMirror: this.data.selfieMirror, // 使用用户设置的镜像选项
      success: (res) => {
        console.log("%c Line:21 takePhoto 🌮 takePhoto res", "color:#3f7cff", res);
        this.setData({
          imageSrc: res.tempImagePath
        });
        
        // 保存到相册
        this.saveToAlbum(res.tempImagePath);
        
        wx.showToast({
          title: '拍照成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('拍照失败:', err);
        wx.showToast({
          title: '拍照失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        });
      }
    });
  },
  changeFlash() {
    const itemList = FLASH_OPTIONS.map(item => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedItem = FLASH_OPTIONS[res.tapIndex];
        this.setData({
          flash: selectedItem.value,
          flashName: selectedItem.name
        });
        wx.showToast({
          title: `已设置为${selectedItem.name}`,
          icon: 'success'
        });
      }
    });
  },
  changeQuality() {
    const itemList = QUALITY_OPTIONS.map(item => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedItem = QUALITY_OPTIONS[res.tapIndex];
        this.setData({
          quality: selectedItem.value,
          qualityName: selectedItem.name
        });
        wx.showToast({
          title: `已设置为${selectedItem.name}`,
          icon: 'success'
        });
      }
    });
  },
  changeResolution() {
    const itemList = RESOLUTION_OPTIONS.map(item => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedItem = RESOLUTION_OPTIONS[res.tapIndex];
        this.setData({
          resolution: selectedItem.value,
          resolutionName: selectedItem.name
        });
        wx.setStorageSync('resolution', selectedItem.value);
        wx.setStorageSync('resolutionName', selectedItem.name);
        wx.showToast({
          title: `请重新进入页面以应用${selectedItem.name}`,
          icon: 'success'
        });
      }
    });
  },
  changeMode() {
    const itemList = MODE_OPTIONS.map(item => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedItem = MODE_OPTIONS[res.tapIndex];
        this.setData({
          mode: selectedItem.value,
          modeName: selectedItem.name
        });
        wx.setStorageSync('mode', selectedItem.value);
        wx.setStorageSync('modeName', selectedItem.name);
        wx.showToast({
          title: `请重新进入页面以应用${selectedItem.name}`,
          icon: 'success'
        });
      }
    });
  },
  changeSelfieMirror() {
    wx.showActionSheet({
      itemList: ['开启', '关闭'],
      success: (res) => {
        const newValue = res.tapIndex === 0;
        this.setData({
          selfieMirror: newValue
        });
        wx.showToast({
          title: `已${newValue ? '开启' : '关闭'}镜像`,
          icon: 'success'
        });
      }
    });
  },
  changeDevicePosition() {
    const itemList = DEVICE_POSITION_OPTIONS.map(item => item.name);
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selectedItem = DEVICE_POSITION_OPTIONS[res.tapIndex];
        this.setData({
          devicePosition: selectedItem.value,
          devicePositionName: selectedItem.name
        });
        
        // 显示摄像头切换提示
        wx.showToast({
          title: `已切换到${selectedItem.name}`,
          icon: 'success'
        });
      }
    });
  },
  // 处理滑块变化 - 带防抖功能
  onZoomChange(e) {
    const zoomValue = parseFloat(e.detail.value);
    
    // 立即更新显示值，提供即时反馈
    this.setData({
      zoom: zoomValue
    });
    
    // 清除之前的定时器
    if (this.zoomTimer) {
      clearTimeout(this.zoomTimer);
      this.zoomTimer = null;
    }
    
    // 设置新的防抖定时器，60ms 后执行缩放操作
    this.zoomTimer = setTimeout(() => {
      if (this.ctx) {
        this.ctx.setZoom({
          zoom: zoomValue,
          success: (res) => {
            console.log('滑块缩放设置成功:', res.zoom);
            // 确保显示的值与实际设置的值一致
            this.setData({
              zoom: res.zoom
            });
          },
          fail: (error) => {
            console.log('滑块缩放设置失败:', error);
          }
        });
      }
    }, 60);
  },
  error(e) {
    wx.showToast({
      title: 'binderror',
      content: JSON.stringify(e)
    });
    console.log('相机组件触发了 binderror', e.detail);
  },
  stop(e) {
    wx.showToast({
      title: 'bindstop',
      content: JSON.stringify(e)
    });
    console.log('相机组件触发了 bindstop', e.detail);
  },

  initdone(e) {
    console.log('相机组件触发了 bindinitdone', e.detail);

    // 修复拼写错误：datail -> detail
    const maxZoom = e.detail.maxZoom || 1;
    console.log('获取到相机最大缩放倍数:', maxZoom);
    
    // 保存最大缩放倍数到 data 中
    this.setData({
      maxZoom: maxZoom
    });
    
    // 相机初始化完成后创建上下文
    if (!this.ctx) {
      this.ctx = wx.createCameraContext();
      console.log('在 initdone 中创建相机上下文:', this.ctx);
      
      wx.showToast({
        title: '相机初始化完成',
        icon: 'success'
      });
    }
  },
  scancode(e) {
    console.log('相机组件触发了 bindscancode', e.detail);
    
    // 保存扫码结果
    this.setData({
      scanResult: e.detail
    });
    
    // 显示扫码成功提示
    wx.showToast({
      title: '扫码成功',
      icon: 'success'
    });
  },
  
  // 清除扫码结果
  clearScanResult() {
    this.setData({
      scanResult: null
    });
  },
  
  // 清除拍摄的照片
  clearPhoto() {
    this.setData({
      imageSrc: ''
    });
    
    wx.showToast({
      title: '照片已清除',
      icon: 'success'
    });
  },
  
  // 保存图片到相册
  saveToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        console.log('保存到相册成功');
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存到相册失败:', err);
        
        // 如果是权限问题，引导用户开启权限
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '权限提示',
            content: '需要您授权保存图片到相册，请在设置中开启相册权限',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '保存失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
        }
      }
    });
  }
});
