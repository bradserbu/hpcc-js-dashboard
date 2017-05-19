import "es6-promise/auto";  // polyfill Promise on IE

import { scopedLogger } from "@hpcc-js/comms";
import { HTML as HTMLMarshaller, HTMLWidget, JSONEditor, SVGWidget } from "@hpcc-js/viz";
import { CommandRegistry } from "@phosphor/commands";
import { Message } from "@phosphor/messaging";
import { BoxPanel, CommandPalette, ContextMenu, DockPanel, Menu, MenuBar, Widget } from "@phosphor/widgets";

import "../style/index.css";

const logger = scopedLogger("frame.ts");

const commands = new CommandRegistry();

class VizWidget<T extends HTMLWidget | SVGWidget> extends Widget {
    _viz: T;
    get viz() { return this._viz; }

    constructor(name: string, VizWidget: { new (): T; }) {
        super();
        // this.setFlag(Widget.Flag.DisallowLayout);
        this.addClass("content");
        // this.addClass(name.toLowerCase());
        this.title.label = name;
        this.title.closable = false;
        this.title.caption = `Long description for: ${name}`;

        this._viz = new VizWidget()
            .target(this.node)
            ;
    }

    get inputNode(): HTMLInputElement {
        return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
    }

    protected onActivateRequest(msg: Message): void {
        if (this.isAttached) {
            this.inputNode.focus();
        }
    }
    protected onResize(msg: Widget.ResizeMessage): void {
        if (msg.width < 0 || msg.height < 0) {
            // this._colChart.refresh();
        } else {
            this._viz
                .size({ width: msg.width - 16, height: msg.height - 16 })
                .lazyRender()
                ;
        }
    }
}

export class Frame {
    constructor() {
    }

    createCommands() {
        commands.addCommand("example:close", {
            label: "Close",
            mnemonic: 0,
            iconClass: "fa fa-close",
            execute: () => {
                logger.debug("Close");
            },
        });

        commands.addCommand("example:cut", {
            label: "Cut",
            mnemonic: 1,
            iconClass: "fa fa-cut",
            execute: () => {
                logger.debug("Cut");
            },
        });

        commands.addCommand("example:copy", {
            label: "Copy",
            mnemonic: 0,
            iconClass: "fa fa-copy",
            execute: () => {
                logger.debug("Copy");
            },
        });

        commands.addCommand("example:paste", {
            label: "Paste",
            mnemonic: 0,
            iconClass: "fa fa-paste",
            execute: () => {
                logger.debug("Paste");
            },
        });

        commands.addCommand("example:about", {
            label: "About",
            mnemonic: 0,
            execute: () => {
                logger.debug("About");
            },
        });

        /*        
                commands.addKeyBinding({
                    keys: ["Accel X"],
                    selector: "body",
                    command: "example:cut",
                });
        
                commands.addKeyBinding({
                    keys: ["Accel C"],
                    selector: "body",
                    command: "example:copy",
                });
        
                commands.addKeyBinding({
                    keys: ["Accel V"],
                    selector: "body",
                    command: "example:paste",
                });
        */
    }

    createFileMenu(): Menu {
        const root = new Menu({ commands });
        root.addItem({ type: "separator" });
        root.addItem({ command: "example:close" });

        return root;
    }

    createEditMenu(): Menu {
        const root = new Menu({ commands });
        root.addItem({ command: "example:copy" });
        root.addItem({ command: "example:cut" });
        root.addItem({ command: "example:paste" });
        root.addItem({ type: "separator" });
        return root;
    }

    createHelpMenu(): Menu {
        const root = new Menu({ commands });
        root.addItem({ type: "separator" });
        root.addItem({ command: "example:about" });

        return root;
    }

    createMenu(): MenuBar {
        const fileMenu = this.createFileMenu();
        fileMenu.title.label = "File";
        fileMenu.title.mnemonic = 0;

        const editMenu = this.createEditMenu();
        editMenu.title.label = "Edit";
        editMenu.title.mnemonic = 0;

        const helpMenu = this.createHelpMenu();
        helpMenu.title.label = "Help";
        helpMenu.title.mnemonic = 0;

        const bar = new MenuBar();
        bar.addMenu(fileMenu);
        bar.addMenu(editMenu);
        bar.addMenu(helpMenu);
        bar.id = "menuBar";

        const contextMenu = new ContextMenu({ commands });

        document.addEventListener("contextmenu", (event: MouseEvent) => {
            if (contextMenu.open(event)) {
                event.preventDefault();
            }
        });

        contextMenu.addItem({ command: "example:cut", selector: ".content" });
        contextMenu.addItem({ command: "example:copy", selector: ".content" });
        contextMenu.addItem({ command: "example:paste", selector: ".content" });

        return bar;
    }

