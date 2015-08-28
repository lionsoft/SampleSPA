'use strict';

module App.Services {

    export interface IODataParams {
        $expand?: string;
        $filter?: string;
        $orderBy?: string;
        $top?: number;
        $skip?: number;
    }

    export class OData {

        private _expands: string[] = [];
        private _filter: string = "";
        private _orderBy: string[] = [];
        private _top: number;
        private _skip: number;

        private _filterCreator: ODataFilterCreator;


        /**
         * То же самое, что и конструктор - создаёт объект OData
         */
        static get create(): OData {
            return new OData();
        }

        /**
         * Создаёт объект OData
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
            // update filter from current filter creator
            this.prop(undefined);
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
         * При использовании фильтров по перечислениям необходимо использовать эту функцию,
         * для того, чтобы задать значение перечисления.
         * @param enumName полное название перечисления. Если задано коротуое (без точек) - к нему будет добавлен префикс NavisWeb.Models.
         * @param enumValue числовое значение перечисления
         */
        static enum(enumName: string, enumValue: number): Object {
            return new ODataEnum(enumName, enumValue);
        }

        /**
         * Добавляет к запросу перечень названий ссылочных полей, значения которых нужно вернуть с сервера.
         */
        $expand(addExpand: boolean, ...value: string[]): OData;
        $expand(...value: string[]): OData;
        $expand(p1, ...value: string[]): OData {
            var addExpand = true;
            if (typeof p1 === "boolean") {
                addExpand = p1;
            } else {
                if (p1)
                    value.push(p1.toString());
            }
            if (addExpand) {
                for (let item of value) {
                    item = (item || "").trim();
                    if (item) {
                        for (let s of item.split(',')) {
                            s = (s || "").trim().replace(/\./g, '/');
                            if (s && !this._expands.contains(s))
                                this._expands.push(s);
                        }
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
        $orderBy(...value: string[]): OData {
            if (value) {
                for (let item of value) {
                    item = (item || "").trim();
                    if (item) {
                        for (let s of item.split(',')) {
                            s = (s || "").trim().replace(/\./g, '/');
                            if (s && !this._orderBy.contains(s))
                                this._orderBy.push(s);
                        }
                    }
                }
            } else
                this._orderBy = [];
            return this;
        }

        /**
         * Указывает количество записей, возвращаемых с сервера.
         */
        $top(value: number): OData {
            this._top = value;
            return this;
        }

        /**
         * Указывает количество пропускаемых записей, возвращаемых с сервера.
         */
        $skip(value: number): OData {
            this._skip = value;
            return this;
        }

        /**
         * Добавляет условие отбора по ключевому полю Id.
         * @param value Значение ключевого поля
         */
        $id(value: string): OData {
            this.prop("Id").eq(value);
            return this;
        }

        /**
         * Добавляет условие отбора 'равно' по указанному полю.
         */
        eq<T>(propName: string, value: T): OData {
            this.prop(propName).eq(value);
            return this;
        }
        /**
         * Добавляет условие отбора 'не равно' по указанному полю.
         */
        ne<T>(propName: string, value: T): OData {
            this.prop(propName).ne(value);
            return this;
        }
        /**
         * Добавляет условие отбора 'больше' по указанному полю.
         */
        gt<T>(propName: string, value: T): OData {
            this.prop(propName).gt(value);
            return this;
        }
        /**
         * Добавляет условие отбора 'больше или равно' по указанному полю.
         */
        ge<T>(propName: string, value: T): OData {
            this.prop(propName).ge(value);
            return this;
        }
        /**
         * Добавляет условие отбора 'меньше' по указанному полю.
         */
        lt<T>(propName: string, value: T): OData {
            this.prop(propName).lt(value);
            return this;
        }
        /**
         * Добавляет условие отбора 'меньше или равно' по указанному полю.
         */
        le<T>(propName: string, value: T): OData {
            this.prop(propName).le(value);
            return this;
        }


        /**
         * Добавление условия отбора задаваемых в терминах ODATA-спецификации (http://www.odata.org/documentation/odata-version-2-0/uri-conventions/)
         * При простом вызове (без параметра op) каждая запись добавляется как будто op = 'and'
         * Для самой первой записи op игнорируется.
         * @param op может принимать значение 'and', 'or', 'not'.
         * @param filter условие отбора
         */
        $filter(op: string, filter: string | IODataFunctions): OData;
        $filter(filter: string | IODataFunctions): OData;
        $filter(p1, p2?): OData {
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
            } else
                this._filter = undefined;

            return this;
        }


        prop(propName: string): IODataFilterCreator {
            if (this._filterCreator)
                this.$filter("and", this._filterCreator.query);
            if (propName) {
                this._filterCreator = new ODataFilterCreator(propName);
            } else {
                this._filterCreator = undefined;
            }
            return this._filterCreator;
        }
    }


    class ODataEnum {
        constructor(protected name: string, protected value: number) {
            if (!this.name.Contains('.'))
                this.name = 'NavisWeb.Models.' + this.name;
        }
        toString() {
            return `${this.name}'${this.value}'`;
        }
    }

/*
    var x = new Services.OData();
//    var expr = x.prop("Field1").add(4).not().ge(5).and("Field2").eq(moment()).or("TTT").eq("O'Brian");
    var expr0 = new ODataFilterCreator("Field1").ge(5).or().eq(1).and("Field2").year().eq(1900).toString();

    var expr00 = new ODataFilterCreator("Field1").ge(5)
        .or(ODataFilterCreator.create("Field1").eq(1).and("Field2").year().eq(1900))
        .and("Field3").eq(3)
        .toString();


    var expr1 = new ODataFilterCreator("Field1").add(4).not().ge(5).toString();
    var expr3 = new ODataFilterCreator("Field1").ge(moment()).toString();
    var expr4 = new ODataFilterCreator("Field1").not().ge(new Date()).toString();
    var expr2 = new ODataFilterCreator("Field1").concat('4').not().ge("O'Brian").toString();

    var expr41 = 1;
*/


}