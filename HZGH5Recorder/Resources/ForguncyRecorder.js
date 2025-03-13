class ForguncyRecorder {
    rec;
    recBlob;
    recordOutputType;
    sampleRate;
    bitRate;
    waveInstance;
    isVisibleWaveView;
    sendFrameSize = 0;
    send_pcmBuffer = new Int16Array(0);
    send_pcmSampleRate;
    send_chunk = null;
    send_lastFrame = null;
    send_logNumber = 0;
    iatWSObj;

    constructor(recordOutputType, sampleRate, bitRate, isVisibleWaveView, sendFrameSize = 0) {
        this.recordOutputType = recordOutputType;
        this.sampleRate = sampleRate;
        this.bitRate = bitRate;
        this.isVisibleWaveView = isVisibleWaveView;
        this.sendFrameSize = sendFrameSize;
    }

    #recorderInstance() {
        if (this.bitRate !== 16 && this.sendFrameSize % 2 === 1) {
            throw new Error('sendFrameSize必须为偶数！');
        }
        let clearBufferIdx = 0;
        let newRecorder = Recorder({
            type: "unknown",
            sampleRate: this.sampleRate,
            bitRate: this.bitRate,
            sendFrameSize: this.sendFrameSize,
            onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
                this.waveInstance && this.waveInstance.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
                for (let i = clearBufferIdx; i < newBufferIdx; i++) {
                    buffers[i] = null;
                }
                clearBufferIdx = newBufferIdx;
                this.realTimeSendTry(buffers, bufferSampleRate, false);
            }
        });
        if (window.location.hostname !== 'localhost') {
            newRecorder.CLog = function () {
            }
        }
        // 创建好录音对象同时，初始化iatWS对象
        this.iatWSObj = new IATwsInstance('7300d69c', '7f006057e1511f8b8f0b5ec3598c0aee', 'Y2ViMTAzNmI4YjIzMDA4MzVjMjBmYzFl');
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
            // open
            case 0:
                this.rec = this.#recorderInstance();
                if (this.isVisibleWaveView) {
                    this.waveInstance = new WaveViewInstance(180, 60);
                }
                new Promise((resolve, reject) => {
                    this.rec.open(() => {
                        console.info(`INFO: 已打开录音，可以点击录制开始录音了`);
                        resolve();
                    }, function (msg, isUserNotAllow) {
                        console.error(`(${isUserNotAllow} ? "UserNotAllow," : "") 用户拒绝打开录音权限，打开录音失败,${msg}`);
                        reject();
                    });
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        this.rec.start();
                        resolve();
                    });
                }).then(() => {
                    this.#realTimeSendReset();
                    // 开启ws连接
                    try {
                        this.iatWSObj.connectWebSocket();
                    } catch (e) {
                        console.error('WebSocket连接异常！');
                        throw new Error('WebSocket连接异常！');
                    }
                });
                break;
            // close
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
            // start
            case 2:
                if (this.rec && Recorder.IsOpen()) {
                    this.recBlob = null;
                    if (this.iatWSObj.checkStatus() !== 'OPEN') {
                        this.rec.close();
                        this.iatWSObj.clearCountdown();
                        break;
                    }
                    this.rec.start();
                    console.info(`INFO: 已开始录音，正在录音中...`);
                }
                break;
            // pause
            case 3:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.pause();
                    console.info(`INFO: 录音已暂停`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            // resume
            case 4:
                if (this.rec && Recorder.IsOpen()) {
                    this.rec.resume();
                    console.info(`INFO: 继续录音中...`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            // stop
            case 5:
                try {
                    if (!(this.rec && Recorder.IsOpen())) {
                        console.info(`INFO: 未打开录音`);
                        return;
                    }
                    this.rec.watchDogTimer = 0; //停止监控onProcess超时
                    localStorage.setItem('resultTextTemp', this.iatWSObj.resultTextTemp);
                    this.rec.stop(async (blob, duration, mine) => {
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

                        this.realTimeSendTry([], 0, true);
                        // 关闭ws定时器
                        this.iatWSObj.clearCountdown();
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

    // 实时处理核心函数
    realTimeSendTry(buffers, bufferSampleRate, isClose) {
        console.log('realTimeSendTry', buffers, isClose);
        //提取出新的pcm数据
        let pcm = new Int16Array(0);
        //没有指定固定的帧大小，直接把chunkBytes发送出去即可
        if (buffers.length > 0) {
            let chunk = Recorder.SampleData(buffers, bufferSampleRate, this.sampleRate, this.send_chunk);
            this.send_chunk = chunk;

            pcm = chunk.data; //此时的pcm就是原始的音频16位pcm数据（小端LE），直接保存即为16位pcm文件、加个wav头即为wav文件、丢给mp3编码器转一下码即为mp3文件
            this.send_pcmSampleRate = chunk.sampleRate;
        }

        if (!this.sendFrameSize) {
            this.#transferUpload(pcm, isClose);
            return;
        }

        console.log(1)
        //先将数据写入缓冲，再按固定大小切分后发送 【不建议使用固定的帧大小】
        let pcmBuffer = this.send_pcmBuffer;
        let tmp = new Int16Array(pcmBuffer.length + pcm.length);
        tmp.set(pcmBuffer, 0);
        tmp.set(pcm, pcmBuffer.length);
        pcmBuffer = tmp;

        let chunkSize = this.sendFrameSize / (this.bitRate / 8);
        while (true) {
            console.log(2)
            //切分出固定长度的一帧数据（注：包含若干个音频帧，首尾不一定刚好是完整的音频帧）
            if (pcmBuffer.length >= chunkSize) {
                let frame = new Int16Array(pcmBuffer.subarray(0, chunkSize));
                pcmBuffer = new Int16Array(pcmBuffer.subarray(chunkSize));

                let closeVal = false;
                if (isClose && pcmBuffer.length === 0) {
                    closeVal = true;   //已关闭录音，且没有剩余要发送的数据了
                }
                // 
                // console.warn('send pcmBuffer.length >= chunkSize')
                this.#transferUpload(frame, closeVal);
                if (!closeVal) {
                    continue;    //循环切分剩余数据
                }
            } else if (isClose) {
                //已关闭录音，但此时结尾剩余的数据不够一帧长度
                let frame = new Int16Array(chunkSize);
                frame.set(pcmBuffer);
                pcmBuffer = new Int16Array(0);
                //
                // console.warn('send isClose')
                this.#transferUpload(frame, true);
            }
            break;
        }
        //剩余数据存回去，留给下次发送
        this.send_pcmBuffer = pcmBuffer;
    }

    // 数据传输函数
    #transferUpload(pcmFrame, isClose) {
        if (isClose && pcmFrame.length === 0) {
            let len = this.send_lastFrame ? this.send_lastFrame.length : Math.round(this.send_pcmSampleRate / 1000 * 50);
            pcmFrame = new Int16Array(len);
        }
        this.send_lastFrame = pcmFrame;
        console.warn(`readyState: ${this.iatWSObj.iatWS.readyState}`);

        if (this.iatWSObj.iatWS.readyState === this.iatWSObj.iatWS.OPEN) {
            this.iatWSObj.iatWS.send(
                JSON.stringify({
                    data: {
                        status: isClose ? 2 : 1,
                        format: "audio/L16;rate=16000",
                        encoding: "raw",
                        audio: this.#toBase64(pcmFrame.buffer),
                    }
                })
            );
            if (isClose) {
                this.iatWSObj.iatWS.changeStatus("CLOSING");
            }
        }
    }

    #toBase64(buffer) {
        let binary = "";
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // 重置环境，每次开始录音时必须先调用此方法，清理环境
    #realTimeSendReset() {
        this.send_pcmBuffer = new Int16Array(0);
        this.send_chunk = null;
        this.send_lastFrame = null;
        this.send_logNumber = 0;
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