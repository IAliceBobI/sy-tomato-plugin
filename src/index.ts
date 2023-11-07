import {
    Plugin,
    showMessage,
    confirm,
    getFrontend,
} from "siyuan";
import "./index.scss";

const STORAGE_NAME = "menu-config";

export default class PluginSample extends Plugin {

    onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        this.addIcons(``);

        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="Remove plugin-sample Data">
    <svg>
        <use xlink:href="#iconTrashcan"></use>
    </svg>
</div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            confirm("⚠️", this.i18n.confirmRemove.replace("${name}", this.name), () => {
                this.removeData(STORAGE_NAME).then(() => {
                    this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
                    showMessage(`[${this.name}]: ${this.i18n.removedData}`);
                });
            });
        });

        this.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });

        this.addCommand({
            langKey: "getTab",
            hotkey: "⇧⌘M",
            globalCallback: () => {
                console.log(this.getOpenedTab());
            },
        });
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
    }

    onunload() {
    }

}
