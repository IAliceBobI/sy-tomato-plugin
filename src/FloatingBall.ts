import FloatingBallDocBtn from "./FloatingBallDocBtn.svelte"
import FloatingBallKeyboardBtn from "./FloatingBallKeyboardBtn.svelte"
import FloatingBallProtyle from "./FloatingBallProtyle.svelte"
import { DestroyManager } from "./libs/destroyer";
import { events } from "./libs/Events";
import { FloatingBallNotVIPLimit } from "./libs/gconst";
import { shortcut2string } from "./libs/keyboard";
import { floatingballDocList, floatingballEnable, floatingballKeyboardList } from "./libs/stores";
import { lastVerifyResult } from "./libs/user";

export class FloatingBall {
    static readonly DMKey = "TomatoFloatingBtnDMKey";
    private dm: DestroyManager;
    private target: HTMLElement;
    private sv: any;
    private address: string;

    static key(addr: string) {
        return FloatingBall.DMKey + "_" + addr;
    }

    private get key() {
        return FloatingBall.key(this.address);
    }

    static newProgFloatingDm(addr: string) {
        let dm = globalThis[FloatingBall.key(addr)] as DestroyManager
        dm?.destroyBy();
        dm = new DestroyManager()
        globalThis[FloatingBall.key(addr)] = dm;
        return dm;
    }

    constructor(address: string, dm: DestroyManager, svFactory: (target: HTMLElement) => any) {
        this.address = address;
        this.dm = dm
        this.target = document.body.appendChild(document.createElement("div"));
        this.target.setAttribute("floating-ball-key", this.key);
        this.sv = svFactory(this.target);
        this.dm.add("global", () => delete globalThis[FloatingBall.key(address)]);
        this.dm.add("sv", () => this.sv.$destroy());
        this.dm.add("div", () => this.target.parentElement?.removeChild(this.target));
        this.dm.setData("e", this.target);
    }
}

export function loadFloatingBall() {
    if (floatingballEnable.get()) {
        {
            let arr = (floatingballDocList.get() ?? []).filter(item => {
                if (events.isMobile) {
                    return item.enableMobile
                }
                return item.enable
            });
            if (!lastVerifyResult()) {
                arr = arr.slice(0, FloatingBallNotVIPLimit);
            }
            for (const item of arr) {
                getFloatingBallDocBtn(item);
            }
        }
        {
            let arr = (floatingballKeyboardList.get() ?? []).filter(item => {
                if (events.isMobile) {
                    return item.enableMobile
                }
                return item.enable
            });
            if (!lastVerifyResult()) {
                arr = arr.slice(0, FloatingBallNotVIPLimit);
            }
            for (const item of arr) {
                getFloatingBallKeyboardBtn(item);
            }
        }
    }
}

// 悬浮文档
export function getFloatingBallProtyle(id: string) {
    const address = `protyle#${id}`
    return globalThis[FloatingBall.key(address)] as DestroyManager
}

// 悬浮文档
export function newFloatingBallProtyle(id: string) {
    const address = `protyle#${id}`
    const dm = FloatingBall.newProgFloatingDm(address);
    new FloatingBall(address, dm, (target) => {
        return new FloatingBallProtyle({
            target,
            props: {
                dm,
                key: FloatingBall.key(address),
                id,
            }
        })
    });
}

// 悬浮文档的按钮
export function getFloatingBallDocBtn(item: FloatingDocItem): HTMLElement {
    const address = `doc#${item.docName}#${item.openDocType}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm.getData("e") as HTMLElement
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return new FloatingBallDocBtn({
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    item,
                }
            })
        });
        return dm.getData("e") as HTMLElement
    }
}

// 悬浮快捷键的按钮
export function getFloatingBallKeyboardBtn(shortcut: FloatingKeyboardItem): HTMLElement {
    const address = `keyboard#${shortcut2string(shortcut)}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm.getData("e") as HTMLElement
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return new FloatingBallKeyboardBtn({
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    shortcut,
                }
            })
        });
        return dm.getData("e") as HTMLElement
    }
}
