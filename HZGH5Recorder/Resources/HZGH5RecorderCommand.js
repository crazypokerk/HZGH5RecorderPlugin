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

        if (!window.frobj) {
            let isVisibleWaveView = localStorage.getItem("isVisibleWaveView") != null;
            let frobj = new ForguncyRecorder(recordOutputType, sampleRate, bitRate, isVisibleWaveView, 1280);
            window.frobj = frobj;
        }
        let saveDataInIndexedDBKeyID = frobj.OperationRecorder(operation);
        // Forguncy.CommandHelper.setVariableValue(this.CommandParam.SaveDataInIndexedDBKeyID, saveDataInIndexedDBKeyID);
    }
}

Forguncy.Plugin.CommandFactory.registerCommand("HZGH5Recorder.HZGH5RecorderCommand, HZGH5Recorder", HZGH5RecorderCommand);