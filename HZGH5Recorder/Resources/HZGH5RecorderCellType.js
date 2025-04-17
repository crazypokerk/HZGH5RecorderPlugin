/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />

class HZGH5RecorderCellType extends Forguncy.Plugin.CellTypeBase {
    createContent() {
        // 获取MyProperty属性值，注意，这里的MyProperty应该与 HZGH5RecorderCellType.cs 文件定义的属性名一致
        const playButtonName = this.evaluateFormula(this.CellElement.CellType.PlayButtonName);
        const isVisiblePlaybutton = this.CellElement.CellType.IsVisiblePlaybutton;
        const isVisibleWaveView = this.CellElement.CellType.IsVisibleWaveView;
        const uploadButtonName = this.evaluateFormula(this.CellElement.CellType.UploadButtonName);
        const isVisibleUploadButton = this.CellElement.CellType.IsVisibleUploadButton;
        const downloadButtonName = this.evaluateFormula(this.CellElement.CellType.DownloadButtonName);
        const isVisibleDownloadButton = this.CellElement.CellType.IsVisibleDownloadButton;

        const isOpenRealtimeIAT = this.CellElement.CellType.IsOpenRealtimeIAT;

        // 目的是为了存入waveview是否显示，如果不显示，则命令插件在open时不会创建waveview
        localStorage.setItem("isVisibleWaveView", isVisibleWaveView);

        // 构建 Jquery Dom 并返回
        let $container = $('<div>', {
            'class': 'recorder_container',
        });

        // 创建播放按钮，并赋予相应的class和文本
        let $playButton = $('<button>', {
            'class': 'recorder_play_btn',
            text: playButtonName,
            type: 'button'
        });
        $playButton.on("click", () => {
            if (window.frobj == null) {
                throw new Error("未初始化录音，请先录音，然后[停止]后再播放");
            }
            let localUrl = (window.URL || webkitURL).createObjectURL(window.frobj.recBlob);
            let audio = document.createElement("audio");
            document.body.appendChild(audio);
            audio.src = localUrl;
            audio.play().then(() => {
                console.log("播放完成");
            }).catch((e) => {
                console.log(e);
                URL.revokeObjectURL(localUrl);
                throw new Error("播放失败");
            })
        })

        // 创建上传按钮，并赋予相应的class和文本
        let $uploadButtonName = $('<button>', {
            'class': 'recorder_upload_btn',
            text: uploadButtonName,
            type: 'button'
        });
        $uploadButtonName.on("click", () => {
            if (window.frobj == null) {
                throw new Error("未初始化录音，请先录音，然后[停止]后再上传");
            }
            this.#recordUpload(window.uploadType, window.uploadUrl);
        })

        // 创建下载按钮，并赋予相应的class和文本
        let $downloadButton = $('<button>', {
            'class': 'recorder_download_btn',
            text: downloadButtonName,
            type: 'button'
        });
        $downloadButton.on("click", () => {
            if (window.frobj == null) {
                throw new Error("未初始化录音，请先录音，然后[停止]后再下载");
            }
            this.#recordLocalDownload(window.uploadType, window.uploadUrl);
        })

        let $actionButton = $('<button>', {
            'id': 'recorder_action_btn',
            text: '开始',
            type: 'button'
        });
        if (isOpenRealtimeIAT) {
            this.#createForguncyRecorderInstance();
            $actionButton.on("click", (e) => {
                if ($actionButton.text() === '开始') {
                    if (window.frobj == null) {
                        this.#createForguncyRecorderInstance();
                    }
                    e.preventDefault();// 阻止默认滚动行为
                    this.startAction();
                    $actionButton.text("结束");
                    $actionButton.toggleClass('clicked');
                } else if ($actionButton.text() === '结束') {
                    $actionButton.text("开始");
                    $actionButton.toggleClass('clicked');
                    this.stopAction();
                }
            });

            // if (this.#getDeviceType() === 'mobile') {

            // $actionButton.on("touchend", (e) => {
            //     this.stopAction();
            //     $actionButton.text("Press");
            // });
            // $actionButton.on("touchcancel", (e) => {
            //     this.stopAction();
            //     $actionButton.text("Press");
            // })
            // } else if (this.#getDeviceType() === 'desktop') {
            //     $actionButton.on("mousedown", () => {
            //         if (window.frobj == null) {
            //             this.#createForguncyRecorderInstance();
            //         }
            //         this.startAction();
            //         $actionButton.text("Release");
            //     });
            //     $actionButton.on("mouseup", () => {
            //         this.stopAction();
            //         $actionButton.text("Press");
            //     })
            // }
        }
        // 测试实时语音识别，按住录音按钮，松开后停止

        let $waveViewDiv = $('<div>', {
            'class': 'recorder_wave_view',
            css: {
                width: 'inherit',
                height: '65%'
            }
        });

        if (!isVisiblePlaybutton) {
            $playButton.css("display", "none");
        }
        if (!isVisibleUploadButton) {
            $uploadButtonName.css("display", "none");
        }
        if (!isVisibleDownloadButton) {
            $downloadButton.css("display", "none");
        }

        if (!isVisibleWaveView) {
            $waveViewDiv.css("display", "none");
        }

        if (!isOpenRealtimeIAT) {
            $actionButton.css("display", "none");
        }

        $container.append($waveViewDiv, $playButton, $uploadButtonName, $downloadButton, $actionButton);
        return $container;
    }

