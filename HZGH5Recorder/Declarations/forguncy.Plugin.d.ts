/// <reference path="./forguncy.d.ts" />

/**
 */
declare namespace Forguncy.Plugin {
    /**
     * 单元格的水平对齐方式。
     */
    enum CellHorizontalAlignment {
        /**
         * 左对齐。
         */
        Left = 0,
        /**
         * 居中对齐。
         */
        Center = 1,
        /**
         * 右对齐。
         */
        Right = 2,
        /**
         * 默认对齐方式。
         */
        General = 3,
    }

    /**
     * 单元格的垂直对齐方式
     */
    enum CellVerticalAlignment {
        /**
         * 顶部对齐
         */
        Top = 0,
        /**
         * 居中对齐
         */
        Center = 1,
        /**
         * 底部对齐
         */
        Bottom = 2,
    }

    /**
     * 单元格在设计器中设置的样式数据。
     */
    interface StyleMetaData {
        /**
         * 单元格的字体。
         */
        FontFamily?: string;
        /**
         * 单元格的字体大小。
         */
        FontSize?: number;
        /**
         * 单元格的字体粗细，值为`Bold`或`Normal`。
         */
        FontWeight?: string;
        /**
         * 单元格的字体风格，值为`Italic`或`Normal`。
         */
        FontStyle?: string;
        /**
         * 单元格是否显示下划线。
         */
        Underline?: boolean;
        /**
         * 单元格是否显示删除线。
         */
        Strikethrough?: boolean;
        /**
         * 单元格的背景颜色。
         */
        Background?: string;
        /**
         * 单元格的字体颜色。
         */
        Foreground?: string;
        /**
         * 单元格的水平对齐方式。
         */
        HorizontalAlignment?: CellHorizontalAlignment;
        /**
         * 单元格的垂直对齐方式。
         */
        VerticalAlignment?: CellVerticalAlignment;

        /**
         * 单元格是否设置折行。
         */
        WordWrap?: boolean;

        /**
         * 单元格格式字符串。
         */
        Formatter?: string;
    }

    /**
     * 表示在设计器中设计的单元格 UI 元素。
     */
    interface CellContentElement {
        /**
         * C# 单元格类型的属性。
         */
        CellType?: object;
        /**
         * 设计器中设置的单元格的样式信息。
         */
        StyleInfo: StyleMetaData;
        /**
         * 单元格的快速样式模板。
         */
        StyleTemplate?: CellTypeStyleTemplate;
        /**
         * 设计时元素的宽度。
         */
        Width?: number;
        /**
         * 设计时元素的高度。
         */
        Height?: number;
    }

    /**
     * 单元格类型的默认值。
     */
    interface ICellTypeDefaultValue {
        /**
         * 默认值。
         */
        Value: any;
    }

    /**
     * 表示单元格的样式模板。
     */
    interface CellTypeStyleTemplate {
        /**
         * 样式的唯一键。
         */
        Key: string;
        /**
         * 样式的目录分类。
         */
        Category: string;
        /**
         * the scope of the style fashion, 0 is General(Default), 1 is old fashion, only JP and EN, 2 is new fashion, only CN and KR*/
        StyleTemplateFashionScope?: string;
        /**
         * 所有子样式。
         */
        Styles: { [key: string]: TemplatePartStyle };
    }

    /**
     * 单元格样式模板的子样式。
     */
    interface TemplatePartStyle {
        /**
         * 单元格状态改变时的动画周期。
         */
        Transition?: string;
        /**
         * 普通状态时的样式。
         */
        NormalStyle?: PartStyleUnit,
        /**
         * 鼠标在单元格上方时的样式。
         */
        HoverStyle?: PartStyleUnit,
        /**
         * 单元格获得焦点时的样式。
         */
        FocusStyle?: PartStyleUnit,
        /**
         * 单元格激活时的样式。比如按下按钮时。
         */
        ActiveStyle?: PartStyleUnit,
        /**
         * 单元格禁用时的样式。
         */
        DisableStyle?: PartStyleUnit,
        /**
         * 单元格选中时的样式。比如选中菜单类型单元格的某个子菜单。
         */
        SelectedStyle?: PartStyleUnit,
    }

