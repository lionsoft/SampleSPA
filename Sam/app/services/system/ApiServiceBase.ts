'use strict';

// ReSharper disable InconsistentNaming
module App {

    /**
     * Описание нашего базового интерфейса CRUD-контроллера ресурсов
     */
    export interface IResourceClass<T> {
        query?(params?: Object): IPromise<ng.resource.IResourceArray<T>>;
        get?(id): IPromise<T>;

        save?(data: T): IPromise<T>;

        create?(data: T): IPromise<T>;
        update?(data: T): IPromise<T>;

        delete?(id): IPromise<boolean>;
    }
    
    export interface IPromise<T> extends ng.IPromise<T> {

        /**
         * Regardless of when the promise was or will be resolved or rejected, then calls one of the success or error callbacks asynchronously as soon as the result is available. The callbacks are called with a single argument: the result or rejection reason. Additionally, the notify callback may be called zero or more times to provide a progress indication, before the promise is resolved or rejected.
         * The successCallBack may return IPromise<void> for when a $q.reject() needs to be returned
         * This method returns a new promise which is resolved or rejected via the return value of the successCallback, errorCallback. It also notifies via the return value of the notifyCallback method. The promise can not be resolved or rejected from the notifyCallback method.
         */
        then<TResult>(successCallback: (promiseValue: T) => ng.IHttpPromise<TResult>|App.IPromise<TResult>|IPromise<TResult>|TResult|App.IPromise<void>|IPromise<void>, errorCallback?: (reason: any) => any, notifyCallback?: (state: any) => any): App.IPromise<TResult> | IPromise<TResult>;

        /**
         * Shorthand for promise.then(null, errorCallback)
         */
        catch<TResult>(onRejected: (reason: any) => ng.IHttpPromise<TResult>|IPromise<TResult>|TResult): IPromise<TResult>;

        /**
         * Allows you to observe either the fulfillment or rejection of a promise, but to do so without modifying the final value. This is useful to release resources or do some clean-up that needs to be done whether the promise was rejected or resolved. See the full specification for more information.
         *
         * Because finally is a reserved word in JavaScript and reserved keywords are not supported as property names by ES3, you'll need to invoke the method like promise['finally'](callback) to make your code IE8 and Android 2.x compatible.
         */
        finally<TResult>(finallyCallback: () => any): IPromise<TResult>;

        /**
         * Помечает результат запроса к сервису, что необходимо выполнять обработку ошибки по умолчанию.
         */
        HandleError(): IPromise<T>;
        /**
         * Помечает результат запроса к сервису, что необходимо в случае ошибки пытаться 
         * извлечь текст ошибки из ответа. В этом случе параметр reason в методе catch будет строкой - текстом ошибки.
         */
        ExtractError(): IPromise<T>;
    }    

    export class ApiServiceBase extends LionSoftAngular.Service {

        /**
         * Выделяет ошибку из ответа серевера, возникшую при вызове методов сервиса.
         */
        static ExctractError(err: any): string {
            var error = (err || "Fatal error").toString();
            if (typeof err.data === "object") {
                if (err.data.ModelState && typeof err.data.ModelState === "object")
                    error = err.data.ModelState[""];
                else
                    error = (err.data.ExceptionMessage == undefined) ? err.data.Message : err.data.ExceptionMessage;
                if (!error && err.data.result && typeof err.data.result === "object") {
                    error = (err.data.result.ExceptionMessage == undefined) ? err.data.result.Message : err.data.result.ExceptionMessage;
                }
            }
            else if (err.statusText != undefined) 
                error = err.statusText.toString();
            else if (err.data != undefined) 
                error = err.data.toString().substr(0, 100);
            else if (err.Message != undefined) 
                error = err.Message.toString();
            return error;
        }

        /**
         * Обрабатывает ошибку, возникшую при вызове методов сервиса.
         */
        static HandleError(err: any): void {
            var error = this.ExctractError(err);
            //alert(error);
            app.popup.error(error);
        }

        $location: ng.ILocationService;

        public static addFactoryInjections(injects: string[]) {
            LionSoftAngular.Service.addFactoryInjections(injects);
            this.addInjection(injects, "$location");
        }
        