    main(): void {
        this.createCommands();
        const bar = this.createMenu();

        const palette = new CommandPalette({ commands });
        palette.addItem({ command: "example:cut", category: "Edit" });
        palette.addItem({ command: "example:copy", category: "Edit" });
        palette.addItem({ command: "example:paste", category: "Edit" });
        palette.id = "palette";

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            commands.processKeydownEvent(event);
        });

        const dashboard = new VizWidget("Dashboard", HTMLMarshaller);
        const datasources = new VizWidget("Datasources", JSONEditor);
        const views = new VizWidget("Views", JSONEditor);
        const ddl = new VizWidget("DDL", JSONEditor);
        ddl.viz.json([{ "visualizations": [{ "id": "DocumentTypes", "source": { "output": "View_DocumentTypes", "mappings": { "x": ["document_type_code"], "y": ["Base_COUNT"] }, "id": "Ins4244_dsOutput", "sort": ["-Base_COUNT"], "first": "50" }, "type": "LINE", "fields": [{ "id": "Base_COUNT", "properties": { "type": "integer" } }, { "id": "document_type_code", "properties": { "type": "string" } }, { "id": "-Base_COUNT", "properties": { "type": "integer" } }], "title": "Document Types", "events": { "click": { "mappings": { "document_type_code": "document_type_code" }, "updates": [{ "visualization": "DocumentTypeTrend", "instance": "Ins4244", "datasource": "Ins4244_dsOutput", "merge": true }] } }, "properties": { "charttype": "AM_COLUMN", "legendPosition": "right" } }, { "id": "DocumentTypeTrend", "source": { "output": "View_DocumentTypeTrend", "mappings": { "x": ["RecordingDateYear"], "y": ["Base_COUNT"] }, "id": "Ins4244_dsOutput", "sort": ["RecordingDateYear"] }, "type": "LINE", "fields": [{ "id": "Base_COUNT", "properties": { "type": "integer" } }, { "id": "RecordingDateYear", "properties": { "type": "integer2" } }], "title": "Document Type Trend", "properties": { "charttype": "AM_LINE" } }], "datasources": [{ "filter": ["document_type_code"], "outputs": [{ "from": "Ins4244_dsOutput_View_DocumentTypes", "id": "View_DocumentTypes", "notify": ["DocumentTypes"] }, { "filter": ["document_type_code"], "from": "Ins4244_dsOutput_View_DocumentTypeTrend", "id": "View_DocumentTypeTrend", "notify": ["DocumentTypeTrend"] }], "databomb": true, "id": "Ins4244_dsOutput" }], "id": "Ins4244_propertystats2dashboard", "label": "propertystats2dashboard", "title": "propertystats2dashboard" }]);
        (dashboard.viz as any).ddlUrl(ddl.viz.text());

        const dock = new DockPanel();
        dock.addWidget(dashboard);
        dock.addWidget(datasources, { mode: "split-right" });
        dock.addWidget(views, { ref: datasources });
        dock.addWidget(ddl, { ref: views });
        dock.id = "dock";

        const savedLayouts: DockPanel.ILayoutConfig[] = [];

        commands.addCommand("save-dock-layout", {
            label: "Save Layout",
            caption: "Save the current dock layout",
            execute: () => {
                savedLayouts.push(dock.saveLayout());
                palette.addItem({
                    command: "restore-dock-layout",
                    category: "Dock Layout",
                    args: { index: savedLayouts.length - 1 },
                });
            },
        });

        commands.addCommand("restore-dock-layout", {
            label: (args) => {
                return `Restore Layout ${args.index as number}`;
            },
            execute: (args) => {
                dock.restoreLayout(savedLayouts[args.index as number]);
            },
        });

        palette.addItem({
            command: "save-dock-layout",
            category: "Dock Layout",
            rank: 0,
        });

        BoxPanel.setStretch(dock, 1);

        const main = new BoxPanel({ direction: "left-to-right", spacing: 0 });
        main.id = "main";
        // main.addWidget(palette);
        main.addWidget(dock);

        window.onresize = () => { main.update(); };

        Widget.attach(bar, document.body);
        Widget.attach(main, document.body);
    }
}
