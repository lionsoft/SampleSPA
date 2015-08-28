'use strict';
/* 
    http://www.odata.org/documentation/odata-version-2-0/uri-conventions/
    http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part2-url-conventions/odata-v4.0-errata01-os-part2-url-conventions-complete.html
    http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html
*/
module App.Services {
    
    /**
     * Список операторов ODATA
     */
    export interface IODataOperators {
        query: string;
        not(): IODataOperators;
        eq<T>(value: T): IODataLogical;
        ne<T>(value: T): IODataLogical;
        gt<T>(value: T): IODataLogical;
        ge<T>(value: T): IODataLogical;
        lt<T>(value: T): IODataLogical;
        le<T>(value: T): IODataLogical;
    }

    /**
     * Список операторов ODATA
     */
    export interface IODataTypedOperators<T> extends IODataOperators {
        not(): IODataTypedOperators<T>;
        eq(value: T): IODataLogical;
        ne(value: T): IODataLogical;
        gt(value: T): IODataLogical;
        ge(value: T): IODataLogical;
        lt(value: T): IODataLogical;
        le(value: T): IODataLogical;
    }

    /**
     * Список логических операций ODATA
     */
    export interface IODataLogical {
        query: string;
        and(propName?: string): IODataFilterCreator;
        or(propName?: string): IODataFilterCreator;
        or(expr: IODataFunctions | IODataLogical): IODataLogical;
    }

    /**
     * Список функций ODATA
     */
    export interface IODataFunctions extends IODataOperators {

        //#region - Arithmetic Operators -
/*
        add(value: number): IODataTypedOperators<number>;
        sub(value: number): IODataTypedOperators<number>;
        mul(value: number): IODataTypedOperators<number>;
        div(value: number): IODataTypedOperators<number>;
        mod(value: number): IODataTypedOperators<number>;
*/
        //#endregion

        //#region - String Functions -
        contains(value: string): IODataLogical;
        substringof(value: string): IODataLogical;
        startswith(value: string): IODataLogical;
        endswith(value: string): IODataLogical;

        length(): IODataTypedOperators<number>;
        indexof(value: string): IODataTypedOperators<number>;
        substring(pos: number, length?: number): IODataTypedOperators<string>;
        trim(): IODataTypedOperators<string>;

/*
        replace(find: string, replace: string): IODataTypedOperators<string>;
        tolower(): IODataTypedOperators<string>;
        toupper(): IODataTypedOperators<string>;
        concat(value: string): IODataTypedOperators<string>;
*/
        //#endregion

        //#region - Date Functions -
        year(): IODataTypedOperators<number>;
        month(): IODataTypedOperators<number>;
        day(): IODataTypedOperators<number>;
        hour(): IODataTypedOperators<number>;
        minute(): IODataTypedOperators<number>;
        second(): IODataTypedOperators<number>;
/*
        fractionalseconds(): IODataTypedOperators<number>;
*/

/*
        date(): IODataTypedOperators<Date>;
        time(): IODataTypedOperators<Date>;
        totaloffsetminutes(): IODataTypedOperators<number>;
        totalseconds(): IODataTypedOperators<number>;
*/
/*
        now(): IODataTypedOperators<Date>;
        maxdatetime(): IODataTypedOperators<Date>;
        mindatetime(): IODataTypedOperators<Date>;
*/
        //#endregion

        //#region - Math Functions -
/*
        round(): IODataTypedOperators<number>;    //?
        floor(): IODataTypedOperators<number>;    //?
        ceiling(): IODataTypedOperators<number>;  //?
*/
        //#endregion

    }

    /**
     * Генератор выражения фильтра ODATA
     */
    export interface IODataFilterCreator extends IODataFunctions {
    }


    export class ODataFilterCreator implements IODataFilterCreator, IODataLogical {

        constructor(protected propName: string, protected parent?: ODataFilterCreator) {
            if (this.propName)
                this.propName = this.propName.trim().replace(/\./g, '/');
            if (parent)
                parent.child = this;
        }

