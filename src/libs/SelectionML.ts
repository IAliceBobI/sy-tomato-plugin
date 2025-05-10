import { events } from "./Events";
import { getAttribute } from "./utils";

export class SelectionML {
    private selected: HTMLElement[] = [];
    private topElement: HTMLElement;
    private bottomElement: HTMLElement;

    constructor(s: Awaited<ReturnType<typeof events.selectedDivs>>) {
        this.selected = s.selected;
        this.topElement = this.selected.at(0);
        this.bottomElement = this.selected.at(-1);
    }

    private unSelect(d: Element) {
        d.querySelectorAll(".protyle-wysiwyg--select").forEach((e) =>
            e.classList.remove("protyle-wysiwyg--select"),
        );
    }

    private scrollIntoView(d: Element) {
        d.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }

    private selectDivUp(d: Element) {
        const id = getAttribute(d, "data-node-id");
        if (id) {
            this.scrollIntoView(d);
            this.topElement = d as HTMLElement;
            this.topElement.classList.add("protyle-wysiwyg--select");
            return true;
        }
    }

    selectUp() {
        this.topElement.classList.add("protyle-wysiwyg--select");
        if (!this.selectDivUp(this.topElement.previousElementSibling)) {
            if (this.selectDivUp(this.topElement.parentElement)) {
                this.bottomElement = this.topElement;
                this.unSelect(this.topElement.parentElement);
                this.topElement.classList.add("protyle-wysiwyg--select");
            }
        }
    }

    private selectDivDown(d: Element) {
        const id = getAttribute(d, "data-node-id");
        if (id) {
            this.scrollIntoView(d);
            this.bottomElement = d as HTMLElement;
            this.bottomElement.classList.add("protyle-wysiwyg--select");
            return true;
        }
    }

    selectDown() {
        this.bottomElement.classList.add("protyle-wysiwyg--select");
        if (!this.selectDivDown(this.bottomElement.nextElementSibling)) {
            if (this.selectDivDown(this.bottomElement.parentElement)) {
                this.topElement = this.bottomElement;
                this.unSelect(this.bottomElement.parentElement);
                this.bottomElement.classList.add("protyle-wysiwyg--select");
            }
        }
    }
}