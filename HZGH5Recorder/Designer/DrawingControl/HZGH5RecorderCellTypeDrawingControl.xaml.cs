using GrapeCity.Forguncy.CellTypes;
using System.Windows.Controls;

namespace HZGH5Recorder.Designer.DrawingControl
{
    public partial class HZGH5RecorderCellTypeDrawingControl : UserControl
    {
        public HZGH5RecorderCellTypeDrawingControl(HZGH5RecorderCellType cellType, ICellInfo cellInfo,
            IDrawingHelper drawingHelper)
        {
            this.DataContext = new HZGH5RecorderCellTypeDrawingControlViewModel(cellType, cellInfo, drawingHelper);

            InitializeComponent();
        }

        public class HZGH5RecorderCellTypeDrawingControlViewModel
        {
            HZGH5RecorderCellType _cellType;
            ICellInfo _cellInfo;
            IDrawingHelper _drawingHelper;

            public HZGH5RecorderCellTypeDrawingControlViewModel(HZGH5RecorderCellType cellType, ICellInfo cellInfo,
                IDrawingHelper drawingHelper)
            {
                _cellType = cellType;
                _cellInfo = cellInfo;
                _drawingHelper = drawingHelper;
            }

            public string Text
            {
                get => _cellType.ToString();
            }
        }
    }
}