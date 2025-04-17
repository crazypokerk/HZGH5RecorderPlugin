/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />
class HZGH5RecorderCommand extends Forguncy.Plugin.CommandBase {
    async execute() {
        // 获取属性值，注意，这里的MyProperty应该与 HZGH5RecorderCommand.cs 文件定义的属性名一致
        let operation = this.CommandParam.Operation;
        let recordOutputType = this.CommandParam.RecordOutputType;
        let sampleRate = this.CommandParam.SampleRate;
        let bitRate = this.CommandParam.BitRate;

        if (!window.frobj) {
            let isVisibleWaveView = localStorage.getItem("isVisibleWaveView") != null;
            let frobj = new ForguncyRecorder(recordOutputType, sampleRate, bitRate, isVisibleWaveView, 1280);
            window.frobj = frobj;
        }
        let returnInfoObject = await frobj.OperationRecorder(operation);
        Forguncy.CommandHelper.setVariableValue(this.CommandParam.OutParameterCode, returnInfoObject.operationReturnCode);
        Forguncy.CommandHelper.setVariableValue(this.CommandParam.OutParameterInfo, returnInfoObject.operationReturnMsg);
        Forguncy.CommandHelper.setVariableValue(this.CommandParam.SaveDataInIndexedDBKeyID, returnInfoObject.saveDataInIndexedDBKeyID);
    }
}

Forguncy.Plugin.CommandFactory.registerCommand("HZGH5Recorder.HZGH5RecorderCommand, HZGH5Recorder", HZGH5RecorderCommand);