    /**
     * 样式模板子样式的具体属性。
     */
    interface PartStyleUnit {
        /**
         * 字体颜色。
         */
        FontColor?: string;
        /**
         * 背景色。
         */
        Background?: string;
        /**
         * 边框 CSS 样式。它的优先级低于位置更具体的边框 CSS 字符串。
         */
        BorderString?: string;
        /**
         * 边框圆角 CSS 样式。
         */
        BorderRadiusString?: string;
        /**
         * 阴影 CSS 样式。
         */
        BoxShadowString?: string;
        /**
         * 上边框 CSS 样式。
         */
        BorderTopString?: string;
        /**
         * 右边框 CSS 样式。
         */
        BorderRightString?: string;
        /**
         * 下边框 CSS 样式。
         */
        BorderBottomString?: string;
        /**
         * 左边框 CSS 样式。
         */
        BorderLeftString?: string;
        /**
         * 水平对齐的 CSS 样式。
         */
        CellHorizontalAlignment?: string;
        /**
         * 垂直对齐的 CSS 样式。
         */
        CellVerticalAligment?: string;
        /**
         * 左内边距的 CSS 样式。
         */
        PaddingLeft?: number;
        /**
         * 右内边距的 CSS 样式。
         */
        PaddingRight?: number;
        /**
         * 上内边距的 CSS 样式。
         */
        PaddingTop?: number;
        /**
         * 下内边距的 CSS 样式。
         */
        PaddingBottom?: number;
        /**
         * 左外边距的 CSS 样式。
         */
        MarginLeft?: number;
        /**
         * 右外边距的 CSS 样式。
         */
        MarginRight?: number;
        /**
         * 上外边距的 CSS 样式。
         */
        MarginTop?: number;
        /**
         * 下外边距的 CSS 样式。
         */
        MarginBottom?: number;
    }

    /**
     * 单元格类型基类。通过插件实现的单元格类型需要从这个类继承。
     */
    class CellTypeBase {
        /**
         * 单元格的唯一键。
         */
        ID: string;
        /**
         * 在设计器中设置的单元格数据。
         */
        CellElement: CellContentElement;
        /**
         * 指定单元格是否在母版页中。
         */
        IsInMasterPage: boolean;

        /**
         * 获取插件的多语言资源
         * @param key
         * 资源名称
         * @param args
         * 占位符的值
         */
        getPluginResource(key: string, ...args: string[]): string;

        /**
         * 获取应用资源
         * @param key
         * 资源名称
         * @param args
         * 占位符的值
         */
        getApplicationResource(key: string, ...args: string[]): string;

        constructor(...params: any[]);

        /**
         * 创建该单元格类型的元素。需要在子类实现。
         * @returns
         * jQuery，包含单元格类型元素的容器。
         */
        createContent(): JQuery;

        /**
         * 获取该单元类型的默认值。页面加载后，单元格会显示默认值。如果默认值不是在设计器中设置的单元格值，则实现此方法。
         * @returns
         * 默认值
         */
        getDefaultValue(): ICellTypeDefaultValue;

        /**
         * 执行一组命令。当需要在子类中执行命令时调用此方法。
         * @param commands
         * 一组命令的信息。
         * @param context
         * 可选参数。命令执行的上下文信息。
         */
        executeCommand(commands: object[], context?: CommandContext): void;

        /**
         * 附加一个处理函数在依赖的单元格的值发生变化时进行处理。如果c#类实现了IDependenceCells接口，则在子类中通过该方法附加一个处理函数。
         * @param valueChangedCallback
         * 当依赖单元值发生变化时，每次执行的函数。
         */
        onDependenceCellValueChanged(valueChangedCallback: Function): void;

        /**
         * 当数据源引用的单元格值发生变更。每次执行的函数。
         */
        onBindingDataSourceDependenceCellValueChanged(bindingDataSourceModel: any, callback: Function): void;

        /**
         * 获取该单元类型是否具有焦点。需要在子类实现。
         */
        hasFocus(): boolean;

