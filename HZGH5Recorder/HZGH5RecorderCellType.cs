using GrapeCity.Forguncy.CellTypes;
using GrapeCity.Forguncy.Plugin;
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Windows;

namespace HZGH5Recorder
{
    [Icon("pack://application:,,,/HZGH5Recorder;component/Resources/Icon.png")]
    [Designer(typeof(HZGH5RecorderCellTypeDesigner))]
    [Category("网页录音")]
    public class HZGH5RecorderCellType : CellType
    {
        [OrderWeight(100)]
        [Required]
        [FormulaProperty]
        [DisplayName("播放按钮名称")]
        public object PlayButtonName { get; set; } = "播放";

        [OrderWeight(101)]
        [DisplayName("是否显示播放按钮")]
        [DefaultValue(true)]
        public bool IsVisiblePlaybutton { get; set; } = true;

        [OrderWeight(200)]
        [Required]
        [FormulaProperty]
        [DisplayName("上传按钮名称")]
        public object UploadButtonName { get; set; } = "上传";

        [OrderWeight(201)]
        [DisplayName("是否显示上传按钮")]
        [DefaultValue(true)]
        public bool IsVisibleUploadButton { get; set; } = true;

        [OrderWeight(202)]
        [FormulaProperty]
        [DisplayName("上传录音文件地址")]
        public object UploadUrl { get; set; }

        [OrderWeight(203)]
        [ComboProperty(ValueList = "Base64|File")]
        [DefaultValue("base64")]
        [DisplayName("上传录音文件类型")]
        public string UploadType { get; set; }

        [OrderWeight(300)]
        [Required]
        [FormulaProperty]
        [DisplayName("下载按钮名称")]
        public object DownloadButtonName { get; set; } = "下载";

        [OrderWeight(301)]
        [DisplayName("是否显示下载按钮")]
        [DefaultValue(true)]
        public bool IsVisibleDownloadButton { get; set; } = true;

        [OrderWeight(400)]
        [DisplayName("是否显示录音波形图像")]
        [DefaultValue(false)]
        public bool IsVisibleWaveView { get; set; } = false;

        [OrderWeight(500)]
        [DisplayName("是否启用测试语言识别模式")]
        [Description(
            "此功能仅用于测试功能，不建议在正式环境中使用。对接的是科大讯飞的实时语音识别服务，需要申请APPID、APIKey、APISecret等参数。如果直接使用，有泄露appid、apikey、apisecret等风险。")]
        [DefaultValue(false)]
        public bool IsOpenRealtimeIAT { get; set; } = false;

        [OrderWeight(888)] [FormulaProperty] public object APPID { get; set; }

        [OrderWeight(889)] [FormulaProperty] public object APIKey { get; set; }

        [OrderWeight(890)] [FormulaProperty] public object APISecret { get; set; }

        public override bool GetDesignerPropertyVisible(string propertyName)
        {
            if (propertyName == nameof(APPID) || propertyName == nameof(APIKey) || propertyName == nameof(APISecret))
            {
                return IsOpenRealtimeIAT;
            }

            return base.GetDesignerPropertyVisible(propertyName);
        }

        public override string ToString()
        {
            return "网页录音操作";
        }
    }

    public class HZGH5RecorderCellTypeDesigner : CellTypeDesigner<HZGH5RecorderCellType>
    {
        public override FrameworkElement GetDrawingControl(ICellInfo cellInfo, IDrawingHelper drawingHelper)
        {
            return drawingHelper.GetHeadlessBrowserPreviewControl();
        }
    }
}