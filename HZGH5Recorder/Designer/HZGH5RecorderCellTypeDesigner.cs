using HZGH5Recorder.Designer.DrawingControl;
using GrapeCity.Forguncy.CellTypes;
using System.Windows;

namespace HZGH5Recorder.Designer
{
    public class HZGH5RecorderCellTypeDesigner : CellTypeDesigner<HZGH5RecorderCellType>
    {
        public override FrameworkElement GetDrawingControl(ICellInfo cellInfo, IDrawingHelper drawingHelper)
        {
            return new HZGH5RecorderCellTypeDrawingControl(this.CellType, cellInfo, drawingHelper);
        }
    }
}