        private transformServiceResponse(data: any, headers: any, isArray: boolean = false): any {
            // Copied from Angular default transform method
            if (angular.isString(data)) {
                // Strip json vulnerability protection prefix and trim whitespace
                var tempData = data.replace(Utils.Json.JSON_PROTECTION_PREFIX, '').trim();

                if (tempData) {
                    var contentType = headers('Content-Type');
                    if ((contentType && (contentType.indexOf(Utils.Json.APPLICATION_JSON) === 0)) || Utils.Json.IsJsonLike(tempData)) {
                        data = Utils.Json.ResolveReferences(angular.fromJson(tempData));
                        if (isArray && !angular.isArray(data))
                            data = [data];
                    }
                }
            }
            if (!angular.isObject(data))
                data = { result: data };
            return data;
        }



        private configServiceResult<T>(res): IPromise<T> {
            if (res.$promise != undefined) {
                res = res.$promise;
            }
            var newRes = this.defer();
            res.then(r=> {
                if (r.result !== undefined)
                    newRes.resolve(r.result);
                else {
                    // Когда приходит в ответ null - r равен пустому промису - это нужно проверить и вернуть null
                    if (r && !r.length && r.$promise && r.$resolved && Enumerable.from(r).count() === 2)
                        newRes.resolve(null);
                    else
                        newRes.resolve(r);
                }

            })
            .catch(reason => {
                if (reason.status === 401) {
                    // Ошибка авторизации - перекидываем на страницу логина
                    this.$location.path("/login");
                } else {
                    newRes.reject(reason);
                }
            })
            ;
            var result = <IPromise<T>>newRes.promise;
/*
            result.HandleError = () => {
                result.catch(reason => ApiServiceBase.HandleError(reason));
                return result;
            };
            result.ExtractError = () => {
                var newRes1 = this.defer();
                result
                    .then(r => newRes1.resolve(r))
                    .catch(reason => newRes1.reject(ApiServiceBase.ExctractError(reason)));
                return newRes1.promise;
            };
*/
            return result;
        }

        private configServiceFactory(serviceFactory, methodName: string, paramNames?: {}) {
            if (!serviceFactory["__" + methodName])
                serviceFactory["__" + methodName] = serviceFactory[methodName];
            var _this = this;
// ReSharper disable once Lambda
            serviceFactory[methodName] = function () {
                var defaultParamNames = paramNames ? (paramNames[methodName] || paramNames["$default"]) : undefined;
                var args = [];
                var params = {};

                // Если первым параметром передан объект OData - превращаем его в строку параметров
                if (arguments.length > 0 && arguments[0] instanceof Services.OData) {
                    arguments[0] = arguments[0].query;
                }

                // Преобразование строки параметров в объект
                // ReSharper disable SuspiciousThisUsage
                if (arguments.length > 0 && typeof arguments[0] == "string" && (arguments[0].StartsWith("?") || arguments[0].StartsWith("&") || arguments[0].StartsWith("$"))) {
                    params = arguments[0].replace(/(^\?)/, "").split("&").map(function (n) { return n = n.split("="), this[n[0]] = n[1].trim(), this; }.bind({}))[0];
                    args.push(params);
                }

                // ReSharper restore SuspiciousThisUsage
                // Преобразование списка необъектных параметров в объект с именами по умолчанию
                else if (arguments.length > 0 && (angular.isArray(arguments[0]) || !angular.isObject(arguments[0]))) {
                    // По умолчанию будем считать, что есть как минимум один параметр с наименованием id.
                    if ((!defaultParamNames || defaultParamNames.length === 0) && (methodName === "get" || methodName === "delete")) {
                        defaultParamNames = ["id"];
                    }
                    var stop = false;
                    args.push(params);
                    for (var idx in arguments) {
                        if (arguments.hasOwnProperty(idx)) {
                            var arg = arguments[idx];
                            // Если параметр это объект OData - заполняем параметры запроса его значениями
                            if (arg instanceof Services.OData) {
                                var odataArgs = arg.query.replace(/(^\?)/, "").split("&").map(function(n) { return n = n.split("="), this[n[0]] = n[1].trim(), this; }.bind({}))[0];
                                for (let paramName in odataArgs) {
                                    if (odataArgs.hasOwnProperty(paramName)) {
                                        params[paramName] = odataArgs[paramName];
                                    }
                                }
                            } else {
                            stop = stop || idx >= defaultParamNames.length || (!angular.isArray(arguments[0]) && angular.isObject(arguments[0])) || typeof arguments[0] === "function";
                            if (stop)
                                args.push(arg);
                            else {
                                    let paramName = defaultParamNames[idx];
                                params[paramName] = arg;
                            }
                            }
                        }
                    }
                }

                // Исправляем багу, когда для POST, PUT, PATCH запросов при передаче ВСЕХ параметров через
                // строку запроса - формируется запрос с параметрами в теле.
                // Для этого тупо добавим ещё один пустой параметр.
                // По хорошему неплохо бы проверить, что action это действительно POST, PUT, PATCH, но я не нашёл как это сделать
                if (defaultParamNames.$$params$$ > 0) {
                    args.push(undefined);
                }
                var oldResult = serviceFactory["__" + methodName].apply(_this, args.length === 0 ? arguments : <any>args);
                // Преобразование старого результата в нормальный промис
                return _this.configServiceResult(oldResult);
            };
        }