    #createForguncyRecorderInstance() {
        let frobj = new ForguncyRecorder("unknown", 16000, 16, true, 1280, true);
        window.frobj = frobj;
    }

    startAction() {
        console.log('开始执行');
        console.log('正在执行...');
        window.frobj.startRealTimeRecord();
    }

    stopAction() {
        window.frobj.stopRealTimeRecord();
        let cellVal = parseInt(Forguncy.Page.getCell('trigger').getValue());
        Forguncy.Page.getCell('trigger').setValue(cellVal + 1);
        console.log('已停止');
    }

    onPageLoaded() {
        const uploadUrl = this.evaluateFormula(this.CellElement.CellType.UploadUrl);
        const uploadType = this.CellElement.CellType.UploadType;
        window.uploadUrl = uploadUrl;
        window.uploadType = uploadType;
    }
    
    #recordUpload(uploadType, uploadUrl) {
        switch (uploadType) {
            case "Base64":
                this.#uploadBase64(uploadUrl);
                break;
            case "File":
                this.#uploadFile(uploadUrl);
                break;
        }
    }

    destroy() {
        window.frobj = null;
        super.destroy();
    }

    #recordLocalDownload() {
        if (window.frobj == null) {
            throw new Error("未初始化录音，请先录音，然后停止后再下载");
        }
        let fileName = `recorder-${this.#formatTimestamp(Date.now())}.mp3`;
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = (window.URL || webkitURL).createObjectURL(window.frobj.recBlob);
        a.download = fileName;
        document.body.appendChild(a);
        document.body.removeChild(a);

        if (/mobile/i.test(navigator.userAgent)) {
            alert("因移动端绝大部分国产浏览器未适配Blob Url的下载，所以本demo代码在移动端未调用downA.click()。请尝试点击日志中显示的下载链接下载");
        } else {
            try {
                a.click();
            } catch (e) {
                console.error(e);
            }
        }
        //不用了时需要revokeObjectURL，否则霸占内存
        (window.URL || webkitURL).revokeObjectURL(a.href);
    }

    #uploadBase64(uploadButtonUrl) {
        let reader = new FileReader();
        reader.readAsDataURL(window.frobj.recBlob);
        if (window.frobj == null) {
            throw new Error("未初始化录音");
        }
        $.ajax({
            url: uploadButtonUrl,
            type: 'POST',
            data: {
                mine: window.frobj.recBlob.type,
                upload_file_base64: (/.+;base64\s*,\s*(.+)$/i.exec(reader.result) || [])[1]
            },
            success: function (v) {
                console.log("上传成功", v);
            }
            , error: function (s) {
                console.error("上传失败", s);
            }
        })
    }

    #uploadFile(uploadButtonUrl) {
        let formData = new FormData();
        formData.append('file', window.frobj.recBlob, `recorder_${this.#formatTimestamp(Date.now())}.mp3`);

        if (window.frobj == null) {
            throw new Error("未初始化录音");
        }
        $.ajax({
            url: uploadButtonUrl,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (v) {
                console.log("上传成功", v);
            },
            error: function (s) {
                console.error("上传失败", s);
            }
        })
    }

    #formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    }
}

Forguncy.Plugin.CellTypeHelper.registerCellType("HZGH5Recorder.HZGH5RecorderCellType, HZGH5Recorder", HZGH5RecorderCellType);