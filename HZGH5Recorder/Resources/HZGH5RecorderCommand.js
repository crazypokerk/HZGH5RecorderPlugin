/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />

class HZGH5RecorderCommand extends Forguncy.Plugin.CommandBase {
    execute() {
        let rec, processTime, wave, recBlob;

        // 获取属性值，注意，这里的MyProperty应该与 HZGH5RecorderCommand.cs 文件定义的属性名一致
        let operation = this.CommandParam.Operation;
        let outParamaterCode = this.CommandParam.OutParamaterCode;
        let outParamaterName = this.CommandParam.OutParamaterName;

        let recordOutputType = this.CommandParam.RecordOutputType;
        let samepleRate = this.CommandParam.SamepleRate;
        let bitRate = this.CommandParam.BitRate;

        let recorderInstance = function () {
            rec = null;
            wave = null;
            recBlob = null;
            let newRecorder = Recorder({
                type: recordOutputType,
                samepleRate: samepleRate,
                bitRate: bitRate,
                onProcess: function () {

                }
            });

            return newRecorder;
        }

        switch (operation) {
            case 0:
                rec = recorderInstance();
                rec.open(function () {
                    console.info(`INFO: 已打开录音，可以点击录制开始录音了`);
                }, function (msg, isUserNotAllow) {
                    console.error(`(${isUserNotAllow} ? "UserNotAllow," : "") 用户拒绝打开录音权限，打开录音失败,${msg}`);
                });
                break;
            case 1:
                if (rec) {
                    rec.close();
                    console.info(`INFO: 已关闭录音，释放资源`);
                } else {
                    console.warn(`WRAN: 未打开录音权限，请先打开录音权限`);
                }
                break;
            case 2:
                if (rec && Recorder.IsOpen()) {
                    recBlob = null;
                    rec.start();
                    console.info(`INFO: 已开始录音，正在录音中...`);
                }
                var wdt = rec.watchDogTimer = setInterval(function () {
                    if (!rec || wdt != rec.watchDogTimer) {
                        clearInterval(wdt);
                        return
                    } //sync
                    if (Date.now() < rec.wdtPauseT) return; //如果暂停录音了就不检测：puase时赋值rec.wdtPauseT=Date.now()*2（永不监控），resume时赋值rec.wdtPauseT=Date.now()+1000（1秒后再监控）
                    if (Date.now() - (processTime || startTime) > 1500) {
                        clearInterval(wdt);
                        console.warn(processTime ? "录音被中断" : "录音未能正常开始");
                        // ... 错误处理，关闭录音，提醒用户
                        try {
                            rec.close();
                            console.warn("未能正常开始录音，已关闭录音资源");
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }, 1000);
                break;
            case 3:
                if (rec && Recorder.IsOpen()) {
                    rec.pause();
                    rec.wdtPauseT = Date.now() * 2; //永不监控onProcess超时
                    console.info(`INFO: 录音已暂停`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            case 4:
                if (rec && Recorder.IsOpen()) {
                    rec.resume();
                    rec.wdtPauseT = Date.now() + 1000; //1秒后再监控onProcess超时
                    console.info(`INFO: 继续录音中...`);
                } else {
                    console.info(`INFO: 未打开录音`);
                }
                break;
            case 5:
                if (!(rec && Recorder.IsOpen())) {
                    console.info(`INFO: 未打开录音`);
                    return;
                }
                rec.watchDogTimer = 0; //停止监控onProcess超时
                rec.stop(function (blob, duration) {
                    console.log(blob, (window.URL || webkitURL).createObjectURL(blob), Html_xT(Html_$T("gOix::时长:{1}ms", 0, duration)));

                    recBlob = blob;
                    console.info(`INFO: 已录制mp3：${formatMs(duration)}ms, ${blob.size}字节`);
                }, function (msg) {
                    console.error(`${msg},录音失败`);
                });
                break;
            default:
                throw new DOMException();
        }
    }
}

Forguncy.Plugin.CommandFactory.registerCommand("HZGH5Recorder.HZGH5RecorderCommand, HZGH5Recorder", HZGH5RecorderCommand);