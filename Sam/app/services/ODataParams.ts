'use strict';

module App.Services {

    export interface IODataParams {
        $expand?: string;
        $filter?: string;
        $orderBy?: string;
        $top?: number;
        $skip?: number;
    }

    export class ODataParams {

        private _expands: string[] = [];
        private _filter: string = "";
        private _orderBy: string[] = [];
        private _top: number;
        private _skip: number;


        /**
         * То же самое, что и конструктор - создаёт объект ODataParams
         */
        static get create(): ODataParams {
            return new ODataParams();
        }

        /**
         * Создаёт объект ODataParams
         */
        constructor(params?: IODataParams) {
            if (params) {
                if (params.$expand) this._expands = params.$expand.split(',').select(s => (s || "").trim()).where(s => s !== "").toArray();
                this._filter = (params.$filter || "").trim();
                if (params.$orderBy) this._orderBy = params.$orderBy.split(',').select(s => (s || "").trim()).where(s => s !== "").toArray();
                this._top = params.$top;
                this._skip = params.$skip;
            }
        }

        toString() {
            return this.query;
        }

        /**
         * Возвращает строковое значение запроса.
         */
        get query(): string {
            var resArray = [];
            if (this._expands && this._expands.length > 0) resArray.push(`$expand=${this._expands.join(',')}`);
            if (this._filter) resArray.push(`$filter=${this._filter}`);
            if (this._orderBy && this._expands.length > 0) resArray.push(`$orderBy=${this._orderBy.join(',')}`);
            if (this._top || this._top === 0) resArray.push(`$top=${this._top}`);
            if (this._skip) resArray.push(`$skip=${this._skip}`);
            var res = resArray.join('&');
            return res;
        }

        /**
         * Добавляет к запросу перечень названий ссылочных полей, значения которых нужно вернуть с сервера.
         */
        $expand(...value: string[]): ODataParams {
            for (let item of value) {
                item = (item || "").trim();
                if (item) {
                    for (let s of item.split(',')) {
                        s = (s || "").trim();
                        if (s && !this._expands.contains(s))
                            this._expands.push(s);
                    }
                }
            }
            return this;
        }

        /**
         * Добавляет к запросу перечень названий полей, по которым неободимо отсортировать запрос.
         * Сортировка производится в порядке добавления полей. 
         * Для обратной сортировки следует к имени поля дописать desc.
         * 
         * Пример:
         *      $orderBy('field1', 'field2 desc', 'Category/Name desc');
         */
        $orderBy(...value: string[]): ODataParams {
            for (let item of value) {
                item = (item || "").trim();
                if (item) {
                    for (let s of item.split(',')) {
                        s = (s || "").trim();
                        if (s && !this._orderBy.contains(s))
                            this._orderBy.push(s);
                    }
                }
            }
            return this;
        }

        /**
         * Указывает количество записей, возвращаемых с сервера.
         */
        $top(value: number): ODataParams {
            this._top = value;
            return this;
        }

        /**
         * Указывает количество пропускаемых записей, возвращаемых с сервера.
         */
        $skip(value: number): ODataParams {
            this._skip = value;
            return this;
        }

        /**
         * Добавление условия отбора задаваемых в терминах ODATA-спецификации (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)
         * При простом вызове (без параметра op) каждая запись добавляется как будто op = 'and'
         * Для самой первой записи op игнорируется.
         * @param op может принимать значение 'and', 'or', 'not'.
         * @param filter условие отбора
         */
        $filter(op: string, filter: string | IODataFunctions): ODataParams;
        $filter(filter: string | IODataFunctions): ODataParams;
        $filter(p1, p2?): ODataParams {
            var op = p1;
            var filter = p2;
            if (filter === undefined) {
                op = "and";
                filter = p1;
            }
            if (filter) {
                if (!this._filter)
                    this._filter = filter;
                else if (op === "and")
                    this._filter = `${this._filter} ${op} ${filter}`;
                else
                    this._filter = `${this._filter} ${op} (${filter})`;
            }

            return this;
        }


        prop(propName: string): IODataFilterCreator {
            throw new Error('Not implemented');
            //return new ODataFilterCreator(propName);
        }
    }
}