        /**
         * 设置焦点到该单元格类型。需要在子类实现。
         */
        setFocus(): void;

        /**
         * 获取单元格类型元素的容器。
         */
        getContainer(): JQuery;

        /**
         * 设置该单元类型的值。如果单元格的值发生更改，该单元格需要做出改动，则实现此方法。
         * @param value
         * 赋予给单元格的值。
         */
        setValueToElement(jelement: JQuery, value: any): void;

        /**
         * 获取该单元类型的值。如果此单元格类型更改单元格的值，则实现此方法。
         * @returns
         * 单元格的值。
         */
        protected getValueFromElement(): any;

        /**
         * 提交该单元格类型的值。当单元格类型的值由UI改变时，调用此方法来提交值。
         */
        commitValue(): void;

        /**
         * 数据校验。
         */
        validate(): void;

        /**
         * 获取该单元类型是否禁用。
         */
        isDisabled(): boolean;

        /**
         * 禁用这个单元格类型。如果此单元类型支持禁用状态，则实现此方法。
         */
        disable(): void;

        /**
         * 启用这个单元格类型。如果此单元类型支持禁用状态，则实现此方法。
         */
        enable(): void;

        /**
         * 获取该单元类型是否只读。
         */
        isReadOnly(): boolean;

        /**
         * 设置单元格类型的只读状态。如果该单元格类型支持只读模式，则实现此方法
         * @param value
         * 是否只读？
         */
        setReadOnly(value: boolean): void;

        /**
         * 为该单元格类型设置字体样式。如果该单元格类型显示单元格的字体设置，则实现此方法。
         * @param styleInfo
         * 新的字体样式
         */
        setFontStyle(styleInfo: StyleMetaData): void;

        /**
         * 设置单元格的背景色。
         * @param value
         * 新的背景色
         */
        setBackColor(color: string): void;

        /**
         * 获取单元格的tab键顺序。
         * @returns
         * Tab键顺序值。
         */
        getElementTabIndex(): number;

        /**
         * 设置单元格的tab键顺序。在基类中，会给单元格类型里的button，input，a和textarea元素设置tabindex，如果插件中需要给其他类型的元素设置tabindex，则需要重写该方法。
         * @param tabIndex
         * Tab键顺序值。
         */
        protected setTabIndexToElement(tabIndex: number): void;

        /**
         * 如果这个单元格需要在所有单元格创建完成并添加到页面之后做一些事情，则实现此方法。
         */
        onLoad(): void;

        /**
         * 如果这个单元格需要在所有单元格创建完成并添加到页面之后做一些事情，则实现此方法。
         */
        onPageLoaded(info: CellTypeInfo): void;

        /**
         * 销毁这个单元格类型。如果这个单元格在页面跳转时需要做一些事情，则实现此方法。
         */
        destroy(): void;

        /**
         * 判断单元格是否已经被销毁。
         */
        get hasDestroyed(): boolean;

        /**
         * 重新加载此单元格类型的数据。如果该单元格类型使用表或视图的数据，则实现此方法。当表的数据可能发生更改时，将触发此方法。
         */
        reload(): void;

        /**
         * 如果单元格绑定的数据源发生变化，可以通过重写此方法重新加载数据
         * @param tableName 变更的表名</en>
         */
        public onBindingTableChanged(tableName: string): void;

        /**
         * 隐藏数据校验的Tooltip。
         */
        hideValidateTooltip(): void;

        /**
         * 计算公式的值。
         * @param formula
         * 公式。
         * @returns
         * 计算结果。
         */
        evaluateFormula(formula: any): any;

        /**
         * 在公式引用的单元格值发生变更时，重新计算公式的值。
         * @param formula 公式
         * @param callback 公式结果回调
         * @param calcImmediately 是否立即计算，并调用回调函数，默认为true
         */
        onFormulaResultChanged(formula: any, callback: (value: any) => void, calcImmediately?: boolean): any;

        /**
         * Internal use
         */
        setContextVariableValue(variableName: string, value: any): void;

