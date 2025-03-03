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
        [Required]
        [FormulaProperty]
        [DisplayName("播放按钮名称")]
        public object PlayButtonName { get; set; } = "播放";

        [DisplayName("是否显示播放按钮")] public bool IsVisiblePlaybutton { get; set; } = true;

        [Required]
        [FormulaProperty]
        [DisplayName("下载按钮名称")]
        public object DownloadButtonName { get; set; } = "上传";

        [DisplayName("是否显示下载按钮")] public bool IsVisibleDownloadButton { get; set; } = true;

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