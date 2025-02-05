import { randomUUID } from "node:crypto";
import * as util from "util";
import { HASH_PROP_DELIM, HASH_VALUE_DELIM } from "../../../constants";
import { asBool, asDate, asNullableString, asString } from "../../utils/casting";
import { isPresent } from "../../utils/is.nullish";

export class Item<T extends Record<string, any> = Record<string, any>> {
  private _changes: Map<string, any> = new Map();
  private _errs: Map<string, Set<string>> = new Map();
  private _deleted = false;
  private _tempId?: string;

  constructor(
    public data: Readonly<Partial<T>>,
    dirty = false,
  ) {
    if (dirty) {
      this.data = Object.freeze({});
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
    } else {
      Object.freeze(this.data);
    }
  }

  get id() {
    return this.data.__k || this._tempId;
  }

  get slug() {
    return this.data.__n;
  }

  get sheetId() {
    return this.data.__s;
  }

  set(key: string, value: any) {
    if (this.data[key] === value) {
      this._changes.delete(key);
      return;
    }
    this._changes.set(key, value);
    return this;
  }

  flag(key: string) {
    this.set(key, true);
  }

  unflag(key: string) {
    this.set(key, false);
  }

  get(key: string) {
    if (this._changes.has(key)) {
      return this._changes.get(key);
    }
    return this.data[key];
  }

  has(key: string) {
    return isPresent(this.get(key));
  }

  hasAny(...keys: string[]) {
    return keys.some((k) => this.has(k));
  }

  hasAll(...keys: string[]) {
    return keys.every((k) => this.has(k));
  }

  isEmpty(key: string) {
    return !this.has(key);
  }

  keys(options?: { omit?: string[]; pick?: string[] }): string[] {
    const set = new Set<string>(Object.keys(this.data).filter((key) => !key.startsWith("__")));

    for (const key of this._changes.keys()) {
      if (!key.startsWith("__")) {
        set.add(key);
      }
    }
    const res = Array.from(set);

    if (options?.omit) {
      return res.filter((key) => !options.omit.includes(key));
    }
    if (options?.pick) {
      return res.filter((key) => options.pick.includes(key));
    }
    return res;
  }

  keysWithData(props?: { exclude?: Array<string | string[]> }): string[] {
    const keys = this.keys().filter((k) => this.has(k));
    if (props?.exclude) {
      const f = props.exclude.flat();
      return keys.filter((k) => !f.includes(k));
    }
    return keys;
  }

  /**
   * Intersects exactly with another item on the keys
   *
   * @param item
   * @param keys
   */
  intersects(item: Item, keys: string[]) {
    return keys.every((key) => {
      const value1 = this.str(key);
      const value2 = item.str(key);
      return value1 === value2;
    });
  }

  hash(...keys: string[]) {
    return keys
      .map((k) => [k, this.get(k)])
      .map(([k, v]) => `${k}${HASH_VALUE_DELIM}${asString(v)}`)
      .join(HASH_PROP_DELIM);
  }

  isDirty(key?: string): boolean {
    if (key) {
      return this._changes.has(key) || this._errs.get(key)?.size > 0;
    }
    return this._changes.size > 0 || this._errs.size > 0 || this._deleted;
  }

  eachOfKeysPresent(keys: string[], callback: (key: string, value: any) => void) {
    for (const key of keys) {
      if (this.has(key)) {
        callback(key, this.get(key));
      }
    }
  }

  isDeleted(): boolean {
    return this._deleted;
  }

  delete() {
    this._deleted = true;
  }

  str(key: string) {
    return asNullableString(this.get(key));
  }

  defStr(key: string): string {
    return asString(this.get(key));
  }

  bool(key: string) {
    return asBool(this.get(key));
  }

  date(key: string) {
    return asDate(this.get(key));
  }

  pick(...keys: string[]) {
    const obj: Record<string, any> = {};
    for (const key of keys) {
      obj[key] = this.get(key);
    }
    return obj;
  }

  err(key: string, msg: string) {
    if (!this._errs.has(key)) {
      this._errs.set(key, new Set([msg]));
    }
    this._errs.get(key).add(msg);
    return this;
  }

  values() {
    return Object.fromEntries(this.entries());
  }

  entries() {
    return this.keys().map((key) => [key, this.get(key)]);
  }

  merge(item: Item, props: { overwrite?: boolean } = {}) {
    for (const key of item.keys()) {
      if (props.overwrite) {
        this.set(key, item.get(key));
      } else if (!this.has(key)) {
        this.set(key, item.get(key));
      }
    }
    return this;
  }

  hasConflict(b: Item, keys?: string[]) {
    if (keys) {
      return keys.some((key) => {
        const aValue = this.get(key);
        const bValue = b.get(key);
        return aValue && bValue && aValue !== bValue;
      });
    }
    return this.entries().some(([key, aValue]) => {
      const bValue = b.get(key);
      return aValue && bValue && aValue !== bValue;
    });
  }

  toJSON() {
    return { ...this.data, ...this.changeset() };
  }

  [util.inspect.custom]() {
    return `${this._deleted ? "❌ " : ""}${this.slug || this.sheetId}(${this.id ?? "new"}) ${JSON.stringify(this.values(), null, "  ")}`;
  }

  copy(props?: { mixin?: Item; select?: string[]; slug?: string; sheetId?: string }) {
    const newObj = new Item({});
    newObj._tempId = `TEMP_${randomUUID()}`;
    if (props.slug) {
      newObj.set("__n", props.slug);
    }
    if (props.sheetId) {
      newObj.set("__s", props.sheetId);
    }
    if (props.select) {
      for (const key of props.select) {
        newObj.set(key, props.mixin?.get(key) ?? this.get(key));
      }
    } else {
      for (const key in this.data) {
        if (!key.startsWith("__")) {
          newObj.set(key, this.get(key));
        }
      }
      if (props.mixin) {
        for (const key in props.mixin.data) {
          if (!key.startsWith("__")) {
            newObj.set(key, props.mixin.get(key));
          }
        }
      }
    }
    return newObj;
  }

  commit() {
    // reset the data object with new changes and unset all pending changes
    const newObj: Record<string, any> = Object.assign({}, this.data);
    for (const [key, value] of this._changes) {
      newObj[key] = value;
    }
    this._changes.clear();
    if (this._errs.size) {
      newObj.__i = [];
      for (const [key, errs] of this._errs) {
        for (const err of errs) {
          newObj.__i.push({ x: key, m: err });
        }
      }
    }
    this._errs.clear();
    this.data = Object.freeze(newObj) as any;
  }

  changeset() {
    const val = Object.fromEntries(this._changes);
    val.__k = this.get("__k");
    val.__s = this.get("__s");
    val.__n = this.get("__n");
    if (this._deleted) {
      val.__d = true;
    }
    if (this._errs.size) {
      if (!val.__i) {
        val.__i = [];
      }
      for (const [key, errs] of this._errs) {
        for (const err of errs) {
          val.__i.push({ x: key, m: err });
        }
      }
    }
    return val;
  }
}