        static create(propName: string) {
            return new ODataFilterCreator(propName);
        }

        protected _<T>(value: T | T[]): string | string[] {
            if (value === undefined) return undefined;
            if (Array.isArray(value)) {
                let res = [];
                for (var arg of <T[]>value) {
                    res.push(this._(arg));
                }
                return res;
            } else {
                if (value === null) return "null";
                let res = value.toString();
                if (typeof (<any>value) === "string") {
                    res = res.replace(/'/g, "''");
                    res = `'${res}'`;
                }
                else if (typeof value === "object" && (value instanceof Date || value['_isAMomentObject'])) {
                    res = moment(res).format('YYYY-MM-DD[T]HH:mm:ss');
                    return `DateTime'${res}'`;
                }
                // ToDo: somehow support enum values
                return res;
            }
        }

        protected child: ODataFilterCreator;
        protected get lastChild(): ODataFilterCreator {
            var res = this;
            while (res.child) {
                res = res.child;
            }
            return res;
        }

        protected getPropName() {
            var res = this;
            while (res && !res.propName) {
                res = res.parent;
            }
            return res ? res.propName : undefined;
        }

        /**
         * Flag that current block is a function. Otherwise it's an operation.
         */
        protected isFn: boolean;

        /**
         * Flag that current block is negated.
         */
        protected isNot: boolean;

        /**
         * The function or operator name of the current block.
         */
        protected opName: string;

        /**
         * Value of the current operation or arguments of the current function.
         */
        protected args: string[] | string;

        protected getQuery(): string {
            var res = undefined;
            var propName = this.propName;
            if (this.parent) {
                if (this.parent.opName !== "and" && this.parent.opName !== "or" && this.parent.opName !== "or(") {
                    propName = `${this.parent.getQuery() }` || propName;
                }
            }

            if (this.isNot)
                propName = `not ${propName}`;

            if (propName) {
                if ((!this.parent || this.parent.opName !== "or(") && this.opName && this.args) {
                    if (this.isFn) {
                        var args = (<string[]>(this.args)).join(',');
                        if (this.opName === "contains")
                            res = `substringof(${args},${propName})`;
                        else
                            res = args ? `${this.opName}(${propName},${args})` : `${this.opName}(${propName})`;
                    } else {
                        res = `${propName} ${this.opName} ${this.args}`;
                    }
                } else {
                    res = propName;
                }
            }
            if (this.parent) {
                if (this.parent.opName === "and" || this.parent.opName === "or")
                    res = `${this.parent.getQuery() } ${this.parent.opName} ${res}`;
                else if (this.parent.opName === "or(")
                    res = `${this.propName} or (${this.parent.args.toString()})`;
            }

            return res;
        }

        get query(): string {
            return this.lastChild.getQuery();
        }

        toString() {
            return this.query;
        }

        /**
         * Creates an arithmetic operation
         * @param op operation name
         * @param value operand value
         */
        private aop(op: string, value: number): IODataTypedOperators<number> {
            this.args = this._(value);
            this.opName = op;
            return new ODataFilterCreator(undefined, this);
        }

        /**
         * Creates an logical operation
         * @param op operation name
         * @param value operand value
         */
        private lop<T>(op: string, value: T): IODataLogical {
            this.args = this._(value);
            this.opName = op;
            return new ODataFilterCreator(undefined, this);
        }

        /**
         * Creates the function expression
         * @param fn function name
         * @param args function arguments
         */
        private fn<T>(fn: string, ...args): IODataTypedOperators<T> {
            this.args = this._(args);
            this.opName = fn;
            this.isFn = true;
            return new ODataFilterCreator(undefined, this);
        }

        //#region - Arithmetic Operators -

        add(value: number): IODataTypedOperators<number> { return this.aop("add", value); }

        sub(value: number): IODataTypedOperators<number> { return this.aop("sub", value); }

        mul(value: number): IODataTypedOperators<number> { return this.aop("mul", value); }

        div(value: number): IODataTypedOperators<number> { return this.aop("div", value); }

        mod(value: number): IODataTypedOperators<number> { return this.aop("mod", value); }

        //#endregion

        //#region - String Functions -

        contains(value: string): IODataLogical { return this.fn<boolean>("contains", value).eq(true); }

        substringof(value: string): IODataLogical { return this.fn<boolean>("substringof", value).eq(true); }

        startswith(value: string): IODataLogical { return this.fn<boolean>("startswith", value).eq(true); }

        endswith(value: string): IODataLogical { return this.fn<boolean>("endswith", value).eq(true); }

        length(): IODataTypedOperators<number> { return this.fn<number>("length"); }

        indexof(value: string): IODataTypedOperators<number> { return this.fn<number>("indexof", value); }

        replace(find: string, replace: string): IODataTypedOperators<string> { return this.fn<string>("replace", find, replace); }

        substring(pos: number, length?: number): IODataTypedOperators<string> { return this.fn<string>("substring", pos, length); }

        tolower(): IODataTypedOperators<string> { return this.fn<string>("tolower"); }

        toupper(): IODataTypedOperators<string> { return this.fn<string>("toupper"); }

        trim(): IODataTypedOperators<string> { return this.fn<string>("trim"); }

        concat(value: string): IODataTypedOperators<string> { return this.fn<string>("concat", value); }

        //#endregion

        //#region - Date Functions -

        year(): IODataTypedOperators<number> { return this.fn<number>("year"); }

        month(): IODataTypedOperators<number> { return this.fn<number>("month"); }

        day(): IODataTypedOperators<number> { return this.fn<number>("day"); }

        hour(): IODataTypedOperators<number> { return this.fn<number>("hour"); }

        minute(): IODataTypedOperators<number> { return this.fn<number>("minute"); }

        second(): IODataTypedOperators<number> { return this.fn<number>("second"); }

        fractionalseconds(): IODataTypedOperators<number> { return this.fn<number>("fractionalseconds"); }

        date(): IODataTypedOperators<Date> { return this.fn<Date>("date"); }
        time(): IODataTypedOperators<Date> { return this.fn<Date>("time"); }
        totaloffsetminutes(): IODataTypedOperators<number> { return this.fn<number>("totaloffsetminutes"); }
        totalseconds(): IODataTypedOperators<number> { return this.fn<number>("totalseconds"); }

        //#endregion

        //#region - Math Functions -

        round(): IODataTypedOperators<number> { return this.fn<number>("round"); }

        floor(): IODataTypedOperators<number> { return this.fn<number>("floor"); }

        ceiling(): IODataTypedOperators<number> { return this.fn<number>("ceiling"); }

        //#endregion

        //#region - Logical Functions -

        eq<T>(value: T): IODataLogical { return this.lop("eq", value); }

        ne<T>(value: T): IODataLogical { return this.lop("ne", value); }

        gt<T>(value: T): IODataLogical { return this.lop("gt", value); }

        ge<T>(value: T): IODataLogical { return this.lop("ge", value); }

        lt<T>(value: T): IODataLogical { return this.lop("lt", value); }

        le<T>(value: T): IODataLogical { return this.lop("le", value); }

        //#endregion

        //#region - Logical Operators -

        not(): IODataFunctions { this.isNot = true; return this; }

        and(propName?: string): IODataFilterCreator {
            this.opName = "and";
            propName = propName || this.getPropName();
            return new ODataFilterCreator(propName, this);
        }

        or(propName?: string): IODataFilterCreator;
        or(expr: IODataFunctions | IODataLogical): IODataLogical;
        or(p?): any {
            var propName = p;
            if (propName instanceof ODataFilterCreator) {
                var res = new ODataFilterCreator(this.query, this);
                this.opName = "or(";
                this.args = <any>propName;
                return res;
            } else {
                this.opName = "or";
                propName = <string>propName || this.getPropName();
                return new ODataFilterCreator(<string>propName, this);
            }
        }

        //#endregion

    }

} 