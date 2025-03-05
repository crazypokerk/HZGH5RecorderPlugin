class ForguncyRecorder {
    rec;
    recBlob;
    recordOutputType;
    sampleRate;
    bitRate;
    processTime;

    constructor(recordOutputType, sampleRate, bitRate) {
        this.recordOutputType = recordOutputType;
        this.sampleRate = sampleRate;
        this.bitRate = bitRate;
    }

    #recorderInstance() {
        let newRecorder = Recorder({
            type: this.recordOutputType,
            sampleRate: this.sampleRate,
            bitRate: this.bitRate,
            onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
                //录音实时回调，大约1秒调用12次本回调，buffers为开始到现在的所有录音pcm数据块(16位小端LE)
                //可利用extensions/sonic.js插件实时变速变调，此插件计算量巨大，onProcess需要返回true开启异步模式
                //可实时上传（发送）数据，配合Recorder.SampleData方法，将buffers中的新数据连续的转换成pcm上传，或使用mock方法将新数据连续的转码成其他格式上传，可以参考文档里面的：Demo片段列表 -> 实时转码并上传-通用版；基于本功能可以做到：实时转发数据、实时保存数据、实时语音识别（ASR）等
                this.processTime = Date.now();
            }
        });
        return newRecorder;
    }

    async OperationRecorder(operationCode) {
        /**
         * Open   0
         * Close  1
         * Start  2
         * Pause  3
         * Resume 4
         * Stop   5
         */
        let saveDataInIndexedDBKeyID;
        switch (operationCode) {
            case 0:
                this.rec = this.#recorderInstance();
                this.rec.open(function () {
                    console.info(`INFO: 已打开录音，可以点击录制开始录音了`);
                }, function (msg, isUserNotAllow) {
                    console.error(`(${isUserNotAllow} ? "UserNotAllow," : "") 用户拒绝打开录音权限，打开录音失败,${msg}`);
                });
                break;
            case 1:
                if (this.rec) {
                    this.rec.close();
                    console.info(`INFO: 已关闭录音，释放资源`);
                } else {
                    console.warn(`WARN: 未打开录音权限，请先打开录音权限`);
                }
                break;
            case 2:
                if (this.rec && Recorder.IsOpen()) {
                    this.recBlob = null;
                    this.rec.start();
                    console.info(`INFO: 已开始录音，正在录音中...`);
                }
                let wdt = this.rec.watchDogTimer = setInterval(() => {
                    if (!this.rec || wdt !== this.rec.watchDogTimer) {
                        clearInterval(wdt);
                        return;
                    } //sync
                    if (Date.now() < this.rec.wdtPauseT) return; //如果暂停录音了就不检测：puase时赋值rec.wdtPauseT=Date.now()*2（永不监控），resume时赋值rec.wdtPauseT=Date.now()+1000（1秒后再监控）
                    if (Date.now() - (this.processTime || startTime) > 1500) {
                        clearInterval(wdt);
                        console.warn(this.processTime ? "录音被中断" : "录音未能正常开始");
                        // ... 错误处理，关闭录音，提醒用户
                        try {
                            this.rec.close();
                            console.warn("未能正常开始录音，已关闭录音资源");
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }, 1000);
                let startTime = Date.now();
                this.rec.wdtPauseT = 0;
                this.processTime = 0;
                break;
            case 3:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.pause();
                    this.rec.wdtPauseT = Date.now() * 2; //永不监控onProcess超时
                    console.info(`INFO: 录音已暂停`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            case 4:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.resume();
                    this.rec.wdtPauseT = Date.now() + 1000; //1秒后再监控onProcess超时
                    console.info(`INFO: 继续录音中...`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            case 5:
                try {
                    if (!(this.rec && Recorder.IsOpen())) {
                        console.info(`INFO: 未打开录音`);
                        return;
                    }
                    this.rec.watchDogTimer = 0; //停止监控onProcess超时
                    await this.rec.stop(async (blob, duration, mine) => {
                        console.log(blob, (window.URL || webkitURL).createObjectURL(blob));
                        let opdb = new IndexedDBInstance('hzg-rc-1', 1);
                        await opdb.initLocalForage();
                        if (!opdb.DBStatus) {
                            console.error('IndexedDB初始化异常！');
                        }
                        let keyId = opdb.setItemInDB('record', blob).then((result) => {
                            console.log('Save record success!');
                        });
                        saveDataInIndexedDBKeyID = keyId;
                        this.recBlob = blob;
                        console.warn(`INFO: 已录制mp3：${this.#formatMs(duration)}ms, ${blob.size}字节`);
                    }, function (msg) {
                        console.error(`${msg},录音失败`);
                    }, true);
                } catch (e) {
                    throw new Error('Save data error...')
                } finally {
                    // this.rec.close();
                    window.frobj = null;
                }
                break;
            default:
                throw new Error('选择类型错误');
        }
        return saveDataInIndexedDBKeyID;
    }

    #formatMs(ms, all) {
        let ss = ms % 1000;
        ms = (ms - ss) / 1000;
        let s = ms % 60;
        ms = (ms - s) / 60;
        let m = ms % 60;
        ms = (ms - m) / 60;
        let h = ms;
        let t = (h ? h + ":" : "")
            + (all || h + m ? ("0" + m).substr(-2) + ":" : "")
            + (all || h + m + s ? ("0" + s).substr(-2) + "″" : "")
            + ("00" + ss).substr(-3);
        return t;
    }
}