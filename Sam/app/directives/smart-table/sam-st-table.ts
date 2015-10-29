'use strict';

module App.Directives {

    interface ISamStTableParams<T extends IEntityObjectId> {

        /**
         * Уникальный идентификатор таблицы в контроллере.
         * Если не указан равен значению параметра service, если он задан в виде строки - имени сервиса.
         * Используется для получения события samStRefresh.
         */
        id: string;

        /**
         * Ссылка на CRUDService класса. (В разметке можно указань название сервиса).
         */
        service: Services.ICRUDService<T>;

        /**
         * Ссылка на HTML-шаблон редактирования объекта.
         */
        editTemplate: string;  
        
        /**
         * Вызывается перед выполнение запроса. Здесь можно добавить дополнительные условия отбора.
         * Возвращает список выражений, которые будут переданы в метод $scope.$watch() для отслеживания необходимости обновления запроса.
         * @param odata OData-параметры запроса
         * @param table ссылка на контроллер таблицы
         * @returns {} список выражений, которые будут переданы в метод $scope.$watch() для отслеживания необходимости обновления запроса
         */
        prepareQuery: (odata: Services.OData, table: st.IController) => string | string[];

        /**
         * Вызывается перед редактированием элемента. Здесь можно проинициализировать объект дополнительными значениями 
         * или даже полностью перекрыть редактирование по умолчанию.
         * Если возвращает промис - стандартный метод редактирования не будет вызван.
         * @param entity элемент для редактироания
         * @param table ссылка на контроллер таблицы
         * @returns {} если возвращает промис - стандартный метод редактирования не будет вызван.
         */
        prepareEdit: (entity: T, table: st.IController) => IPromise<T>;


        /**
         * Контроллер диалога редактирования (или наименование контроллера), если задан - будет использоваться именно он.
         */
        controller: Controller;

        /**
         * Вызывается при изменении источника данных
         * @param items текущий источник данных
         */
        onLoad: (items: T[]) => void;
    }


    interface ISamStTableScope<T extends IEntityObjectId> extends ng.IScope {
        $table: st.IController;
        $loading: boolean;
        $: Controller;
        $params: ISamStTableParams<T>;
        $items: T[];
        $edit: (item: T) => void;
        $delete: (item: T) => void;
    }


    /**
     * Usage:
     * 
     *  <div st-table="[items]"
     *       [st-items-by-page="nnn"]
     *       [st-show-page-sizes="true"]
     *       sam-st-table='{ [id], service, [editTemplate], [prepareQuery], [prepareEdit], [controller], [onLoad]}'
     *  >
     * 
     *  To force refresh the table in controller - send the event 'samStRefresh' with the table id.
     *
     *  Sample: 
     *  
     *     this.$scope.$broadcast('samStRefresh', 'tableId');
     */
    class SamStTable extends LionSoftAngular.Directive
    {
        restrict = 'A';
        require = 'stTable';
        scope = true;
        stConfig: st.IConfig;
        $controller;

        Compile(element: ng.IAugmentedJQuery, attrs) {
            var innerTable = element.find('table');
            if (innerTable.length > 0) {
                var tableOuterWrapper = angular.element(`
<div class="st-table-wrapper">
    <div class="st-table-wrapper-inner"></div>
    <div class="pre-loader" ng-show="$loading">
        <div class="sp sp-circle"></div>
    </div>
</div>`);
                
                var rows = innerTable.find('tbody>tr>td');
                var colsCount = rows.length;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (row.hasAttribute("colspan")) {
                        var colSpan = parseInt(row.getAttribute("colspan"));
                        if (colSpan > 1)
                            colsCount += colSpan - 1;
                    }
                }
                var noDataRow = angular.element(`
<tbody ng-show="$items.length == 0">
    <tr>
        <td colspan="${colsCount}" class="text-center">
            <span translate>NoTableData</span>
        </td>
    </tr>
</tbody>
`);

                var tableInnerWrapper = tableOuterWrapper.find('div.st-table-wrapper-inner');
                var tableParent = innerTable.parent();
                var nextAfterTableElement = innerTable.next();
                innerTable.appendTo(tableInnerWrapper);
                if (nextAfterTableElement.length > 0)
                    tableOuterWrapper.insertBefore(nextAfterTableElement);
                else
                    tableParent.append(tableOuterWrapper);
                noDataRow.insertBefore(innerTable.find('tbody'));

                var pageSize = attrs.stItemsByPage === undefined ? undefined : (attrs.stItemsByPage ? parseInt(attrs.stItemsByPage) : 20);
                if (pageSize) {
                    var showPageSizes = `st-show-page-sizes="${attrs.stShowPageSizes === undefined ? 'true' : attrs.stShowPageSizes}"`;
                    var paging = angular.element(`<div st-pagination st-items-by-page="${pageSize}" ${showPageSizes}></div>`);
                    paging.insertAfter(tableOuterWrapper);
                }
            }
        }


