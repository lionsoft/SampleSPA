'use strict';

module App.Services {

    export interface IODataMetadata<T> {
        Results: T[];
        Count: number;
    }

    export interface IODataParams {
        $expand?: string;
        $filter?: string;
        $orderBy?: string;
        $top?: number;
        $skip?: number;
        $extra?: string;
    }

    export class OData {

        private _expands: string[] = [];
        private _filter: string = "";
        private _orderBy: string[] = [];
        private _top: number;
        private _skip: number;
        private _extra: string[] = [];

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
            this.clear();
            if (params) {
                if (params.$expand) this._expands = params.$expand.split(',').select(s => (s || "").trim()).where(s => s !== "").toArray();
                this._filter = (params.$filter || "").trim();
                if (params.$orderBy) this._orderBy = params.$orderBy.split(',').select(s => (s || "").trim()).where(s => s !== "").toArray();
                this._top = params.$top;
                this._skip = params.$skip;
                if (params.$extra) this._extra = params.$extra.split('&').select(s => (s || "").trim()).where(s => s !== "").toArray();
            }
        }

        toString() {
            return this.query;
        }

        /**
         * Очищает все заданные параметры
         */
        clear() {
            this.prop(undefined);
            this._expands = [];
            this._filter = "";
            this._orderBy = [];
            this._top = undefined;
            this._skip = undefined;
            this._extra = [];
        }

        /**
         * Возвращает строковое значение запроса.
         */
        get query(): string {
            // update filter from current filter creator
            this.prop(undefined);
            if (this.$empty) return "$top=0&$filter=1 eq 0";
            var resArray = [];
            if (angular.isArray(this._expands) && this._expands.length > 0)
                resArray.push(`$expand=${this._expands.distinct().select(x => x.trim().replace(/\./g, '/')).toJoinedString(',')}`);
            if (this._filter) resArray.push(`$filter=${this._filter}`);
            if (angular.isArray(this._orderBy) && this._orderBy.length > 0)
                resArray.push(`$orderby=${this._orderBy.distinct().toJoinedString(',')}`);
            if (this._top || this._top === 0)
                resArray.push(`$top=${this._top}`);
            if (this._skip)
                resArray.push(`$skip=${this._skip}`);
            if (angular.isArray(this._extra) && this._extra.length > 0)
                resArray.push(this._extra.distinct().toJoinedString('&'));
            var res = resArray.distinct().toJoinedString('&');
            return res;
        }

        /**
         * При использовании фильтров по перечислениям необходимо использовать эту функцию,
         * для того, чтобы задать значение перечисления.
         * @param enumName полное название перечисления. Если задано коротуое (без точек) - к нему будет добавлен префикс NavisWeb.Models.
         * @param enumValue числовое значение перечисления
         */
        static enum(enumName: string, enumValue: number): Object {
            return enumValue === undefined ? undefined : new ODataEnum(enumName, enumValue);
        }

        /**
         * Добавляет к запросу параметр для получения общего количества записей в запросе (без учёта $top и $skip).
         * Результатом запроса будет не массив сущностей, а массив из одного элемента IODataMetadata.
         */
        $inlinecount(): OData {
            this._extra.push("$inlinecount=allpages");
            return this;
        }

        /**
         * Добавляет к запросу перечень названий ссылочных полей, значения которых нужно вернуть с сервера.
         */
        $expand(addExpand: boolean, ...value: string[]): OData;
        $expand(...value: string[]): OData;
        $expand(p1, ...value: string[]): OData {
            var addExpand = true;
            if (p1 === undefined || typeof p1 === "boolean") {
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
            this._orderBy = [];
            if (value && value[0] !== undefined) {
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
            }
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
            if (value !== undefined)
                this.prop("Id").eq(value);
            return this;
        }

        /**
         * Добавляет условие отбора 'равно' по указанному полю.
         */
        eq<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).eq(isEnum ? value.toString() : value);
            return this;
        }
        /**
         * Добавляет условие отбора 'не равно' по указанному полю.
         */
        ne<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).ne(isEnum ? value.toString() : value);
            return this;
        }
        /**
         * Добавляет условие отбора 'больше' по указанному полю.
         */
        gt<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).gt(isEnum ? value.toString() : value);
            return this;
        }
        /**
         * Добавляет условие отбора 'больше или равно' по указанному полю.
         */
        ge<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).ge(isEnum ? value.toString() : value);
            return this;
        }
        /**
         * Добавляет условие отбора 'меньше' по указанному полю.
         */
        lt<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).lt(isEnum ? value.toString() : value);
            return this;
        }
        /**
         * Добавляет условие отбора 'меньше или равно' по указанному полю.
         */
        le<T>(propName: string, value: T, isEnum?: boolean): OData {
            if (value !== undefined)
                this.prop(propName).le(isEnum ? value.toString() : value);
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
            if (this._filterCreator) {
                var query = this._filterCreator.query;
                if (query)
                    this.$filter('and', query);
            }
                
            if (propName) {
                this._filterCreator = new ODataFilterCreator(propName);
            } else {
                this._filterCreator = undefined;
            }
            return this._filterCreator;
        }

        /**
         * Usage:
         * 
         * odata.prop('a').eq(1);
         * odata.and(odata.prop('b').eq(2).or('c).eq(3));
         * 
         * This code will generate $filter=a eq 1 and (b eq 2 or c eq 3)
         * 
         */
        and(odataOperation: IODataLogical): OData {
            if (odataOperation) {
                var query = odataOperation.query;
                if (query)
                    this.$filter('and', `(${query})`);
            }
            this._filterCreator = undefined;
            return this;
        }

        /**
         * Mark query parameters that query returns empty result set.
         * Result of the query will be always empty and http request won't be sent.
         */
        $empty: boolean;


        /**
         * Если это свойство установлено - метод будет вызван CRUDService'ом после получения результата.
         * @param res результат запроса.
         */
        $translateResult: (res: any[]) => any[];
    }


    class ODataEnum {
        constructor(protected name: string, protected value: number) {
            if (!this.name.Contains('.'))
                this.name = 'Sam.DbContext.' + this.name;
        }
        toString() {
            return `${this.name}'${this.value}'`;
        }
    }

}