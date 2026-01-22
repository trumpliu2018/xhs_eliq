Page({
  data: {
    // 文件操作相关
    testFilePath: '',
    fileContent: '',
    encoding: 'utf8',
    encodingList: ['utf8', 'binary'], // 小红书仅支持 utf8 和 binary 编码
    
    // 文件信息
    fileInfo: null,
    savedFiles: [],
    
    // 操作状态
    isLoading: false
  },

  onLoad() {
    // 初始化文件管理器
    this.fs = xhs.getFileSystemManager();
    
    // 设置默认测试文件路径
    this.setData({
      testFilePath: `${xhs.env.USER_DATA_PATH}/test.txt`
    });
    
    this.addLog('文件系统管理器初始化完成');
  },

  // 自实现 ArrayBuffer 转 Base64 (替代平台有问题的 API)
  arrayBufferToBase64(buffer) {
    try {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (err) {
      this.addLog(`❌ ArrayBuffer 转 Base64 失败: ${err.message}`);
      return null;
    }
  },

  // 自实现 Base64 转 ArrayBuffer (替代平台有问题的 API)
  base64ToArrayBuffer(base64) {
    try {
      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return buffer;
    } catch (err) {
      this.addLog(`❌ Base64 转 ArrayBuffer 失败: ${err.message}`);
      return null;
    }
  },

  // 验证文件内容是否符合预期
  verifyFileContent(filePath, expectedContent, encoding = 'utf8') {
    return new Promise((resolve) => {
      this.fs.readFile({
        filePath: filePath,
        encoding: encoding, // 小红书仅支持 utf8 和 binary 编码
        success: (res) => {
          let actualContent;
          let isMatch = false;
          
          if (encoding === 'binary' && res.data instanceof ArrayBuffer && expectedContent instanceof ArrayBuffer) {
            // 二进制数据比较
            const actualBytes = new Uint8Array(res.data);
            const expectedBytes = new Uint8Array(expectedContent);
            
            if (actualBytes.length === expectedBytes.length) {
              isMatch = actualBytes.every((byte, index) => byte === expectedBytes[index]);
            }
            actualContent = `ArrayBuffer(${actualBytes.length} bytes)`;
          } else {
            // 文本数据比较
            actualContent = res.data.toString();
            isMatch = actualContent === expectedContent.toString();
          }
          
          if (isMatch) {
            this.addLog(`✅ 文件内容验证通过: ${filePath}`);
          } else {
            this.addLog(`❌ 文件内容验证失败: ${filePath}`);
            this.addLog(`   期望: ${expectedContent.toString().substring(0, 50)}...`);
            this.addLog(`   实际: ${actualContent.substring(0, 50)}...`);
          }
          
          resolve({ isMatch, actualContent, expectedContent });
        },
        fail: (err) => {
          this.addLog(`❌ 文件内容验证失败，无法读取文件: ${err.errMsg}`);
          resolve({ isMatch: false, error: err.errMsg });
        }
      });
    });
  },

  // 验证文件是否存在
  verifyFileExists(filePath, shouldExist = true) {
    return new Promise((resolve) => {
      this.fs.access({
        path: filePath,
        success: () => {
          if (shouldExist) {
            this.addLog(`✅ 文件存在验证通过: ${filePath}`);
            resolve({ exists: true, isMatch: true });
          } else {
            this.addLog(`❌ 文件存在验证失败: 文件应该不存在但实际存在 ${filePath}`);
            resolve({ exists: true, isMatch: false });
          }
        },
        fail: () => {
          if (!shouldExist) {
            this.addLog(`✅ 文件不存在验证通过: ${filePath}`);
            resolve({ exists: false, isMatch: true });
          } else {
            this.addLog(`❌ 文件不存在验证失败: 文件应该存在但实际不存在 ${filePath}`);
            resolve({ exists: false, isMatch: false });
          }
        }
      });
    });
  },

  // 验证文件信息
  verifyFileInfo(filePath, expectedSize = null, expectedDigest = null) {
    return new Promise((resolve) => {
      // 优先使用 getFileInfo，如果不可用则使用 stat
      if (typeof this.fs.getFileInfo === 'function') {
        this.fs.getFileInfo({
          filePath: filePath,
          digestAlgorithm: 'md5',
          success: (res) => {
            let sizeMatch = true;
            let digestMatch = true;
            
            if (expectedSize !== null) {
              sizeMatch = res.size === expectedSize;
              if (sizeMatch) {
                this.addLog(`✅ 文件大小验证通过: ${res.size} 字节`);
              } else {
                this.addLog(`❌ 文件大小验证失败: 期望 ${expectedSize} 字节，实际 ${res.size} 字节`);
              }
            }
            
            if (expectedDigest !== null) {
              digestMatch = res.digest === expectedDigest;
              if (digestMatch) {
                this.addLog(`✅ 文件摘要验证通过: ${res.digest}`);
              } else {
                this.addLog(`❌ 文件摘要验证失败: 期望 ${expectedDigest}，实际 ${res.digest}`);
              }
            }
            
            resolve({ 
              isMatch: sizeMatch && digestMatch, 
              size: res.size, 
              digest: res.digest,
              sizeMatch,
              digestMatch
            });
          },
          fail: (err) => {
            this.addLog(`❌ 文件信息验证失败: ${err.errMsg}`);
            resolve({ isMatch: false, error: err.errMsg });
          }
        });
      } else if (typeof this.fs.stat === 'function') {
        // 使用 stat 作为备选方案
        this.fs.stat({
          path: filePath,
          success: (res) => {
            let sizeMatch = true;
            
            if (expectedSize !== null) {
              sizeMatch = res.stats.size === expectedSize;
              if (sizeMatch) {
                this.addLog(`✅ 文件大小验证通过: ${res.stats.size} 字节`);
              } else {
                this.addLog(`❌ 文件大小验证失败: 期望 ${expectedSize} 字节，实际 ${res.stats.size} 字节`);
              }
            }
            
            if (expectedDigest !== null) {
              this.addLog(`⚠️ 无法验证文件摘要: stat API 不支持摘要计算`);
            }
            
            resolve({ 
              isMatch: sizeMatch, // 只验证大小
              size: res.stats.size, 
              digest: 'N/A',
              sizeMatch,
              digestMatch: expectedDigest === null // 如果不需要验证摘要则认为匹配
            });
          },
          fail: (err) => {
            this.addLog(`❌ 文件状态验证失败: ${err.errMsg}`);
            resolve({ isMatch: false, error: err.errMsg });
          }
        });
      } else {
        this.addLog(`❌ 无可用的文件信息API进行验证`);
        resolve({ isMatch: false, error: 'No available file info API' });
      }
    });
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

  onFileContentInput(e) {
    this.setData({
      fileContent: e.detail.value
    });
  },

  onEncodingChange(e) {
    this.setData({
      encoding: this.data.encodingList[e.detail.value]
    });
  },

  // 检查文件是否存在
  accessFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.access({
      path: testFilePath,
      success: (res) => {
        this.addLog(`✅ 文件存在: ${testFilePath}`);
        this.addLog('access success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 文件不存在: ${testFilePath}`);
        this.addLog('access fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步检查文件
  accessFileSync() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    try {
      this.fs.accessSync(testFilePath);
      this.addLog(`✅ 同步检查: 文件存在 ${testFilePath}`);
    } catch (err) {
      this.addLog(`❌ 同步检查: 文件不存在 ${testFilePath}`);
      this.addLog('accessSync error:', err);
    }
  },

  // 写入文件
  writeFile() {
    const { testFilePath, fileContent, encoding } = this.data;
    if (!testFilePath || !fileContent) {
      this.addLog('请输入文件路径和内容');
      return;
    }

    // 根据编码类型处理数据
    const processedData = this.prepareFileData(fileContent, encoding);

    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: testFilePath,
      data: processedData,
      encoding: encoding, // 小红书仅支持 utf8 和 binary 编码
      success: async (res) => {
        this.addLog(`✅ 文件写入成功: ${testFilePath}`);
        this.addLog('writeFile success:', res);
        
        // 自动验证写入的内容
        this.addLog('🔍 开始验证写入内容...');
        const verification = await this.verifyFileContent(testFilePath, fileContent, encoding);
        
        if (verification.isMatch) {
          this.addLog('✅ 写入内容验证完成，数据一致');
        } else {
          this.addLog('❌ 写入内容验证失败，数据不一致');
        }
      },
      fail: (err) => {
        this.addLog(`❌ 文件写入失败: ${err.errMsg}`);
        this.addLog('writeFile fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步写入文件
  writeFileSync() {
    const { testFilePath, fileContent, encoding } = this.data;
    if (!testFilePath || !fileContent) {
      this.addLog('请输入文件路径和内容');
      return;
    }

    // 检查 writeFileSync API 是否可用
    if (typeof this.fs.writeFileSync !== 'function') {
      this.addLog('❌ 当前平台不支持 writeFileSync API');
      this.addLog('💡 建议：使用异步 writeFile 方法代替');
      return;
    }

    try {
      // 根据编码类型处理数据
      const processedData = this.prepareFileData(fileContent, encoding || 'utf8');
      
      // 使用标准参数格式：writeFileSync(filePath, data, encoding)
      this.fs.writeFileSync(testFilePath, processedData, encoding || 'utf8');
      this.addLog(`✅ 同步写入成功: ${testFilePath}`);
      
      // 自动验证写入的内容
      this.addLog('🔍 开始验证同步写入内容...');
      this.verifyFileContent(testFilePath, fileContent, encoding).then(verification => {
        if (verification.isMatch) {
          this.addLog('✅ 同步写入内容验证完成，数据一致');
        } else {
          this.addLog('❌ 同步写入内容验证失败，数据不一致');
        }
      });
    } catch (err) {
      this.addLog(`❌ 同步写入失败: ${err.message}`);
      this.addLog('writeFileSync error:', err);
    }
  },

  // 读取文件
  readFile() {
    const { testFilePath, encoding } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.readFile({
      filePath: testFilePath,
      encoding: encoding,
      success: (res) => {
        this.addLog(`✅ 文件读取成功: ${testFilePath}`);
        
        // 根据编码类型处理读取的数据
        let displayContent;
        if (encoding === 'binary' && res.data instanceof ArrayBuffer) {
          displayContent = this.arrayBufferToString(res.data);
          this.addLog(`🔄 ArrayBuffer 转换为字符串显示，字节长度: ${res.data.byteLength}`);
        } else {
          displayContent = res.data.toString();
        }
        
        this.setData({ fileContent: displayContent });
        this.addLog('readFile success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 文件读取失败: ${err.errMsg}`);
        this.addLog('readFile fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步读取文件
  readFileSync() {
    const { testFilePath, encoding } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    // 检查 readFileSync API 是否可用
    if (typeof this.fs.readFileSync !== 'function') {
      this.addLog('❌ 当前平台不支持 readFileSync API');
      this.addLog('💡 建议：使用异步 readFile 方法代替');
      return;
    }

    try {
      // 使用标准参数格式：readFileSync(filePath, encoding)
      const data = this.fs.readFileSync(testFilePath, encoding || 'utf8');
      this.addLog(`✅ 同步读取成功: ${testFilePath}`);
      
      // 根据编码类型处理读取的数据
      let displayContent;
      if (encoding === 'binary' && data instanceof ArrayBuffer) {
        displayContent = this.arrayBufferToString(data);
        this.addLog(`🔄 ArrayBuffer 转换为字符串显示，字节长度: ${data.byteLength}`);
      } else {
        displayContent = data.toString();
      }
      
      this.setData({ fileContent: displayContent });
    } catch (err) {
      this.addLog(`❌ 同步读取失败: ${err.message}`);
      this.addLog('💡 提示：可能需要先写入文件或检查文件路径是否正确');
      this.addLog('readFileSync error:', err);
    }
  },

  // 追加文件内容
  appendFile() {
    const { testFilePath, fileContent, encoding } = this.data;
    if (!testFilePath || !fileContent) {
      this.addLog('请输入文件路径和内容');
      return;
    }

    // 处理要追加的数据
    const appendText = '\n' + fileContent;
    const appendData = this.prepareFileData(appendText, encoding);
    let originalContent = '';

    // 先读取原文件内容用于验证
    this.fs.readFile({
      filePath: testFilePath,
      encoding: encoding, // 小红书仅支持 utf8 和 binary 编码
      success: (readRes) => {
        originalContent = readRes.data.toString();
        
        this.setData({ isLoading: true });
        this.fs.appendFile({
          filePath: testFilePath,
          data: appendData,
          encoding: encoding, // 小红书仅支持 utf8 和 binary 编码
          success: async (res) => {
            this.addLog(`✅ 文件追加成功: ${testFilePath}`);
            this.addLog('appendFile success:', res);
            
            // 自动验证追加后的内容
            this.addLog('🔍 开始验证追加内容...');
            const expectedContent = originalContent + appendData;
            const verification = await this.verifyFileContent(testFilePath, expectedContent, encoding);
            
            if (verification.isMatch) {
              this.addLog('✅ 追加内容验证完成，数据一致');
            } else {
              this.addLog('❌ 追加内容验证失败，数据不一致');
            }
          },
          fail: (err) => {
            this.addLog(`❌ 文件追加失败: ${err.errMsg}`);
            this.addLog('appendFile fail:', err);
          },
          complete: () => {
            this.setData({ isLoading: false });
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ 无法读取原文件用于验证: ${err.errMsg}`);
        // 即使无法验证也要尝试追加
        this.setData({ isLoading: true });
        this.fs.appendFile({
          filePath: testFilePath,
          data: appendData,
          encoding: encoding, // 小红书仅支持 utf8 和 binary 编码
          success: (res) => {
            this.addLog(`✅ 文件追加成功: ${testFilePath}`);
            this.addLog('⚠️ 无法验证追加内容（原文件不存在或无法读取）');
          },
          fail: (err) => {
            this.addLog(`❌ 文件追加失败: ${err.errMsg}`);
          },
          complete: () => {
            this.setData({ isLoading: false });
          }
        });
      }
    });
  },

  // 同步追加文件
  appendFileSync() {
    const { testFilePath, fileContent, encoding } = this.data;
    if (!testFilePath || !fileContent) {
      this.addLog('请输入文件路径和内容');
      return;
    }

    // 检查 appendFileSync API 是否可用
    if (typeof this.fs.appendFileSync !== 'function') {
      this.addLog('❌ 当前平台不支持 appendFileSync API');
      this.addLog('💡 建议：使用异步 appendFile 方法代替');
      return;
    }

    try {
      // 处理要追加的数据
      const appendText = '\n' + fileContent;
      const appendData = this.prepareFileData(appendText, encoding || 'utf8');
      
      // 使用标准参数格式：appendFileSync(filePath, data, encoding)
      this.fs.appendFileSync(testFilePath, appendData, encoding || 'utf8');
      this.addLog(`✅ 同步追加成功: ${testFilePath}`);
    } catch (err) {
      this.addLog(`❌ 同步追加失败: ${err.message}`);
      this.addLog('appendFileSync error:', err);
    }
  },

  // 复制文件
  copyFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入源文件路径');
      return;
    }

    const destPath = testFilePath.replace(/(\.[^.]+)$/, '_copy$1');
    
    this.setData({ isLoading: true });
    this.fs.copyFile({
      srcPath: testFilePath,
      destPath: destPath,
      success: async (res) => {
        this.addLog(`✅ 文件复制成功: ${destPath}`);
        this.addLog('copyFile success:', res);
        
        // 自动验证复制结果
        this.addLog('🔍 开始验证复制文件...');
        
        // 验证目标文件是否存在
        const existsCheck = await this.verifyFileExists(destPath, true);
        
        if (existsCheck.isMatch) {
          // 验证复制后的文件信息是否与源文件一致
          await Promise.all([
            this.verifyFileInfo(testFilePath).then(srcInfo => {
              this.verifyFileInfo(destPath, srcInfo.size, srcInfo.digest).then(destInfo => {
                if (destInfo.isMatch) {
                  this.addLog('✅ 复制文件验证完成，源文件和目标文件一致');
                } else {
                  this.addLog('❌ 复制文件验证失败，源文件和目标文件不一致');
                }
              });
            })
          ]);
        }
      },
      fail: (err) => {
        this.addLog(`❌ 文件复制失败: ${err.errMsg}`);
        this.addLog('copyFile fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步复制文件
  copyFileSync() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入源文件路径');
      return;
    }

    const destPath = testFilePath.replace(/(\.[^.]+)$/, '_sync_copy$1');
    
    try {
      this.fs.copyFileSync(testFilePath, destPath);
      this.addLog(`✅ 同步复制成功: ${destPath}`);
    } catch (err) {
      this.addLog(`❌ 同步复制失败: ${err.message}`);
      this.addLog('copyFileSync error:', err);
    }
  },

  // 删除文件
  unlinkFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.unlink({
      filePath: testFilePath,
      success: async (res) => {
        this.addLog(`✅ 文件删除成功: ${testFilePath}`);
        this.addLog('unlink success:', res);
        
        // 自动验证删除结果
        this.addLog('🔍 开始验证文件删除...');
        const verification = await this.verifyFileExists(testFilePath, false);
        
        if (verification.isMatch) {
          this.addLog('✅ 文件删除验证完成，文件已不存在');
        } else {
          this.addLog('❌ 文件删除验证失败，文件仍然存在');
        }
      },
      fail: (err) => {
        this.addLog(`❌ 文件删除失败: ${err.errMsg}`);
        this.addLog('unlink fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步删除文件
  unlinkFileSync() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    try {
      this.fs.unlinkSync(testFilePath);
      this.addLog(`✅ 同步删除成功: ${testFilePath}`);
    } catch (err) {
      this.addLog(`❌ 同步删除失败: ${err.message}`);
      this.addLog('unlinkSync error:', err);
    }
  },

  // 重命名文件
  renameFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    const newPath = testFilePath.replace(/(\.[^.]+)$/, '_renamed$1');
    
    this.setData({ isLoading: true });
    this.fs.rename({
      oldPath: testFilePath,
      newPath: newPath,
      success: (res) => {
        this.addLog(`✅ 文件重命名成功: ${newPath}`);
        this.setData({ testFilePath: newPath });
        this.addLog('rename success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 文件重命名失败: ${err.errMsg}`);
        this.addLog('rename fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步重命名文件
  renameFileSync() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    const newPath = testFilePath.replace(/(\.[^.]+)$/, '_sync_renamed$1');
    
    try {
      this.fs.renameSync(testFilePath, newPath);
      this.addLog(`✅ 同步重命名成功: ${newPath}`);
      this.setData({ testFilePath: newPath });
    } catch (err) {
      this.addLog(`❌ 同步重命名失败: ${err.message}`);
      this.addLog('renameSync error:', err);
    }
  },

  // 获取文件信息
  getFileInfo() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    // 检查getFileInfo API是否可用
    if (typeof this.fs.getFileInfo !== 'function') {
      this.addLog('❌ 当前平台不支持 getFileInfo API');
      this.addLog('💡 建议：使用 stat API 获取基本文件信息（无摘要值）');
      this.getFileInfoFallback();
      return;
    }

    this.setData({ isLoading: true });
    this.fs.getFileInfo({
      filePath: testFilePath,
      digestAlgorithm: 'md5',
      success: (res) => {
        this.addLog(`✅ 获取文件信息成功`);
        this.addLog(`   文件大小: ${res.size} 字节`);
        this.addLog(`   MD5摘要: ${res.digest}`);
        this.setData({ fileInfo: res });
        this.addLog('getFileInfo success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 获取文件信息失败: ${err.errMsg}`);
        this.addLog('getFileInfo fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // getFileInfo 的备选方案：使用 stat API
  getFileInfoFallback() {
    const { testFilePath } = this.data;
    
    if (typeof this.fs.stat !== 'function') {
      this.addLog('❌ stat API 也不可用，无法获取文件信息');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.stat({
      path: testFilePath,
      success: (res) => {
        const fileInfo = {
          size: res.stats.size,
          digest: 'N/A (stat API 不支持摘要计算)',
          lastAccessedTime: res.stats.lastAccessedTime,
          lastModifiedTime: res.stats.lastModifiedTime
        };
        
        this.addLog(`✅ 使用 stat API 获取文件信息成功`);
        this.addLog(`   文件大小: ${fileInfo.size} 字节`);
        this.addLog(`   修改时间: ${fileInfo.lastModifiedTime}`);
        this.addLog(`   注意: 无法计算文件摘要值`);
        
        this.setData({ fileInfo });
        this.addLog('stat fallback success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 使用 stat API 获取文件信息失败: ${err.errMsg}`);
        this.addLog('stat fallback fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 保存临时文件
  saveFile() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入临时文件路径');
      return;
    }

    const savedPath = `${xhs.env.USER_DATA_PATH}/saved_${Date.now()}.txt`;
    
    this.setData({ isLoading: true });
    this.fs.saveFile({
      tempFilePath: testFilePath,
      filePath: savedPath,
      success: (res) => {
        this.addLog(`✅ 文件保存成功: ${res.savedFilePath}`);
        this.addLog('saveFile success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 文件保存失败: ${err.errMsg}`);
        this.addLog('saveFile fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 获取已保存文件列表
  getSavedFileList() {
    this.setData({ isLoading: true });
    this.fs.getSavedFileList({
      success: (res) => {
        this.addLog(`✅ 获取保存文件列表成功，共 ${res.fileList.length} 个文件`);
        this.setData({ savedFiles: res.fileList });
        this.addLog('getSavedFileList success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 获取保存文件列表失败: ${err.errMsg}`);
        this.addLog('getSavedFileList fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 删除保存的文件
  removeSavedFile(e) {
    const filePath = e.currentTarget.dataset.path;
    
    this.fs.removeSavedFile({
      filePath: filePath,
      success: (res) => {
        this.addLog(`✅ 删除保存文件成功: ${filePath}`);
        this.getSavedFileList(); // 刷新列表
        this.addLog('removeSavedFile success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 删除保存文件失败: ${err.errMsg}`);
        this.addLog('removeSavedFile fail:', err);
      }
    });
  },

  // 测试二进制文件写入和读取
  testBinaryFileOperations() {
    const { testFilePath } = this.data;
    if (!testFilePath) {
      this.addLog('请输入文件路径');
      return;
    }

    this.addLog('🚀 开始测试二进制文件操作...');

    // 创建测试的二进制数据 (ArrayBuffer)
    const testData = new ArrayBuffer(16);
    const view = new Uint8Array(testData);
    for (let i = 0; i < 16; i++) {
      view[i] = i * 16; // 填充测试数据
    }

    // 1. 写入二进制文件
    const binaryFilePath = testFilePath.replace(/(\.[^.]+)$/, '_binary$1');
    
    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: binaryFilePath,
      data: testData,
      encoding: 'binary', // 小红书仅支持 utf8 和 binary 编码
      success: (res) => {
        this.addLog(`✅ 二进制文件写入成功: ${binaryFilePath}`);
        
        // 2. 读取二进制文件
        this.fs.readFile({
          filePath: binaryFilePath,
          encoding: 'binary', // 小红书仅支持 utf8 和 binary 编码
          success: (readRes) => {
            this.addLog(`✅ 二进制文件读取成功`);
            
            // 3. 演示自实现的 ArrayBuffer 转 Base64
            if (readRes.data instanceof ArrayBuffer) {
              const base64Result = this.arrayBufferToBase64(readRes.data);
              if (base64Result) {
                this.addLog(`✅ ArrayBuffer 转 Base64 成功: ${base64Result.substring(0, 20)}...`);
                
                // 4. 演示自实现的 Base64 转 ArrayBuffer
                const bufferResult = this.base64ToArrayBuffer(base64Result);
                if (bufferResult) {
                  this.addLog(`✅ Base64 转 ArrayBuffer 成功，长度: ${bufferResult.byteLength} 字节`);
                  this.addLog('✅ 二进制文件操作测试完成');
                }
              }
            } else {
              this.addLog('⚠️ 读取的数据不是 ArrayBuffer 格式');
            }
          },
          fail: (err) => {
            this.addLog(`❌ 二进制文件读取失败: ${err.errMsg}`);
          },
          complete: () => {
            this.setData({ isLoading: false });
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ 二进制文件写入失败: ${err.errMsg}`);
        this.setData({ isLoading: false });
      }
    });
  },

  // 测试 Base64 编码的文本文件
  testBase64TextFile() {
    const { testFilePath, fileContent } = this.data;
    if (!testFilePath || !fileContent) {
      this.addLog('请输入文件路径和内容');
      return;
    }

    this.addLog('🚀 开始测试 Base64 文本文件操作...');

    // 1. 将文本内容转换为 ArrayBuffer
    const encoder = new TextEncoder();
    const textBuffer = encoder.encode(fileContent);

    // 2. 使用自实现函数转换为 Base64
    const base64Content = this.arrayBufferToBase64(textBuffer.buffer);
    if (!base64Content) return;

    this.addLog(`✅ 文本转 Base64: ${base64Content.substring(0, 30)}...`);

    // 3. 将 Base64 字符串作为文本文件保存
    const base64FilePath = testFilePath.replace(/(\.[^.]+)$/, '_base64$1');
    
    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: base64FilePath,
      data: base64Content,
      encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
      success: (res) => {
        this.addLog(`✅ Base64 文件写入成功: ${base64FilePath}`);
        
        // 4. 读取 Base64 文件并转换回原文本
        this.fs.readFile({
          filePath: base64FilePath,
          encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
          success: (readRes) => {
            const readBase64 = readRes.data.toString();
            
            // 5. 使用自实现函数转换回 ArrayBuffer
            const restoredBuffer = this.base64ToArrayBuffer(readBase64);
            if (restoredBuffer) {
              // 6. 转换回文本
              const decoder = new TextDecoder();
              const restoredText = decoder.decode(restoredBuffer);
              
              this.addLog(`✅ Base64 转回文本: ${restoredText.substring(0, 30)}...`);
              this.addLog(`✅ 内容匹配: ${restoredText === fileContent ? '是' : '否'}`);
              this.addLog('✅ Base64 文本文件操作测试完成');
            }
          },
          fail: (err) => {
            this.addLog(`❌ Base64 文件读取失败: ${err.errMsg}`);
          },
          complete: () => {
            this.setData({ isLoading: false });
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ Base64 文件写入失败: ${err.errMsg}`);
        this.setData({ isLoading: false });
      }
    });
  }
});
