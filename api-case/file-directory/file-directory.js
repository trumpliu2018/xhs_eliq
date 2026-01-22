Page({
  data: {
    // 目录操作相关
    testDirPath: '',
    dirContents: [],
    
    // 操作状态
    isLoading: false,
    
    // 文件/目录信息
    statsInfo: null
  },

  onLoad() {
    // 初始化文件管理器
    this.fs = xhs.getFileSystemManager();
    
    // 检查支持的API
    this.checkSupportedAPIs();
    
    // 设置默认测试目录路径
    this.setData({
      testDirPath: `${xhs.env.USER_DATA_PATH}/test_dir`
    });
    
    this.addLog('文件系统管理器初始化完成');
  },

  // 检查支持的文件系统API
  checkSupportedAPIs() {
    const supportedAPIs = [];
    const unsupportedAPIs = [];
    
    const apiList = [
      'access', 'accessSync',
      'writeFile', 'writeFileSync', 
      'readFile', 'readFileSync',
      'appendFile', 'appendFileSync',
      'copyFile', 'copyFileSync',
      'unlink', 'unlinkSync',
      'rename', 'renameSync',
      'mkdir', 'mkdirSync',
      'rmdir', 'rmdirSync',
      'readdir', 'readdirSync',
      'stat', 'statSync',
      'getFileInfo',
      'saveFile', 'saveFileSync',
      'getSavedFileList',
      'removeSavedFile',
      'truncate', 'truncateSync',
      'unzip'
    ];
    
    apiList.forEach(api => {
      if (typeof this.fs[api] === 'function') {
        supportedAPIs.push(api);
      } else {
        unsupportedAPIs.push(api);
      }
    });
    
    this.addLog(`✅ 支持的API (${supportedAPIs.length}): ${supportedAPIs.join(', ')}`);
    if (unsupportedAPIs.length > 0) {
      this.addLog(`❌ 不支持的API (${unsupportedAPIs.length}): ${unsupportedAPIs.join(', ')}`);
    }
    
    console.log('FileSystemManager支持的API:', supportedAPIs);
    console.log('FileSystemManager不支持的API:', unsupportedAPIs);
  },

  // 验证目录是否存在
  verifyDirectoryExists(dirPath, shouldExist = true) {
    return new Promise((resolve) => {
      this.fs.stat({
        path: dirPath,
        success: (res) => {
          const isDirectory = res.stats.isDirectory();
          if (shouldExist && isDirectory) {
            this.addLog(`✅ 目录存在验证通过: ${dirPath}`);
            resolve({ exists: true, isDirectory: true, isMatch: true });
          } else if (shouldExist && !isDirectory) {
            this.addLog(`❌ 目录验证失败: ${dirPath} 存在但不是目录`);
            resolve({ exists: true, isDirectory: false, isMatch: false });
          } else if (!shouldExist && isDirectory) {
            this.addLog(`❌ 目录验证失败: ${dirPath} 应该不存在但实际存在`);
            resolve({ exists: true, isDirectory: true, isMatch: false });
          } else {
            this.addLog(`✅ 目录不存在验证通过: ${dirPath}`);
            resolve({ exists: false, isDirectory: false, isMatch: true });
          }
        },
        fail: () => {
          if (!shouldExist) {
            this.addLog(`✅ 目录不存在验证通过: ${dirPath}`);
            resolve({ exists: false, isDirectory: false, isMatch: true });
          } else {
            this.addLog(`❌ 目录不存在验证失败: ${dirPath} 应该存在但实际不存在`);
            resolve({ exists: false, isDirectory: false, isMatch: false });
          }
        }
      });
    });
  },

  // 验证目录内容
  verifyDirectoryContents(dirPath, expectedFiles = []) {
    return new Promise((resolve) => {
      this.fs.readdir({
        dirPath: dirPath,
        success: (res) => {
          const actualFiles = res.files.sort();
          const sortedExpectedFiles = expectedFiles.sort();
          
          const isMatch = actualFiles.length === sortedExpectedFiles.length &&
                         actualFiles.every((file, index) => file === sortedExpectedFiles[index]);
          
          if (isMatch) {
            this.addLog(`✅ 目录内容验证通过: ${dirPath}, 共 ${actualFiles.length} 项`);
          } else {
            this.addLog(`❌ 目录内容验证失败: ${dirPath}`);
            this.addLog(`   期望: [${sortedExpectedFiles.join(', ')}]`);
            this.addLog(`   实际: [${actualFiles.join(', ')}]`);
          }
          
          resolve({ 
            isMatch, 
            actualFiles, 
            expectedFiles: sortedExpectedFiles,
            actualCount: actualFiles.length,
            expectedCount: sortedExpectedFiles.length
          });
        },
        fail: (err) => {
          this.addLog(`❌ 目录内容验证失败，无法读取目录: ${err.errMsg}`);
          resolve({ isMatch: false, error: err.errMsg });
        }
      });
    });
  },

  // 添加日志（输出到控制台）
  addLog(message) {
    console.log(message);
  },



  // 输入处理
  onDirPathInput(e) {
    this.setData({
      testDirPath: e.detail.value
    });
  },

  // 创建目录
  makeDir() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    // 检查mkdir API是否可用
    if (typeof this.fs.mkdir !== 'function') {
      this.addLog('❌ 当前平台不支持 mkdir API');
      this.addLog('💡 建议：可以通过创建文件的方式间接创建目录结构');
      this.createDirByFile(testDirPath);
      return;
    }

    this.setData({ isLoading: true });
    this.fs.mkdir({
      dirPath: testDirPath,
      recursive: true, // 允许递归创建
      success: async (res) => {
        this.addLog(`✅ 目录创建成功: ${testDirPath}`);
        console.log('mkdir success:', res);
        
        // 自动验证目录创建结果
        this.addLog('🔍 开始验证目录创建...');
        const verification = await this.verifyDirectoryExists(testDirPath, true);
        
        if (verification.isMatch) {
          this.addLog('✅ 目录创建验证完成，目录已成功创建');
          
          // 验证目录初始为空
          const contentsVerification = await this.verifyDirectoryContents(testDirPath, []);
          if (contentsVerification.isMatch) {
            this.addLog('✅ 新创建的目录为空，符合预期');
          } else {
            this.addLog('⚠️ 新创建的目录不为空，可能有意外文件');
          }
        } else {
          this.addLog('❌ 目录创建验证失败');
        }
      },
      fail: (err) => {
        this.addLog(`❌ 目录创建失败: ${err.errMsg}`);
        console.log('mkdir fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 通过创建文件的方式间接创建目录（备选方案）
  createDirByFile(dirPath) {
    this.addLog('💡 尝试通过创建临时文件的方式创建目录结构...');
    
    const tempFilePath = `${dirPath}/.temp_${Date.now()}`;
    
    this.setData({ isLoading: true });
    this.fs.writeFile({
      filePath: tempFilePath,
      data: 'temp file for directory creation',
      encoding: 'utf8',
      success: (res) => {
        this.addLog(`✅ 通过临时文件创建目录成功: ${dirPath}`);
        
        // 删除临时文件
        this.fs.unlink({
          filePath: tempFilePath,
          success: () => {
            this.addLog('✅ 临时文件已删除');
            
            // 验证目录是否创建成功
            this.verifyDirectoryExists(dirPath, true).then(verification => {
              if (verification.isMatch) {
                this.addLog('✅ 目录创建验证通过');
              } else {
                this.addLog('❌ 目录创建验证失败');
              }
            });
          },
          fail: (err) => {
            this.addLog(`⚠️ 临时文件删除失败，但目录已创建: ${err.errMsg}`);
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ 通过文件方式创建目录失败: ${err.errMsg}`);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步创建目录
  makeDirSync() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    // 检查mkdirSync API是否可用
    if (typeof this.fs.mkdirSync !== 'function') {
      this.addLog('❌ 当前平台不支持 mkdirSync API');
      this.addLog('💡 建议：使用异步方式创建目录或通过文件创建');
      return;
    }

    try {
      this.fs.mkdirSync(testDirPath, true); // 递归创建
      this.addLog(`✅ 同步创建目录成功: ${testDirPath}`);
      
      // 验证创建结果
      this.verifyDirectoryExists(testDirPath, true).then(verification => {
        if (verification.isMatch) {
          this.addLog('✅ 同步目录创建验证通过');
        } else {
          this.addLog('❌ 同步目录创建验证失败');
        }
      });
    } catch (err) {
      this.addLog(`❌ 同步创建目录失败: ${err.message}`);
      console.log('mkdirSync error:', err);
    }
  },

  // 删除目录
  removeDir() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    // 检查rmdir API是否可用
    if (typeof this.fs.rmdir !== 'function') {
      this.addLog('❌ 当前平台不支持 rmdir API');
      this.addLog('💡 建议：可以通过删除目录内所有文件来清理目录');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.rmdir({
      dirPath: testDirPath,
      recursive: true, // 允许递归删除
      success: async (res) => {
        this.addLog(`✅ 目录删除成功: ${testDirPath}`);
        this.setData({ dirContents: [] }); // 清空目录内容
        console.log('rmdir success:', res);
        
        // 自动验证目录删除结果
        this.addLog('🔍 开始验证目录删除...');
        const verification = await this.verifyDirectoryExists(testDirPath, false);
        
        if (verification.isMatch) {
          this.addLog('✅ 目录删除验证完成，目录已不存在');
        } else {
          this.addLog('❌ 目录删除验证失败，目录仍然存在');
        }
      },
      fail: (err) => {
        this.addLog(`❌ 目录删除失败: ${err.errMsg}`);
        console.log('rmdir fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步删除目录
  removeDirSync() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    try {
      this.fs.rmdirSync(testDirPath, true); // 递归删除
      this.addLog(`✅ 同步删除目录成功: ${testDirPath}`);
      this.setData({ dirContents: [] }); // 清空目录内容
    } catch (err) {
      this.addLog(`❌ 同步删除目录失败: ${err.message}`);
      console.log('rmdirSync error:', err);
    }
  },

  // 读取目录内容
  readDir() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    // 检查readdir API是否可用
    if (typeof this.fs.readdir !== 'function') {
      this.addLog('❌ 当前平台不支持 readdir API');
      this.addLog('💡 无法读取目录内容，请检查平台文件系统API支持');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.readdir({
      dirPath: testDirPath,
      success: (res) => {
        this.addLog(`✅ 读取目录成功，共 ${res.files.length} 项`);
        this.setData({ dirContents: res.files });
        console.log('readdir success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 读取目录失败: ${err.errMsg}`);
        console.log('readdir fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步读取目录内容
  readDirSync() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    try {
      const files = this.fs.readdirSync(testDirPath);
      this.addLog(`✅ 同步读取目录成功，共 ${files.length} 项`);
      this.setData({ dirContents: files });
    } catch (err) {
      this.addLog(`❌ 同步读取目录失败: ${err.message}`);
      console.log('readdirSync error:', err);
    }
  },

  // 获取文件/目录状态信息
  getStats() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.stat({
      path: testDirPath,
      recursive: false,
      success: (res) => {
        this.addLog(`✅ 获取状态信息成功`);
        this.setData({ statsInfo: res.stats });
        console.log('stat success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 获取状态信息失败: ${err.errMsg}`);
        console.log('stat fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步获取文件/目录状态信息
  getStatsSync() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入路径');
      return;
    }

    try {
      const stats = this.fs.statSync(testDirPath, false);
      this.addLog(`✅ 同步获取状态信息成功`);
      this.setData({ statsInfo: stats });
    } catch (err) {
      this.addLog(`❌ 同步获取状态信息失败: ${err.message}`);
      console.log('statSync error:', err);
    }
  },

  // 递归获取目录状态信息
  getStatsRecursive() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    this.setData({ isLoading: true });
    this.fs.stat({
      path: testDirPath,
      recursive: true,
      success: (res) => {
        this.addLog(`✅ 递归获取状态信息成功，共 ${res.stats.length} 项`);
        this.setData({ statsInfo: res.stats });
        console.log('stat recursive success:', res);
      },
      fail: (err) => {
        this.addLog(`❌ 递归获取状态信息失败: ${err.errMsg}`);
        console.log('stat recursive fail:', err);
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 同步递归获取目录状态信息
  getStatsRecursiveSync() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请输入目录路径');
      return;
    }

    try {
      const stats = this.fs.statSync(testDirPath, true);
      this.addLog(`✅ 同步递归获取状态信息成功，共 ${Array.isArray(stats) ? stats.length : 1} 项`);
      this.setData({ statsInfo: stats });
    } catch (err) {
      this.addLog(`❌ 同步递归获取状态信息失败: ${err.message}`);
      console.log('statSync recursive error:', err);
    }
  },

  // 在当前目录创建测试文件
  createTestFile() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请先设置目录路径');
      return;
    }

    const testFileName = `test_file_${Date.now()}.txt`;
    const testFilePath = `${testDirPath}/${testFileName}`;
    const testContent = `这是一个测试文件\n创建时间: ${new Date().toLocaleString()}`;

    // 先获取目录当前内容用于验证
    this.fs.readdir({
      dirPath: testDirPath,
      success: (dirRes) => {
        const originalFiles = dirRes.files || [];
        
        this.fs.writeFile({
          filePath: testFilePath,
          data: testContent,
          encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
          success: async (res) => {
            this.addLog(`✅ 测试文件创建成功: ${testFilePath}`);
            
            // 验证文件是否添加到目录中
            this.addLog('🔍 开始验证文件创建...');
            const expectedFiles = [...originalFiles, testFileName].sort();
            const verification = await this.verifyDirectoryContents(testDirPath, expectedFiles);
            
            if (verification.isMatch) {
              this.addLog('✅ 文件创建验证完成，目录内容符合预期');
            } else {
              this.addLog('❌ 文件创建验证失败，目录内容不符合预期');
            }
            
            // 自动刷新目录内容显示
            this.readDir();
          },
          fail: (err) => {
            this.addLog(`❌ 测试文件创建失败: ${err.errMsg}`);
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ 无法读取目录用于验证: ${err.errMsg}`);
        // 即使无法验证也尝试创建文件
        this.fs.writeFile({
          filePath: testFilePath,
          data: testContent,
          encoding: 'utf8', // 小红书仅支持 utf8 和 binary 编码
          success: (res) => {
            this.addLog(`✅ 测试文件创建成功: ${testFilePath}`);
            this.addLog('⚠️ 无法验证目录内容（目录不存在或无法读取）');
            this.readDir();
          },
          fail: (err) => {
            this.addLog(`❌ 测试文件创建失败: ${err.errMsg}`);
          }
        });
      }
    });
  },

  // 在当前目录创建子目录
  createSubDir() {
    const { testDirPath } = this.data;
    if (!testDirPath) {
      this.addLog('请先设置目录路径');
      return;
    }

    const subDirName = `sub_dir_${Date.now()}`;
    const subDirPath = `${testDirPath}/${subDirName}`;

    // 先获取目录当前内容用于验证
    this.fs.readdir({
      dirPath: testDirPath,
      success: (dirRes) => {
        const originalFiles = dirRes.files || [];
        
        this.fs.mkdir({
          dirPath: subDirPath,
          recursive: true,
          success: async (res) => {
            this.addLog(`✅ 子目录创建成功: ${subDirPath}`);
            
            // 验证子目录是否添加到父目录中
            this.addLog('🔍 开始验证子目录创建...');
            const expectedFiles = [...originalFiles, subDirName].sort();
            const verification = await this.verifyDirectoryContents(testDirPath, expectedFiles);
            
            if (verification.isMatch) {
              this.addLog('✅ 子目录创建验证完成，父目录内容符合预期');
              
              // 验证新创建的子目录为空
              const subDirVerification = await this.verifyDirectoryContents(subDirPath, []);
              if (subDirVerification.isMatch) {
                this.addLog('✅ 新创建的子目录为空，符合预期');
              } else {
                this.addLog('⚠️ 新创建的子目录不为空，可能有意外文件');
              }
            } else {
              this.addLog('❌ 子目录创建验证失败，父目录内容不符合预期');
            }
            
            // 自动刷新目录内容显示
            this.readDir();
          },
          fail: (err) => {
            this.addLog(`❌ 子目录创建失败: ${err.errMsg}`);
          }
        });
      },
      fail: (err) => {
        this.addLog(`❌ 无法读取目录用于验证: ${err.errMsg}`);
        // 即使无法验证也尝试创建子目录
        this.fs.mkdir({
          dirPath: subDirPath,
          recursive: true,
          success: (res) => {
            this.addLog(`✅ 子目录创建成功: ${subDirPath}`);
            this.addLog('⚠️ 无法验证目录内容（父目录不存在或无法读取）');
            this.readDir();
          },
          fail: (err) => {
            this.addLog(`❌ 子目录创建失败: ${err.errMsg}`);
          }
        });
      }
    });
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 格式化时间
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleString();
  },

  // 获取文件/目录类型
  getItemType(stats) {
    if (stats.isDirectory && stats.isDirectory()) return '目录';
    if (stats.isFile && stats.isFile()) return '文件';
    return '未知';
  }
});
