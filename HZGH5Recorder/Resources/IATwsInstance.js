class IATwsInstance {
    APPID;
    API_KEY;
    API_SECRET;
    iatWS;
    countdownInterval;
    resultText = "";
    resultTextTemp = "";
    #iatWSStatus;

    constructor(APPID, API_KEY, API_SECRET) {
        this.APPID = APPID;
        this.API_KEY = API_KEY;
        this.API_SECRET = API_SECRET;
    }

    checkStatus() {
        return this.#iatWSStatus;
    }

    getWebSocketUrl() {
        // 请求地址根据语种不同变化
        let url = "wss://iat-api.xfyun.cn/v2/iat";
        let host = "iat-api.xfyun.cn";
        let apiKey = this.API_KEY;
        let apiSecret = this.API_SECRET;
        let date = new Date().toGMTString();
        let algorithm = "hmac-sha256";
        let headers = "host date request-line";
        let signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
        let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        let signature = CryptoJS.enc.Base64.stringify(signatureSha);
        let authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        let authorization = btoa(authorizationOrigin);
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
        return url;
    }

    // 录音开始计时
    #countdown() {
        let seconds = 60;
        this.countdownInterval = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    clearCountdown() {
        clearInterval(this.countdownInterval);
    }

    // 更新ws连接状态
    changeStatus(status) {
        this.#iatWSStatus = status;
        if (status === "CONNECTING") {
            this.resultText = "";
            this.resultTextTemp = "";
            console.log("------WebSocket正在连接------")
        } else if (status === "OPEN") {
            this.#countdown();
            console.log("------WebSocket连接成功------")
        } else if (status === "CLOSING") {
            console.log("------WebSocket正在关闭------")
        } else if (status === "CLOSED") {
            console.log("------WebSocket连接已关闭------")
        }
    }

    // 创建webSocket连接
    connectWebSocket() {
        let websocketUrl = this.getWebSocketUrl();

        if ("WebSocket" in window) {
            try {
                this.iatWS = new WebSocket(websocketUrl);
            } catch (e) {
                throw new Error(`WebSocket连接错误: ${e}`);
            }
        } else if ("MozWebSocket" in window) {
            this.iatWS = new MozWebSocket(websocketUrl);
        } else {
            throw new Error("当前浏览器不支持WebSocket");
        }
        this.changeStatus("OPEN");
        this.iatWS.onopen = (e) => {
            let params = {
                common: {
                    app_id: this.APPID,
                },
                business: {
                    language: "zh_cn",
                    domain: "iat",
                    accent: "mandarin",
                    vad_eos: 5000,
                    dwa: "wpgs",
                },
                data: {
                    status: 0,
                    format: "audio/L16;rate=16000",
                    encoding: "raw",
                },
            };
            this.iatWS.send(JSON.stringify(params));
        }
        this.iatWS.onmessage = (e) => {
            this.changeStatus("OPEN");
            this.renderResult(e.data);
        };
        this.iatWS.onerror = (e) => {
            this.changeStatus("CLOSED");
            throw new Error(`WebSocket连接错误: ${e}`);
        };
        this.iatWS.onclose = (e) => {
            this.changeStatus("CLOSED");
        };
    }

    renderResult(resultData) {
        // 识别结束
        let jsonData = JSON.parse(resultData);
        if (jsonData.data && jsonData.data.result) {
            let data = jsonData.data.result;
            let str = "";
            let ws = data.ws;
            for (let i = 0; i < ws.length; i++) {
                str = str + ws[i].cw[0].w;
            }
            // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
            // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
            if (data.pgs) {
                if (data.pgs === "apd") {
                    // 将resultTextTemp同步给resultText
                    this.resultText = this.resultTextTemp;
                }
                // 将结果存储在resultTextTemp中
                this.resultTextTemp = this.resultText + str;
                let textarea = document.querySelector('.ai_input input');
                textarea.value = this.resultTextTemp;
                console.warn(`resultTextTemp------${this.resultTextTemp}`)
            } else {
                this.resultText = this.resultText + str;
                console.warn(`resultText------${this.resultText}`)
            }
        }
        if (jsonData.code === 0 && jsonData.data.status === 2) {
            this.iatWS.close();
        }
        if (jsonData.code !== 0) {
            this.iatWS.close();
            console.error(jsonData);
        }
    }
}