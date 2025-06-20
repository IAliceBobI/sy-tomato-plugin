import FloatingBallDoc from "./FloatingBallDoc.svelte"
import FloatingBallProtyle from "./FloatingBallProtyle.svelte"
import { DestroyManager } from "./libs/destroyer";
import { floatingballDocList, floatingballEnable } from "./libs/stores";
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

export function getFloatingBallProtyle(id: string) {
    const address = `protyle#${id}`
    return globalThis[FloatingBall.key(address)] as DestroyManager
}

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


export function loadFloatingBall() {
    if (floatingballEnable.get()) {
        let arr = (floatingballDocList.get() ?? []).filter(item => item.enable);
        if (!lastVerifyResult()) {
            arr = arr.slice(0, 2);
        }
        for (const item of arr) {
            if (item.enable) {
                getFloatingBallDoc(item.docName, item.docIcon, item.useDialog);
            }
        }
    }
}

export function getFloatingBallDoc(docName: string, docIcon: string, useDialog: boolean): HTMLElement {
    const address = `doc#${docName}#${docIcon}${useDialog}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm.getData("e") as HTMLElement
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return new FloatingBallDoc({
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    docName,
                    docIcon,
                    useDialog,
                }
            })
        });
        return dm.getData("e") as HTMLElement
    }
}
