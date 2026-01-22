Page({
  data: {
    // 文件操作相关
    testFilePath: '',
    zipFilePath: '',
    targetPath: '',
    truncateLength: 1024,
    
    // 操作状态
    isLoading: false
  },

  onLoad() {
    // 初始化文件管理器
    this.fs = xhs.getFileSystemManager();
    
    // 设置默认路径
    this.setData({
      testFilePath: `${xhs.env.USER_DATA_PATH}/test_file.txt`,
      zipFilePath: `${xhs.env.USER_DATA_PATH}/test.zip`,
      targetPath: `${xhs.env.USER_DATA_PATH}/unzip_dir`
    });
    
    this.addLog('文件系统管理器初始化完成');
  },

  // 验证文件大小（兼容性方法）
  verifyFileSizeAfterTruncate(filePath, expectedSize) {
    // 优先使用 getFileInfo
    if (typeof this.fs.getFileInfo === 'function') {
      this.fs.getFileInfo({
        filePath: filePath,
        success: (fileRes) => {
          if (fileRes.size === expectedSize) {
            this.addLog(`✅ 文件截断验证通过: 文件大小为 ${fileRes.size} 字节`);
          } else {
            this.addLog(`❌ 文件截断验证失败: 期望 ${expectedSize} 字节，实际 ${fileRes.size} 字节`);
          }
        },
        fail: (err) => {
          this.addLog(`❌ 无法验证文件截断结果: ${err.errMsg}`);
        }
      });
    } else if (typeof this.fs.stat === 'function') {
      // 使用 stat 作为备选方案
      this.fs.stat({
        path: filePath,
        success: (statRes) => {
          if (statRes.stats.size === expectedSize) {
            this.addLog(`✅ 文件截断验证通过: 文件大小为 ${statRes.stats.size} 字节`);
          } else {
            this.addLog(`❌ 文件截断验证失败: 期望 ${expectedSize} 字节，实际 ${statRes.stats.size} 字节`);
          }
        },
        fail: (err) => {
          this.addLog(`❌ 无法验证文件截断结果: ${err.errMsg}`);
        }
      });
    } else {
      this.addLog(`❌ 无可用的文件信息API验证截断结果`);
    }
  },

  // 添加日志（输出到控制台）
  addLog(message) {
    console.log(message);
  },

  // 字符串转 ArrayBuffer（手动实现，不使用任何编码API）
  stringToArrayBuffer(str) {
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
      // 直接使用字符的字符码作为字节值
      view[i] = str.charCodeAt(i) & 0xFF; // 确保在0-255范围内
    }
    return buffer;
  },

  // ArrayBuffer 转字符串（手动实现）
  arrayBufferToString(buffer) {
    const view = new Uint8Array(buffer);
    let str = '';
    for (let i = 0; i < view.length; i++) {
      str += String.fromCharCode(view[i]);
    }
    return str;
  },

  // 根据编码类型处理数据
  prepareFileData(content, encoding) {
    if (encoding === 'binary') {
      this.addLog(`🔄 将字符串转换为 ArrayBuffer (binary 编码)`);
      const buffer = this.stringToArrayBuffer(content);
      this.addLog(`✅ 转换完成，字节长度: ${buffer.byteLength}`);
      return buffer;
    } else {
      // utf8 编码直接返回字符串
      return content;
    }
  },



  // 输入处理
  onFilePathInput(e) {
    this.setData({
      testFilePath: e.detail.value
    });
  },

  onZipPathInput(e) {
    this.setData({
      zipFilePath: e.detail.value
    });
  },

  onTargetPathInput(e) {
    this.setData({
      targetPath: e.detail.value
    });
  },

  onTruncateLengthInput(e) {
    this.setData({
      truncateLength: parseInt(e.detail.value) || 0
    });
  },

  // 截断文件
  truncateFile() {
    const { testFilePath, truncateLength } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.truncate({
      filePath: testFilePath,
      length: truncateLength,
      success: (res) => {
        this.addLog(`✅ 文件截断成功: ${testFilePath}, 长度: ${truncateLength}`);
        console.log('truncate success:', res);
        
        // 自动验证截断结果
        this.addLog('🔍 开始验证文件截断...');
        this.verifyFileSizeAfterTruncate(testFilePath, truncateLength);
      },
      fail: (err) => {
        this.addLog(`❌ 文件截断失败: ${err.errMsg}`);
        console.log('truncate fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步截断文件
  truncateFileSync() {
    const { testFilePath, truncateLength } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    try {
      this.fs.truncateSync({
        filePath: testFilePath,
        length: truncateLength
      });
      this.addLog(`✅ 同步截断文件成功: ${testFilePath}, 长度: ${truncateLength}`);
    } catch (err) {
      this.addLog(`❌ 同步截断文件失败: ${err.message}`);
      console.log('truncateSync error:', err);
    }
  },

  // 解压文件
  unzipFile() {
    const { zipFilePath, targetPath } = this.data;
    if (!zipFilePath || !targetPath) {
      this.addLog('请输入压缩文件路径和目标路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.unzip({
      zipFilePath: zipFilePath,
      targetPath: targetPath,
      success: (res) => {
        this.addLog(`✅ 文件解压成功: ${zipFilePath} -> ${targetPath}`);
        console.log('unzip success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 文件解压失败: ${err.errMsg}`);
        console.log('unzip fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 创建测试文件 (大文件用于测试截断)
  createLargeTestFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    // 创建一个较大的测试文件内容
    let content = '这是一个用于测试截断功能的大文件。\n';
    for (let i = 0; i < 100; i++) {
      content += `第 ${i + 1} 行: ${new Date().toISOString()} - 测试数据内容测试数据内容测试数据内容\n`;
    }

    const processedData = this.prepareFileData(content, 'utf8');

    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: testFilePath,
      data: processedData,
      encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
      success: (res) => {
        this.addLog(`✅ 大测试文件创建成功: ${testFilePath}, 大小: ${content.length} 字节`);
        console.log('createLargeTestFile success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 大测试文件创建失败: ${err.errMsg}`);
        console.log('createLargeTestFile fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 创建测试压缩文件 (模拟压缩包)
  createTestZip() {
    const { zipFilePath } = this.data;
    if (!zipFilePath) {
      this.addLog('请输入压缩文件路径');
      return;
    }

    // 注意：这里只是创建一个普通文件来模拟压缩包
    // 实际的小程序环境中，压缩文件通常来自网络下载或其他来源
    // 小红书仅支持 utf8 和 binary 编码
    const zipContent = 'PK\x03\x04这不是真正的ZIP文件，只是用于测试解压API的模拟文件';
    const processedData = this.prepareFileData(zipContent, 'binary');

    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: zipFilePath,
      data: processedData,
      encoding: 'binary', // 小红书仅支持 utf8 和 binary 编码
      success: (res) => {
        this.addLog(`✅ 测试压缩文件创建成功: ${zipFilePath}`);
        this.addLog('⚠️ 注意：这不是真正的ZIP文件，只是模拟文件');
        console.log('createTestZip success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 测试压缩文件创建失败: ${err.errMsg}`);
        console.log('createTestZip fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 读取文件前部分内容
  readFileHead() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.readFile({
      filePath: testFilePath,
      encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
      position: 0,
      length: 200, // 只读取前200字节
      success: (res) => {
        this.addLog(`✅ 读取文件头部成功 (前200字节)`);
        
        // 根据编码类型处理读取的数据
        let displayContent;
        if (res.data instanceof ArrayBuffer) {
          displayContent = this.arrayBufferToString(res.data);
        } else {
          displayContent = res.data.toString();
        }
        
        this.addLog(`内容: ${displayContent.substring(0, 100)}...`);
        console.log('readFileHead success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 读取文件头部失败: ${err.errMsg}`);
        console.log('readFileHead fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步读取文件指定位置内容
  readFileRangeSync() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    try {
      const data = this.fs.readFileSync(testFilePath, 'utf8', 100, 200); // 从位置100开始读取200字节，小红书仅支持 utf8 和 binary 编码
      this.addLog(`✅ 同步读取文件范围成功 (位置100-300)`);
      
      // 根据编码类型处理读取的数据
      let displayContent;
      if (data instanceof ArrayBuffer) {
        displayContent = this.arrayBufferToString(data);
      } else {
        displayContent = data.toString();
      }
      
      this.addLog(`内容: ${displayContent.substring(0, 50)}...`);
    } catch (err) {
      this.addLog(`❌ 同步读取文件范围失败: ${err.message}`);
      console.log('readFileRangeSync error:', err);
    }
  },

  // 获取文件详细信息
  getDetailedFileInfo() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });

    // 先检查文件是否存在
    this.fs.access({
      path: testFilePath,
      success: () => {
        // 文件存在，获取详细信息
        Promise.all([
          // 获取文件基本信息
          new Promise((resolve, reject) => {
            if (typeof this.fs.getFileInfo === 'function') {
              this.fs.getFileInfo({
                filePath: testFilePath,
                digestAlgorithm: 'md5',
                success: resolve,
                fail: reject
              });
            } else if (typeof this.fs.stat === 'function') {
              this.fs.stat({
                path: testFilePath,
                success: (res) => resolve({ 
                  size: res.stats.size, 
                  digest: 'N/A (使用stat API)' 
                }),
                fail: reject
              });
            } else {
              reject({ errMsg: '无可用的文件信息API' });
            }
          }),
          // 获取文件状态
          new Promise((resolve, reject) => {
            this.fs.stat({
              path: testFilePath,
              success: resolve,
              fail: reject
            });
          })
        ]).then(([fileInfo, statInfo]) => {
          this.addLog(`✅ 文件详细信息获取成功:`);
          this.addLog(`   大小: ${fileInfo.size} 字节`);
          this.addLog(`   MD5: ${fileInfo.digest}`);
          this.addLog(`   类型: ${statInfo.stats.isFile() ? '文件' : '目录'}`);
          this.addLog(`   修改时间: ${statInfo.stats.lastModifiedTime}`);
          console.log('详细文件信息:', { fileInfo, statInfo });
        }).catch((err) => {
          this.addLog(`❌ 获取文件详细信息失败: ${err.errMsg || err.message}`);
        }).finally(() => {
          this.setData({ isLoading: false });
        });
      },
      fail: (err) => {
        this.addLog(`❌ 文件不存在: ${testFilePath}`);
        this.setData({ isLoading: false });
      }
    });
  },

  // 测试所有文件操作
  runAllTests() {
    this.addLog('🚀 开始执行完整文件操作测试流程...');
    
    const runSequence = async () => {
      try {
        // 1. 创建大测试文件
        await new Promise((resolve) => {
          this.createLargeTestFile();
          setTimeout(resolve, 1000);
        });

        // 2. 获取文件详细信息
        await new Promise((resolve) => {
          setTimeout(() => {
            this.getDetailedFileInfo();
            resolve();
          }, 1500);
        });

        // 3. 读取文件头部
        await new Promise((resolve) => {
          setTimeout(() => {
            this.readFileHead();
            resolve();
          }, 2000);
        });

        // 4. 截断文件
        await new Promise((resolve) => {
          setTimeout(() => {
            this.truncateFile();
            resolve();
          }, 2500);
        });

        // 5. 再次获取文件信息验证截断
        await new Promise((resolve) => {
          setTimeout(() => {
            this.getDetailedFileInfo();
            resolve();
          }, 3000);
        });

        this.addLog('✅ 完整测试流程执行完毕');
      } catch (err) {
        this.addLog(`❌ 测试流程执行失败: ${err.message}`);
      }
    };

    runSequence();
  }
});
