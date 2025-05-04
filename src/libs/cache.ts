export class MaxCache<T> {
    private cache: Map<string, { obj: T, timestamp: number }> = new Map();
    private _maxSize: number;
    private deleteCB?: (t: T) => void;
    public get maxSize(): number {
        return this._maxSize;
    }
    public set maxSize(value: number) {
        this._maxSize = value;
    }
    constructor(maxSize: number, deleteCB?: (t: T) => void) {
        this.maxSize = maxSize;
        this.deleteCB = deleteCB;
    }
    public entries() {
        return this.cache.entries();
    }
    /**
     *  add `obj` to cache, drop the old one without return it.
     * @param key 
     * @param obj 
     * @returns return the new value NOT the old one
     */
    public add(key: string, obj: T): T {
        if (obj == null) return obj;
        if (this.cache.size > this.maxSize) {
            [...this.cache.entries()].sort((e1, e2) => {
                return e1[1].timestamp - e2[1].timestamp;
            }).slice(0, this.cache.size / 2).forEach(e => {
                if (this.deleteCB) this.deleteCB(e[1].obj);
                this.cache.delete(e[0]);
            });
        }

        const e = this.get(key);
        if (e != null)
            if (this.deleteCB) this.deleteCB(e);
        this.cache.set(key, { obj: obj, timestamp: new Date().getTime() });
        return obj;
    }
    /**
     * get or save
     * @param key 
     * @param defaultValue 
     * @returns 
     */
    public get(key: string, defaultValue?: T): T {
        const v = this.cache.get(key);
        if (v == null) {
            return this.add(key, defaultValue);
        }
        return v.obj;
    }
    /**
     * get or save
     * @param key 
     * @param createValue 
     * @returns 
     */
    public getOrElse(key: string, createValue: () => T): T {
        const v = this.cache.get(key);
        if (v == null) {
            return this.add(key, createValue());
        }
        return v.obj;
    }
    public delete(key: string) {
        const e = this.get(key);
        if (e == null) return;
        if (this.deleteCB) this.deleteCB(e);
        return this.cache.delete(key);
    }
}

type DelCB = (k: string, o: any) => void;

export class WeakCache<T extends WeakKey> {
    private cache: Map<string, WeakRef<T>>;
    private registry: FinalizationRegistry<string>;
    private delCB?: DelCB;
    constructor(delCB?: DelCB) {
        this.delCB = delCB;
        this.cache = new Map();
        this.registry = new FinalizationRegistry<string>((key: string) => {
            const value = this.cache.get(key);
            if (value != null) {
                const o = value.deref();
                this.delete(key, o);
            }
        });
    }
    set(key: string, o: T) {
        if (o == null) return;
        this.cache.set(key, new WeakRef(o));
        this.registry.register(o, key);
    }
    get(key: string, miss?: T): T {
        const value = this.cache.get(key);
        if (value != null) {
            const o = value.deref();
            if (o != null) return o;
            this.delete(key, null);
        }
        this.set(key, miss);
        return miss;
    }
    size() {
        return this.cache.size;
    }
    toKVList() {
        return [...this.entries()];
    }
    entries() {
        return this.cache.entries();
    }
    delete(key: string, v: T) {
        if (this.cache.delete(key)) {
            if (this.delCB) this.delCB(key, v);
        }
    }
    purge() {
        for (const [k, v] of this.entries()) {
            if (v?.deref() == null) this.delete(k, null);
        }
    }
    clear() {
        for (const [k, v] of this.entries()) {
            this.delete(k, v?.deref());
        }
    }
}

/// Example usage
/// const myMap = new DefaultMap<string, number>(0); // Default value is 0
export class DefaultMap<K, V> extends Map<K, V> {
    private dv: V | (() => V);

    constructor(dv: V | (() => V), entries?: readonly (readonly [K, V])[] | null) {
        super(entries);
        this.dv = dv;
    }

    get(key: K): V {
        return this.savingGet(key, this.dv);
    }

    protected savingGet(key: K, defaultValue: V | (() => V)): V {
        const v = super.get(key);
        if (v == null) {
            let newValue: V;
            if (typeof defaultValue === 'function') {
                newValue = (defaultValue as () => V)();
            } else {
                newValue = defaultValue;
            }
            this.set(key, newValue);
            return newValue;
        } else {
            return v;
        }
    }
}