        /**
         * Internal use
         */
        clearContextVariableValue(variableName: string): void;

        /**
         * 获取用于公式计算的数据上下文。
         */
        getFormulaCalcContext(): FormulaCalcContext;

        /**
         * 获取单元格的可见或可用权限信息。
         * @param scope
         * 单元格权限类型，如可用性权限。
         */
        protected getUIPermission(scope: UIPermissionScope): UIPermission;

        /**
         * 检查当前用户对于单元是否有可见或可用权限。
         * @param scope
         * 单元格权限类型，如可用性权限。
         * @returns
         * 如果当前用户有权限返回True，否则返回False。
         */
        protected checkAuthority(scope: UIPermissionScope): boolean;

        /**
         * 检查当前用户是否在有权限的角色列表中。
         * @param allowRoles
         * 有权限的角色列表。
         * @returns
         * 如果当前用户有权限返回True，否则返回False。
         */
        protected checkRoleAuthority(allowRoles: string[]): boolean;

        /**
         * 执行自定义命令对象列表。
         * @param command
         * 命令。
         * @param initParam
         * 上下文参数值。
         * @param eventType
         * 事件类型（可选，用于区分不同命令）。
         * @param callbackOnCommandCompleted
         * 命令执行完成时回调函数（可选）。
         */
        executeCustomCommandObject(command: ICustomCommandObject, initParam: {
            [paramName: string]: any
        }, eventType?: string, callbackOnCommandCompleted?: Function)

        /**
         * 获取数据库数据。
         * @param bindingDataSourceModel
         * 数据源查询模型，从设计器的BindingDataSourceProperty生成。
         * @param options
         * 查询配置。
         * @param callback
         * 查询结果回调
         * @param reloadWhenDependenceChanged
         * 当依赖的单元格发生变化时，callback会被再次调用
         */
        getBindingDataSourceValue(bindingDataSourceModel: any, options: queryDataOption, callback: (data: any) => void, reloadWhenDependenceChanged?: boolean): void;

        /**
         * 是否是设计时预览
         */
        isDesignerPreview: boolean;

        /**
         * 设计时预览自定义参数
         */
        designerPreviewCustomArgs: unknown[];

        /**
         * 在设计时预览里面显示错误信息
         */
        showDesignerPreviewError: (message: string) => void;

        /**
         * 宽度是否是自适应模式
         */
        isAutoFitWidth: () => boolean;

        /**
         * 高度是否是自适应模式
         */
        isAutoFitHeight: () => boolean;
    }

    interface CellTypeInfo {
        value: any;
        isReadOnly: boolean;
        isDisabled: boolean;
        styleData: StyleMetaData;
    }

    /**
     * 自定义命令对象。
     */
    interface ICustomCommandObject {
        /**
         * 命令列表。
         */
        Commands: any[];
        /**
         * 上下文参数名配置。
         */
        ParamProperties: { [name: string]: string };

        /**
         * 自定义列。
         */
        CustomColumns: string[]
    }

    /**
     * 数据查询配置。
     */
    interface queryDataOption {
        /**
         * 最大查询结果行数。
         */
        top: number,
        /**
         * 查询条件。
         */
        queryConditions: queryCondition[],
        /**
         * 查询条件关系。
         */
        relationType?: relationType,
        /**
         * 是否去掉重复项。
         */
        distinct?: boolean
    }

    /**
     * 条件关系。
     */
    const enum relationType {
        /**
         * 与关系。
         */
        And,
        /**
         * 或关系。
         */
        Or
    }

    /**
     * 查询条件。
     */
    interface queryCondition {
        /**
         * 列名。
         */
        columnName: string;
        /**
         * 比较类型。
         */
        compareType: compareType;
        /**
         * 比较值。
         */
        compareValue: any;
    }

