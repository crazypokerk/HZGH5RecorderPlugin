class ForguncyRecorder {
    rec;
    recBlob;
    recordOutputType;
    sampleRate;
    bitRate;
    waveInstance;
    isVisibleWaveView;

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
            onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate) => {
                this.waveInstance && this.waveInstance.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
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
                if (this.isVisibleWaveView) {
                    this.waveInstance = new WaveViewInstance(180, 60);
                }
                this.rec.open(() => {
                    console.info(`INFO: 已打开录音，可以点击录制开始录音了`);
                }, function (msg, isUserNotAllow) {
                    console.error(`(${isUserNotAllow} ? "UserNotAllow," : "") 用户拒绝打开录音权限，打开录音失败,${msg}`);
                });
                break;
            case 1:
                if (this.rec) {
                    this.rec.close();
                    // 当关闭录音后，需要释放资源，清除挂在window对象上的frobj对象
                    window.frobj = null;
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
                break;
            case 3:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.pause();
                    console.info(`INFO: 录音已暂停`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            case 4:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.resume();
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