        PreLink(scope: ISamStTableScope<IEntityObjectId>, element, attrs, ctrl: st.IController) {
            var pipePromise = null;
            scope.$table = ctrl;
            scope.$params = scope.$eval(attrs.samStTable);
            if (angular.isString(scope.$params.service)) {
                var serviceName = <string><any>scope.$params.service;
                scope.$params.id = scope.$params.id || serviceName;
                scope.$params.service = this.get(serviceName);
          }
//            scope.$params.service = angular.isString(scope.$params.service) ? this.get(<any>scope.$params.service) : scope.$params.service;
            scope.$items = scope.$eval(attrs.stTable) || [];
            scope.$edit = item => this.Edit(scope, item, attrs.samStTable);
            scope.$delete = item => this.Delete(scope, item);

            scope.$on("samStRefresh", (event, id: string) => {
                if (id === scope.$params.id)
                    ctrl.pipe();
            });

            ctrl.preventPipeOnWatch();
            ctrl.pipe = () => {
                if (pipePromise !== null)
                    this.$timeout.cancel(pipePromise);
                pipePromise = this.$timeout(() => { }, this.stConfig.pipe.delay);
                var res = pipePromise
                    .then(() => {
                        pipePromise = null;
                        return this.Load(scope) || [];
                    })
                    .then(res => {
                        if (scope.$params.onLoad) {
                            if (scope.$)
                                scope.$params.onLoad.apply(scope.$, [res]);
                            else
                                scope.$params.onLoad(res);
                        }
                        return res;
                    });
                return res;
            }
        }

        Link(scope: ng.IScope, element, attrs, ctrl: st.IController) {
            var stPagination = element.find('div[st-pagination][st-show-page-sizes]');
            if (stPagination.length > 0) {
                var stShowPageSizes = attrs['stShowPageSizes'];
                if (stShowPageSizes === undefined || scope.$eval(stShowPageSizes))
                    stPagination.addClass("st-show-page-sizes");
                else 
                    stPagination.addClass("st-hide-page-sizes");
            }
            ctrl.pipe();
        }

        addWatchers(scope, expressions: string[]) {
            for (let expr of expressions) {
                if (!expr.StartsWith("$."))
                    expr = "$." + expr;
                scope['__watchers'] = scope['__watchers'] || [];
                if (!scope['__watchers'].Contains(expr)) {
                    scope.$watch(expr, (newVal, oldVal) => {
                        if (newVal !== oldVal)
                            scope.$table.pipe();
                    });
                    scope['__watchers'].push(expr);
                }
            }            
        }

        Load(scope: ISamStTableScope<IEntityObjectId>) {
            if (scope.$loading) return;
            scope.$loading = true;
            var tableState = scope.$table.tableState();
            tableState.pagination.start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            tableState.pagination.number = tableState.pagination.number || this.stConfig.pagination.itemsByPage;  // Number of entries showed per page.
            var odata = Services.OData.create;
            var watchExpressions;
            if (scope.$params.prepareQuery) {
                if (scope.$)
                    watchExpressions = scope.$params.prepareQuery.apply(scope.$, [odata, scope.$table]);
                else
                    watchExpressions = scope.$params.prepareQuery(odata, scope.$table);
            }
            if (watchExpressions) {
                if (angular.isArray(watchExpressions))
                    this.addWatchers(scope, <string[]>watchExpressions);
                else if (angular.isString(watchExpressions))
                    this.addWatchers(scope, watchExpressions.split(','));
            }
            return scope.$params.service.SmartLoad(tableState, scope.$items, odata).finally(() => scope.$loading = false);
        }

        Edit(scope: ISamStTableScope<IEntityObjectId>, item: IEntityObjectId, tableAttrs) {
            item = angular.copy(item || <IEntityObjectId>{});
            var res = undefined;

            var controller: Controller;

            if (typeof (<any>(scope.$params.controller)) === "string") {
                controller = this.$controller(scope.$params.controller, { '$scope': scope.$new(), '$item': item });
            } else {
                controller = scope.$params.controller;
            }
                
            var params = scope.$params;
            if (controller) {
                controller['$'] = scope.$;
                controller.$scope['$'] = controller;
                controller.$scope['__customController'] = controller;
                controller.$scope['$item'] = controller['$item'];
                scope['$item'] = item;
                controller['$item'] = item;

                params = controller.$scope.$eval(tableAttrs);
                params.controller = controller;
                params.prepareEdit = params.prepareEdit || scope.$params.prepareEdit;
                params.editTemplate = params.editTemplate || scope.$params.editTemplate;
                params.service = (angular.isString(params.service) ? this.get(<any>params.service) : params.service) || scope.$params.service;
            }
            if (params.prepareEdit) {
                if (controller)
                    res = params.prepareEdit.apply(controller, [item, scope.$table]);
                else if (scope.$)
                    res = params.prepareEdit.apply(scope.$, [item, scope.$table]);
                else
                    res = params.prepareEdit(item, scope.$table);
            }

            if (!res || !angular.isFunction(res.then))
                res = this.promiseFromResult(res);

            // ReSharper disable once QualifiedExpressionMaybeNull
            res.then(r => {
                    if (r === false) return <any>false;
                    if (controller) {
                        return params.service.EditModal(item, params.editTemplate, controller.$scope, false);
                    } else {
                        return params.service.EditModal(item, params.editTemplate, scope, false);
                    }
            })
            .then(r => {
                if (r) scope.$table.pipe();
            });
        }

        Delete(scope: ISamStTableScope<IEntityObjectId>, item: IEntityObjectId) {
            scope.$params.service.DeleteModal(item).then(() => scope.$table.pipe());
        }
    }

    app
        .config(["stConfig", (stConfig: st.IConfig) => {
            stConfig.pagination.template = 'sam-tables-pagination-tmpl.html'.ExpandPath(URL.DIRECTIVES_ROOT + "smart-table");
        }])
        .directive("samStTable", SamStTable.Factory('stConfig', '$controller'));
}