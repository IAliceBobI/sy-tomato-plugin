const nop = () => { }
export class DestroyManager {
    private destroied = false;
    private cbs = new Map<string, Func>();
    private data = new Map<string, any>();
    private showMsg: boolean;
    private prefix: string;
    constructor(showMsg = false, prefix: string = "DestroyManager") {
        this.prefix = prefix;
        this.showMsg = showMsg;
    }
    setData(key: string, value: any) {
        this.data.set(key, value);
    }
    getData<T>(key: string) {
        return this.data.get(key) as T;
    }
    getFn(key: string) {
        const v = this.getData<Func>(key)
        if (v) return v;
        return nop;
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