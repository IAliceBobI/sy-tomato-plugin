import { events } from "./Events";
import { PROTYLE_WYSIWYG_SELECT } from "./gconst";
import { getAttribute } from "./utils";

export class SelectionML {
    private selected: HTMLElement[] = [];
    private topElement: HTMLElement;
    private bottomElement: HTMLElement;
    private firstElement: HTMLElement;
    private trace: string[] = [];

    constructor(s: Awaited<ReturnType<typeof events.selectedDivs>>) {
        this.selected = s.selected;
        this.firstElement = this.selected.at(0);
        this.topElement = this.selected.at(0);
        this.bottomElement = this.selected.at(-1);
    }

    private traceElement(e: Element) {
        e.classList.add(PROTYLE_WYSIWYG_SELECT);
        const id: string = getAttribute(e, "data-node-id");
        if (!this.trace.includes(id)) this.trace.push(id);
    }

    private untraceElement(e: Element) {
        const id: string = getAttribute(e, "data-node-id");
        const idx = this.trace.findIndex(i => i == id)
        if (idx >= 0) {
            this.trace.splice(idx, 1)
        }
    }

    private unselect(d: Element) {
        d.querySelectorAll("." + PROTYLE_WYSIWYG_SELECT).forEach((e) => {
            e.classList.remove(PROTYLE_WYSIWYG_SELECT);
            this.untraceElement(e);
        });
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
            this.traceElement(this.topElement)
            return true;
        }
    }

    selectUp() {
        if (this.trace.length == 0) this.traceElement(this.topElement)
        if (!this.selectDivUp(this.topElement.previousElementSibling)) {
            if (this.selectDivUp(this.topElement.parentElement)) {
                this.bottomElement = this.topElement;
                this.unselect(this.topElement.parentElement);
                this.traceElement(this.topElement)
            }
        }
    }

    private selectDivDown(d: Element) {
        const id = getAttribute(d, "data-node-id");
        if (id) {
            this.scrollIntoView(d);
            this.bottomElement = d as HTMLElement;
            this.traceElement(this.bottomElement)
            return true;
        }
    }

    selectDown() {
        if (this.trace.length == 0) this.traceElement(this.bottomElement)
        if (!this.selectDivDown(this.bottomElement.nextElementSibling)) {
            if (this.selectDivDown(this.bottomElement.parentElement)) {
                this.topElement = this.bottomElement;
                this.unselect(this.bottomElement.parentElement);
                this.traceElement(this.bottomElement)
            }
        }
    }

    cancelLast() {
        const id = this.trace.pop();
        if (id) {
            const e = document.querySelector(`div[data-node-id="${id}"]`)
            if (e) {
                this.scrollIntoView(e);
                e.classList.remove(PROTYLE_WYSIWYG_SELECT)
            }
        }

        if (this.trace.length == 0) {
            this.topElement = this.firstElement
            this.bottomElement = this.firstElement
            this.scrollIntoView(this.firstElement);
            this.traceElement(this.firstElement);
        }
    }
}
