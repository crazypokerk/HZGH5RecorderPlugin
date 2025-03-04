/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />
class HZGH5RecorderCommand extends Forguncy.Plugin.CommandBase {
    execute() {
        // 获取属性值，注意，这里的MyProperty应该与 HZGH5RecorderCommand.cs 文件定义的属性名一致
        let operation = this.CommandParam.Operation;
        let outParameterCode = this.CommandParam.OutParameterCode;
        let outParameterName = this.CommandParam.OutParameterName;

        let recordOutputType = this.CommandParam.RecordOutputType;
        let sampleRate = this.CommandParam.SampleRate;
        let bitRate = this.CommandParam.BitRate;

        // const STORAGE_KEY = 'ForguncyRecorderInstance';
        // let forguncyRecorderJson = localStorage.getItem(STORAGE_KEY);
        // let frobj;
        if (!window.frobj) {
            let frobj = new ForguncyRecorder(recordOutputType, sampleRate, bitRate);
            window.frobj = frobj;
        }
        frobj.OperationRecorder(operation);
        console.log(`operation down -- ${operation}`);

        // if (!forguncyRecorderJson) {
        //     frobj = new ForguncyRecorder(recordOutputType, sampleRate, bitRate);
        //     localStorage.setItem(STORAGE_KEY, JSON.stringify(frobj));
        // } else {
        //     frobj = JSON.parse(localStorage.getItem(STORAGE_KEY));
        // }
        // console.log(typeof frobj);
        // frobj = new ForguncyRecorder(
        //     frobj.recordOutputType,
        //     frobj.sampleRate,
        //     frobj.bitRate
        // );
        //
        // frobj.OperationRecorder(operation);
        // console.log(`operation down -- ${operation}`);
    }
}

Forguncy.Plugin.CommandFactory.registerCommand("HZGH5Recorder.HZGH5RecorderCommand, HZGH5Recorder", HZGH5RecorderCommand);