    /**
     * 比较类型。
     */
    const enum compareType {
        /**
         * 等于。
         */
        EqualsTo,
        /**
         * 不等于。
         */
        NotEqualsTo,
        /**
         * 大于。
         */
        GreaterThan,
        /**
         * 大等于。
         */
        GreaterThanOrEqualsTo,
        /**
         * 小于。
         */
        LessThan,
        /**
         * 小于等于。
         */
        LessThanOrEqualsTo,
        /**
         * 以指定字符串开头。
         */
        BeginsWith,
        /**
         * 不以指定字符串开头。
         */
        NotBeginWith,
        /**
         * 以指定字符串结尾。
         */
        EndsWith,
        /**
         * 不以指定字符串结尾。
         */
        NotEndWith,
        /**
         * 包含指定字符串。
         */
        Contains,
        /**
         * 不包含指定字符串。
         */
        NotContains,
        /**
         * 在里边。
         */
        In,
        /**
         * 不在里边。
         */
        NotIn
    }

    /**
     * 单元格的权限信息。
     */
    interface UIPermission {
        /**
         * 单元格的名字或位置。如果单元格有名字，使用名字作为单元格权限的名字，否则使用单元格的位置信息作为名字，如"A1"。
         */
        Name: string;
        /**
         * 单元格的类型。使用单元格类型作为分类依据，如"按钮"，"文本框"等。
         */
        Category?: string;
        /**
         * 单元格的权限类型。
         */
        Scope: UIPermissionScope;
        /**
         * 是否启用单元格权限设置。
         */
        Enabled: boolean;
        /**
         * 有单元格权限的角色列表。
         */
        AllowRoles: string[];
        /**
         * 单元格中所有子项的的单元格权限信息。
         */
        Children?: SubUIPermission[];
    }

    /**
     * 单元格中子项的权限信息，例如菜单各子项的权限信息。
     */
    interface SubUIPermission {
        /**
         * 可以唯一标时单元格子项的名称。
         */
        Name: string;
        /**
         * 有单元格权限的角色列表。
         */
        AllowRoles: string[];
        /**
         * 单元格子项的子项的单元格权限信息。
         */
        Children?: SubUIPermission[];
    }

    /**
     * 单元格的权限类型。
     */
    const enum UIPermissionScope {
        /**
         * 无。
         */
        None = 0,
        /**
         * 可见性权限。
         */
        Visible = 1,
        /**
         * 可用性权限。
         */
        Enable = 2,
        /**
         * 可编辑权限。
         */
        Editable = 4,
        /**
         * 可见性、可用性和可编辑权限。
         */
        All = 7
    }

    /**
     * 提供注册单元格类型函数的帮助类。
     */
    class CellTypeHelper {
        /**
         * 注册一个单元格类型，将`javascript`单元格类型类与`C#`单元格类型类关联起来。
         * @param identifier
         * 单元格类型的唯一标识符。标识符格式为: `Namespace.ClassName, AssemblyName`，是 C# 单元格类型类的`Namespace`，`ClassName`以及`AssemblyName`。
         * @param celltype
         * 单元格类型的构造函数。
         * @example
         * ```javascript
         * Forguncy.CellTypeHelper.registerCellType("Namespace.ClassName, AssemblyName", customCellType);
         * // 图片轮转插件需要注册如下：
         * Forguncy.CellTypeHelper.registerCellType("CarouselCellType.Carousel, CarouselCellType", CarouselCellType);
         * ```
         */
        static registerCellType(identifier: string, celltype: Function): void;
    }

    /**
     * 命令执行的上下文信息。
     */
    export interface CommandContext {
        initParams?: { [name: string]: any };
    }

    /**
     * 命令类型基类。通过插件实现的命令类型需要从这个类继承。
     */
    class CommandBase {
        constructor();

        /**
         * C# 命令类属性的数据。
         */
        CommandParam: object;

        /**
         * 获取插件的多语言资源
         * @param key
         * 资源名称
         * @param args
         * 占位符的值
         */
        getPluginResource(key: string, ...args: string[]): string;

        /**
         * 获取应用资源
         * @param key
         * 资源名称
         * @param args
         * 占位符的值
         */
        getApplicationResource(key: string, ...args: string[]): string;

        /**
         * 执行这个命令。需要在子类实现。
         */
        execute(): void | Promise<void>;

