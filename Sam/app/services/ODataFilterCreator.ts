'use strict';

module App.Services {
    
    /**
     * Список операторов ODATA
     */
    export interface IODataOperators {
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
    export interface IODataTypedOperators<T> {
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
        and(propName: string): IODataFilterCreator;
        or(propName: string | IODataFunctions | IODataLogical): IODataFilterCreator;
    }

    /**
     * Список функций ODATA
     */
    export interface IODataFunctions extends IODataOperators {

        //#region - Arithmetic Operators -
        add(value: number): IODataTypedOperators<number>;
        sub(value: number): IODataTypedOperators<number>;
        mul(value: number): IODataTypedOperators<number>;
        div(value: number): IODataTypedOperators<number>;
        mod(value: number): IODataTypedOperators<number>;
        //#endregion

        //#region - String Functions -
        substringof(value: string): IODataFunctions;
        startswith(value: string): IODataFunctions;
        endswith(value: string): IODataFunctions;

        length(): IODataTypedOperators<number>;
        indexof(value: string): IODataTypedOperators<number>;
        replace(find: string, replace: string): IODataTypedOperators<string>;
        substring(pos: number, length?: number): IODataTypedOperators<string>;
        tolower(): IODataTypedOperators<string>;
        toupper(): IODataTypedOperators<string>;
        trim(): IODataTypedOperators<string>;
        concat(value: string): IODataTypedOperators<string>;
        //#endregion

        //#region - Date Functions -
        day(): IODataTypedOperators<number>;
        hour(): IODataTypedOperators<number>;
        minute(): IODataTypedOperators<number>;
        month(): IODataTypedOperators<number>;
        second(): IODataTypedOperators<number>;
        year(): IODataTypedOperators<number>;
        //#endregion

        //#region - Math Functions -
        round(): IODataTypedOperators<number>;
        floor(): IODataTypedOperators<number>;
        ceiling(): IODataTypedOperators<number>;
        //#endregion

    }

    /**
     * Генератор выражения фильтра ODATA
     */
    export interface IODataFilterCreator extends IODataFunctions {
        not(): IODataFunctions;
    }


    export class ODataFilterCreator /*implements IODataFunctions*/ {

        constructor(protected propName: string, protected parent?: ODataFilterCreator) {
        }


        private _result: string;

        toString() {
            return this._result;
        }

        private op(op: string, propName: string, value): IODataFunctions {
/*
            value = this.(value);
            this._result = `${propName} ${op} ${value}`;
*/
            //return this;
            return null;
        }

        private fn(fn: string, propName: string, ...args): IODataFunctions {
            //return `${fn}(${propName},${value})`;
            return null;
        }

    }

} 