export class DestroyManager {
    private destroied = false;
    private cbs = new Map<string, Func>();
    private actions: Func[] = [];
    private showMsg: boolean;
    private prefix: string;
    constructor(showMsg = false, prefix: string = "DestroyManager") {
        this.prefix = prefix;
        this.showMsg = showMsg;
    }
    action(cb: Func) {
        this.actions.push(cb);
    }
    run() {
        this.actions.forEach(i => i());
    }
    add(name: string, cb: Func) {
        this.cbs.set(name.trim(), cb);
    }
    destroyBy(name: string = null) {
        if (!this.destroied) {
            this.destroied = true;
            const lst = [...this.cbs.entries()];
            if (name == null) {
                lst.forEach(([k, v]) => {
                    if (this.showMsg) console.info(`[${this.prefix}] DESTROY [${k}] BY NONE`);
                    v();
                });
            } else {
                name = name.trim();
                lst.filter(([k]) => k !== name).forEach(([k, v]) => {
                    if (this.showMsg) console.info(`[${this.prefix}] DESTROY [${k}] BY [${name}]`);
                    v();
                });
            }
        }
    }
}