        /**
         * 将一个公式转换成单元格位置信息。
         * @param formula
         * Excel 公式，比如`=A1`。
         * @returns
         * 返回单元格的位置，如果公式不是指向单元格，比如`=SUM(1,2)`，返回 null。
         */
        protected getCellLocation(formula: string): CellLocationInfo;

        /**
         * 计算公式。
         * @param formula
         * 公式。
         * @returns
         * 计算结果。
         */
        evaluateFormula(formula: string): any;

        /**
         * 获取用于公式计算的数据上下文。
         */
        getFormulaCalcContext(): FormulaCalcContext;

        /**
         * 写日志。
         * @param logText
         * 日志内容。
         */
        public log(logText: string): void;

        /**
         * 执行自定义命令对象列表。
         * @param command
         * 命令。
         * @param initParam
         * 上下文参数值。
         * @param eventType
         * 事件类型（可选，用于区分不同命令）。
         * @param callbackOnCommandCompleted
         * 命令执行完成时回调函数（可选）。
         */
        executeCustomCommandObject(command: ICustomCommandObject, initParam: {
            [paramName: string]: any
        }, eventType?: string, callbackOnCommandCompleted?: Function);

        /**
         * 获取数据库数据。
         * @param bindingDataSourceModel
         * 数据源查询模型，从设计器的BindingDataSourceProperty生成。
         * @param options
         * 查询配置。
         * @param callback
         * 查询结果回调
         * @returns Promise&lt;any&gt;
         */
        getBindingDataSourceValue(bindingDataSourceModel: any, options: queryDataOption): Promise<any>;


        /**
         * 命令执行器
         */
        CommandExecutor: CommandExecutor;
        /**
         * 运行时页面唯一标识
         */
        runTimePageName: string;
    }

    /**
     * 命令执行器
     */
    interface CommandExecutor {
        /**
         * 执行命令
         * @param commands
         * 命令列表。
         * @param options
         * 执行选项。
         */
        executeCommand(commands: object[], options: CommandExecuteOptions);
    }

    /**
     * 命令执行选项
     */
    interface CommandExecuteOptions {
        /**
         * 运行时页面唯一标识
         */
        runTimePageName: string;
        /**
         * 命令ID，可以是任意字符串
         */
        commandID: string;
        /**
         * 命令类型，可以是任意字符串，如果未Click则相同ID的命令同一时间只执行一个
         */
        eventType: string;
        /**
         * 命令初始参数
         */
        initParams?: any;
        /**
         * 命令执行完成后回调函数
         */
        callbackOnCommandCompleted?: Function;
        /**
         * 定位字符串，用于日志显示
         */
        locationString?: string;
    }

    /**
     * 提供注册自定义命令类型函数的帮助类。
     */
    class CommandFactory {
        /**
         * 注册一个命令，将`javascript`命令类与`C#`命令类关联起来。
         * @param commandType
         * 命令的唯一标识符。标识符格式为: `Namespace.ClassName, AssemblyName`，使用 C# 命令类的`Namespace`，`ClassName`以及`AssemblyName`。
         * @param command
         * 命令的构造器。
         * @example
         * ```javascript
         * Forguncy.CommandFactory.RegisterCommand("Namespace.ClassName, AssemblyName", customCommand);
         * // 表格数据传递命令插件需要注册如下：
         * Forguncy.CommandFactory.registerCommand("PassListviewDataCommand.PassListviewDataCommand, PassListviewDataCommand", PassListviewDataCommand);
         * ```
         */
        static registerCommand(commandType: string, command: any): void;
    }

    /**
     * 提供获取多语言资源方法的帮助类。
     */
    class LocalizationResourceHelper {
        /**
         * 获取插件多语言资源
         * @param pluginGuid
         * 插件的GUID。
         */
        static getPluginResource(pluginGuid: string): { [name: string]: any };

        /**
         * 获取公共资源。
         */
        static getApplicationResource(): { [name: string]: any };
    }
}

declare namespace Forguncy {
    interface Cell {
        /**
         * 获取单元格上的单元格类型。
         */
        getCellType(): Forguncy.Plugin.CellTypeBase;
    }
}