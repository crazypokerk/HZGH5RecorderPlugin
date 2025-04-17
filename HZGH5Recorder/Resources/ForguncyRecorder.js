﻿class ForguncyRecorder {
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
    isOpenRealtimeIAT;

    constructor(recordOutputType, sampleRate, bitRate, isVisibleWaveView, sendFrameSize = 0, isOpenRealtimeIAT = false) {
        this.recordOutputType = recordOutputType;
        this.sampleRate = sampleRate;
        this.bitRate = bitRate;
        this.isVisibleWaveView = isVisibleWaveView;
        this.sendFrameSize = sendFrameSize;
        this.isOpenRealtimeIAT = isOpenRealtimeIAT;
    }

    #recorderInstance(type) {
        if (this.bitRate !== 16 && this.sendFrameSize % 2 === 1) {
            throw new Error('sendFrameSize必须为偶数！');
        }
        let clearBufferIdx = 0;
        let newRecorder = Recorder({
            type: type,
            sampleRate: this.sampleRate,
            bitRate: this.bitRate,
            sendFrameSize: this.sendFrameSize,
            onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
                this.waveInstance && this.waveInstance.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
                if (this.isOpenRealtimeIAT) {
                    for (let i = clearBufferIdx; i < newBufferIdx; i++) {
                        buffers[i] = null;
                    }
                    clearBufferIdx = newBufferIdx;
                    this.realTimeSendTry(buffers, bufferSampleRate, false);
                }
            }
        });
        if (window.location.hostname !== 'localhost') {
            newRecorder.CLog = function () {
            }
        }

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
        let operationReturnCode, operationReturnMsg;
        const handleOperation = async (operationCode) => {
            const setReturn = (success, msg) => {
                operationReturnCode = success ? 0 : -1;
                operationReturnMsg = {
                    success,
                    msg
                }
            }

            const validateRecorder = () => {
                if (!this.rec || !Recorder.IsOpen()) {
                    setReturn(false, "未打开录音");
                    return false;
                }
                return true;
            }

            try {
                switch (operationCode) {
                    // open
                    case 0:
                        this.rec = this.#recorderInstance(this.recordOutputType);
                        if (this.isVisibleWaveView) {
                            this.waveInstance = new WaveViewInstance(180, 60);
                        }

                        await this.rec.open(() => {
                            setReturn(true, "打开录音成功")
                        }, (msg, isUserNotAllow) => {
                            setReturn(false, isUserNotAllow ? "用户拒绝打开录音权限，打开录音失败" : `打开录音失败: ${msg}`);
                        });
                        break;
                    // close
                    case 1:
                        if (!validateRecorder()) return;

                        try {
                            this.rec.close();
                            setReturn(true, "已关闭录音，释放资源");
                            window.frobj = null; // 清理全局对象
                        } catch (e) {
                            setReturn(false, `录音关闭失败: ${e.message}`);
                        }
                        break;
                    // start
                    case 2:
                        if (!validateRecorder()) return;

                        try {
                            this.recBlob = null;
                            this.rec.start();
                            setReturn(true, "已开始录音，正在录音中");
                        } catch (e) {
                            setReturn(false, `录音启动失败: ${e.message}`);
                        }
                        break;
                    // pause
                    case 3:
                        if (!validateRecorder()) return;
                        try {
                            this.rec.pause();
                            setReturn(true, "录音已暂停");
                        } catch (e) {
                            setReturn(false, `录音暂停失败: ${e.message}`);
                        }
                        break;
                    // resume
                    case 4:
                        if (!validateRecorder()) return;
                        try {
                            this.rec.resume();
                            setReturn(true, "录音已恢复");
                        } catch (e) {
                            setReturn(false, `录音恢复失败: ${e.message}`);
                        }
                        break;
                    // stop
                    case 5:
                        if (!validateRecorder()) return;

                        try {
                            this.rec.stop(async (blob, duration) => {
                                console.log(blob, (window.URL || webkitURL).createObjectURL(blob));

                                try {
                                    const opdb = new IndexedDBInstance('hzg-rc-1', 1);
                                    await opdb.initLocalForage();

                                    if (!opdb.DBStatus) {
                                        setReturn(false, "IndexedDB初始化失败");
                                    }

                                    const keyId = opdb.setItemInDB('record', blob);
                                    saveDataInIndexedDBKeyID = keyId;
                                    this.recBlob = blob;

                                    setReturn(true, `已录制mp3：${this.#formatMs(duration)}ms, ${blob.size}字节`);
                                } catch (e) {
                                    setReturn(false, `数据保存失败: ${e.message}`);
                                }
                            }, (msg) => {
                                setReturn(false, `录音停止失败: ${msg}`);
                            }, true);
                        } catch (e) {
                            setReturn(false, `录音停止异常: ${e.message}`);
                        }
                        break;
                    default:
                        setReturn(false, "操作码错误");
                }
            } catch (e) {
                setReturn(false, `操作执行异常: ${e.message}`);
            }
        }

        await handleOperation(operationCode);

        return {
            saveDataInIndexedDBKeyID,
            operationReturnCode,
            operationReturnMsg
        }
    }

    // 测试用，前端实时语音识别
    startRealTimeRecord() {
        if (window.frobj != null) {
            window.frobj.rec = null;
        }
        this.rec = this.#recorderInstance(this.recordOutputType);
        // 创建好录音对象同时，初始化iatWS对象
        this.iatWSObj = new IATwsInstance('7300d69c', '7f006057e1511f8b8f0b5ec3598c0aee', 'Y2ViMTAzNmI4YjIzMDA4MzVjMjBmYzFl');
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
    }

    stopRealTimeRecord() {
        try {
            if (!(this.rec && Recorder.IsOpen())) {
                console.info(`INFO: 未打开录音`);
                return;
            }
            localStorage.setItem('resultTextTemp', this.iatWSObj.resultTextTemp);
            this.rec.stop(async (blob, duration, mine) => {
                // 关闭ws定时器
                // this.iatWSObj.clearCountdown();
                console.log(blob, (window.URL || webkitURL).createObjectURL(blob));
                this.recBlob = blob;
                console.warn(`INFO: 已录制mp3：${this.#formatMs(duration)}ms, ${blob.size}字节`);
                this.realTimeSendTry([], 0, true);
            }, function (msg) {
                console.info(`${msg} Real time record stop`);
            }, true);
        } catch (e) {
            throw new Error('Save data error...')
        } finally {
            window.frobj = null;
            // this.iatWSObj.iatWS.close();
        }
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

        //先将数据写入缓冲，再按固定大小切分后发送 【不建议使用固定的帧大小】
        let pcmBuffer = this.send_pcmBuffer;
        let tmp = new Int16Array(pcmBuffer.length + pcm.length);
        tmp.set(pcmBuffer, 0);
        tmp.set(pcm, pcmBuffer.length);
        pcmBuffer = tmp;

        let chunkSize = this.sendFrameSize / (this.bitRate / 8);
        while (true) {
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