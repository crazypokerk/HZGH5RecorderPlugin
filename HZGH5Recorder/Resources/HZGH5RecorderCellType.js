/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />

class HZGH5RecorderCellType extends Forguncy.Plugin.CellTypeBase {
    createContent() {
        // 获取MyProperty属性值，注意，这里的MyProperty应该与 HZGH5RecorderCellType.cs 文件定义的属性名一致
        const playButtonName = this.evaluateFormula(this.CellElement.CellType.PlayButtonName);
        const isVisiblePlaybutton = this.CellElement.CellType.IsVisiblePlaybutton;
        const downloadButtonName = this.evaluateFormula(this.CellElement.CellType.DownloadButtonName);
        const isVisibleDownloadButton = this.CellElement.CellType.IsVisibleDownloadButton;
        // 构建 Jquery Dom 并返回
        var $container = $('<div>', {
            'class': 'recorder_btn_container',
            css: {
                display: 'flex'
            }
        });

        // 创建播放按钮，并赋予相应的class和文本
        let $playButton = $('<button>', {
            'class': 'recorder_play_btn',
            text: playButtonName,
        });

        // 创建下载按钮，并赋予相应的class和文本
        let $downloadButton = $('<button>', {
            'class': 'recorder_download_btn',
            text: downloadButtonName,
        });

        if (!isVisiblePlaybutton) {
            $playButton.css("display", "none");
        }
        if (!isVisibleDownloadButton) {
            $downloadButton.css("display", "none");
        }

        $container.append($playButton, $downloadButton);
        return $container;
    }
}

Forguncy.Plugin.CellTypeHelper.registerCellType("HZGH5Recorder.HZGH5RecorderCellType, HZGH5Recorder", HZGH5RecorderCellType);