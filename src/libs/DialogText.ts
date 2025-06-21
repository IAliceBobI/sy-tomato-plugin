import DialogTextSv from "./DialogTextSv.svelte";
import { Dialog } from "siyuan";
import { DestroyManager } from "./destroyer";
import { events } from "./Events";
import { newID } from "stonev5-utils/lib/id";

export class DialogTextArea {
    private title: string;
    private defaultValue: string;

    constructor(title: string, defaultValue: string, callback: (s: string) => Promise<void>) {
        this.title = title;
        this.defaultValue = defaultValue;
        this.open(callback);
    }

    private open(callback: Func) {
        const id = newID();
        const dm = new DestroyManager();

        const dialog = new Dialog({
            title: this.title,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : null,
            height: events.isMobile ? null : null,
            destroyCallback() {
                dm.destroyBy("dialog");
            },
        });
        dm.add("dialog", () => dialog.destroy());

        const svelte = new DialogTextSv({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                callback,
                defaultValue: this.defaultValue,
                alwaysConfirm: true,
                useTextArea: true,
            }
        });
        dm.add("svelte", () => svelte.$destroy());
    }
}

export class DialogText {
    private title: string;
    private defaultValue: string;
    private description: string;
    private alwaysConfirm: boolean;

    constructor(title: string, defaultValue: string, callback: Func, alwaysConfirm = false, description = "") {
        this.alwaysConfirm = alwaysConfirm;
        this.title = title;
        this.defaultValue = defaultValue;
        this.description = description;
        this.open(callback);
    }

    private open(callback: Func) {
        const id = newID();
        const dm = new DestroyManager();

        const dialog = new Dialog({
            title: this.title,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : null,
            height: events.isMobile ? null : null,
            destroyCallback() {
                dm.destroyBy("dialog");
            },
        });
        dm.add("dialog", () => dialog.destroy());

        const svelte = new DialogTextSv({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                callback,
                defaultValue: this.defaultValue,
                alwaysConfirm: this.alwaysConfirm,
                description: this.description,
            }
        });
        dm.add("svelte", () => svelte.$destroy());
    }
}

export function dialog2floating(dialog: Dialog, _position: { x: string, y: string }) {
    const b3Dialog = dialog?.element?.querySelector(".b3-dialog") as HTMLElement
    if (b3Dialog) {
        b3Dialog.style.width = "auto"
        b3Dialog.style.height = "auto"
        // b3Dialog.style.left = "10px"
        // b3Dialog.style.top = (document.body.clientHeight / 2 - b3Dialog.clientHeight / 2) + "px"
        // b3Dialog.style.pointerEvents = "none";

        const scrim = b3Dialog.querySelector(".b3-dialog__scrim") as HTMLElement
        scrim?.parentElement?.removeChild(scrim);

        // const container = b3Dialog.querySelector(".b3-dialog__container") as HTMLElement
        // if (container) container.style.pointerEvents = "initial";
    }
}
