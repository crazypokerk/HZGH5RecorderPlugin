using GrapeCity.Forguncy.Commands;
using GrapeCity.Forguncy.Plugin;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace HZGH5Recorder
{
    [Icon("pack://application:,,,/HZGH5Recorder;component/Resources/Icon.png")]
    [Description("[请求录音]命令必须在[开始录音]命令前调用使用\r\n用于获取用户是否允许调用浏览器麦克风的权限")]
    [Category("网页录音")]
    public class HZGH5RecorderCommand : Command
    {
        [OrderWeight(888)]
        [ResultToProperty]
        [DisplayName("命令执行结果返回码保存至变量")]
        [Description("正常执行返回0，执行错误返回1")]
        public string OutParameterCode { get; set; }

        [OrderWeight(999)]
        [ResultToProperty]
        [DisplayName("命令执行结果信息保存至变量")]
        public string OutParameterInfo { get; set; }

        [OrderWeight(1000)]
        [ResultToProperty]
        [DisplayName("保存至浏览器数据库数据key")]
        public string SaveDataInIndexedDBKeyID { get; set; }

        [OrderWeight(1)] [DisplayName("操作")] public SupportedOperations Operation { get; set; }

        [OrderWeight(2)]
        [ComboProperty(ValueList = "mp3|wav")]
        [DisplayName("录音格式")]
        public string RecordOutputType { get; set; }

        [OrderWeight(3)]
        [IntProperty(Min = 1, Max = 99999)]
        [DisplayName("采样率(hz)")]
        public int SampleRate { get; set; }

        [OrderWeight(4)]
        [IntProperty(Min = 1, Max = 999)]
        [DisplayName("比特率(kbps)")]
        public int BitRate { get; set; }


        public override string ToString()
        {
            return GetOperationDescription(Operation);
        }

        private string GetOperationDescription(SupportedOperations operation)
        {
            var fieldInfo = operation.GetType().GetField(operation.ToString());

            var attribute = fieldInfo.GetCustomAttributes(typeof(DescriptionAttribute), false)
                .Cast<DescriptionAttribute>()
                .FirstOrDefault();

            return attribute?.Description ?? operation switch
            {
                SupportedOperations.Open => "录音操作",
                _ => operation.ToString() // 默认情况下，直接返回枚举值的名字
            };
        }

        public override bool GetDesignerPropertyVisible(string propertyName, CommandScope commandScope)
        {
            var openVisibleProperties = new HashSet<string> { "RecordOutputType", "SampleRate", "BitRate" };
            var stopVisibleProperties = new HashSet<string> { "SaveDataInIndexedDBKeyID" };

            if (this.Operation == SupportedOperations.Open && openVisibleProperties.Contains(propertyName))
            {
                return true;
            }

            if (this.Operation == SupportedOperations.Stop && stopVisibleProperties.Contains(propertyName))
            {
                return true;
            }

            return !openVisibleProperties.Contains(propertyName) && !stopVisibleProperties.Contains(propertyName) &&
                   // 默认行为，调用基类的方法
                   base.GetDesignerPropertyVisible(propertyName, commandScope);
        }

        public enum SupportedOperations
        {
            [Description("请求录音[open]")] Open,
            [Description("关闭录音[close]")] Close,
            [Description("开始录音[start]")] Start,
            [Description("暂停录音[pause]")] Pause,
            [Description("恢复录音[resume]")] Resume,
            [Description("结束录音[stop]")] Stop
        }
    }
}