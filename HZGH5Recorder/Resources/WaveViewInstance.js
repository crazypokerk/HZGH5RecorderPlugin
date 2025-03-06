class WaveViewInstance {
    constructor(waveWidth, waveHeight) {
        let waveConfigs = {
            elem: ".recorder_wave_view",
            width: waveWidth,
            height: waveHeight,
            scale: 2,
            speed: 8,
            phase: 21.8,
            fps: 20,
            keep: true,
            lineWidth: 3,
            linear1: [0, "rgba(150,96,238,1)", 0.2, "rgba(170,79,249,1)", 1, "rgba(53,199,253,1)"] //线条渐变色1，从左到右
            , linear2: [0, "rgba(209,130,255,0.6)", 1, "rgba(53,199,255,0.6)"] //线条渐变色2，从左到右
            , linearBg: [0, "rgba(255,255,255,0.2)", 1, "rgba(54,197,252,0.2)"] //背景渐变色，从上到下
        }
        return Recorder.WaveView(waveConfigs);
    }
}