        /**
         * Преобразует методы класса ng.resources.IResourceClass, которые работают через вызов метода обратного вызова
         * в методы класса App.IResourceClass которые возвращают промисы.
         */
        private configService(serviceFactory: any, paramNames?: {}) {
            // Автоматически исправляем все методы сервиса для того, чтобы они возвращали промис
            // Кроме метода bind - это внутренний метод.
            for (var methodName in serviceFactory) {
                if (serviceFactory.hasOwnProperty(methodName) && methodName !== "bind" && !methodName.StartsWith("__")) {
                    this.configServiceFactory(serviceFactory, methodName, paramNames);
                }
            }
            return serviceFactory;
        }




        Init(baseUrl?: string) {
            var self = this;
            Enumerable.from(this)
                .where(x => !x.key.StartsWith("_")
                    && !x.key.StartsWith("$")
                    && x.key !== "ngName"
                    && x.key !== "ng"
                )
                .forEach(x => {
                    var paramNames = { $default: ["id"] };
                    //var urlBase = "{0}/{1}/".format(self.baseUrl, x.key);
                    var urlBase = "{0}/{1}/".format(baseUrl, x.key);
                    var methods = {
                        // Добавляем стандартные методы
                        head: { method: "HEAD", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // получение списка объектов
                        query: {
                            method: "GET",
                            isArray: true,
                            transformResponse: (data, headers) => this.transformServiceResponse(data, headers, true),
                        },
                        // получение  объекта по его Id
                        get:    { method: "GET", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // создание нового объекта
                        create: { method: "POST", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // изменение существующего объекта. Поле Id должно быть заполнено. В противном случае или если объект не найден в базе - ошибка
                        update: { method: "PUT", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // удаление объекта по его Id
                        delete: { method: "DELETE", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // удаление объекта по его Id
                        remove: { method: "DELETE", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // сохранение объекта. Если Id заполнено и такой объект есть в базе равносильно Update. В противном случае - Create.
                        save:   { method: "PATCH", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        // сохранение объекта. Если Id заполнено и такой объект есть в базе равносильно Update. В противном случае - Create.
                        patch:  { method: "PATCH", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) }
                };
                // Добавляем дополнительные методы
                for (var method in x.value) {
                    if (x.value.hasOwnProperty(method)) {
                        var action = x.value[method];
                        if (!action.url)
                            action.url = "{0}{1}".format(urlBase, action.route || "");
                        action.route = undefined;
                        // Заполняем параметры
                        paramNames[method] = action.url.split(/:([\w]+)/).where(p => p && p[0] !== '/').toArray();
                        paramNames[method].$$params$$ = paramNames[method].length; // количество параметров, перадаваемых через строку запроса
                        if (action.params) {
                            paramNames[method].Clear();
                            for (var paramName in action.params) {
                                if (action.params.hasOwnProperty(paramName)) {
                                    paramNames[method].push(paramName);
                                }
                            }
                        }

                        if (action.transformResponse) {
                            var saved = action.transformResponse;
                            action.transformResponse = (data, headers) => {
                                // ReSharper disable once ClosureOnModifiedVariable
                                var res = Utils.Json.ResolveReferences(saved(data, headers));
                                if (!angular.isObject(res))
                                    res = { result: res };
                                return res;
                            }
                        }
                        else
                            action.transformResponse = (data, headers) => this.transformServiceResponse(data, headers);
                            
                        methods[method] = action;
                    }
                }
                var service = this.configService(self.$resource("{0}:id".format(urlBase), {}, methods), paramNames);
                self[x.key] = service;
            });
        }
    }
}