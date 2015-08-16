'use strict';

// ReSharper disable InconsistentNaming
module App {

    /**
     * Описание нашего базового интерфейса CRUD-контроллера ресурсов
     */
    export interface IResourceClass<T> {
        query?(params?: Object): ng.IPromise<ng.resource.IResourceArray<T>>;

        //select(): ng.IPromise<ng.resource.IResourceArray<T>>;

        get?(id): ng.IPromise<T>;

        /*
                save(data: T): ng.IPromise<T>;
                save(params: Object, data: T): ng.IPromise<T>;
        */
        create?(data: T): ng.IPromise<T>;
        update?(data: T): ng.IPromise<T>;

        delete?(id): ng.IPromise<boolean>;
    }

    export class ApiServiceBase extends LionSoftAngular.Service {

        /**
         * Выделяет ошибку из ответа серевера, возникшую при вызове методов сервиса.
         */
        static ExctractError(err: any): string {
            var error = (err || "Fatal error").toString();
            if (typeof err.data === "object") {
                if (typeof err.data.ModelState === "object")
                    error = err.data.ModelState[""];
                else
                    error = (err.data.ExceptionMessage == undefined) ? err.data.Message : err.data.ExceptionMessage;
                if (!error && err.data.result && typeof err.data.result === "object") {
                    error = (err.data.result.ExceptionMessage == undefined) ? err.data.result.Message : err.data.result.ExceptionMessage;
                }
            }
            else if (err.statusText != undefined) {
                error = err.statusText.toString();
            }
            else if (err.data != undefined) {
                error = err.data.toString().substr(0, 100);
            }
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
        


        private transformServiceResponse(data: any, headers: any): any {
            // Copied from Angular default transform method
            if (angular.isString(data)) {
                // Strip json vulnerability protection prefix and trim whitespace
                var tempData = data.replace(Utils.Json.JSON_PROTECTION_PREFIX, '').trim();

                if (tempData) {
                    var contentType = headers('Content-Type');
                    if ((contentType && (contentType.indexOf(Utils.Json.APPLICATION_JSON) === 0)) || Utils.Json.IsJsonLike(tempData)) {
                        data = Utils.Json.ResolveReferences(angular.fromJson(tempData));
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
            return result;
        }

        private configServiceFactory(serviceFactory, methodName: string, paramNames?: {}) {
            if (!serviceFactory["__" + methodName])
                serviceFactory["__" + methodName] = serviceFactory[methodName];
            var $this = this;
            // ReSharper disable Lambda - to use arguments in function body
            serviceFactory[methodName] = function () {
                var defaultParamNames = paramNames ? (paramNames[methodName] || paramNames["$default"]) : undefined;
                var args = [];
                var params = {};
                // Преобразование строки параметров в объект
                // ReSharper disable SuspiciousThisUsage
                if (arguments.length > 0 && typeof arguments[0] == "string" && (arguments[0].StartsWith("?") || arguments[0].StartsWith("&") || arguments[0].StartsWith("$"))) {
                    params = arguments[0].replace(/(^\?)/, "").split("&").map(function (n) { return n = n.split("="), $this[n[0]] = n[1].trim(), $this; }.bind({}))[0];
                    args.push(params);
                }
                // ReSharper restore SuspiciousThisUsage
                // Преобразование списка необъектных параметров в объект с именами по умолчанию
                else if (arguments.length > 0 && typeof arguments[0] !== "object") {
                    // По умолчанию будем считать, что есть как минимум один параметр с наименованием id.
                    if ((!defaultParamNames || defaultParamNames.length === 0) && (methodName === "get" || methodName === "delete")) {
                        defaultParamNames = ["id"];
                    }
                    var stop = false;
                    args.push(params);
                    for (var idx in arguments) {
                        if (arguments.hasOwnProperty(idx)) {
                            var arg = arguments[idx];
                            stop = stop || idx >= defaultParamNames.length || typeof arguments[0] === "object" || typeof arguments[0] === "function";
                            if (stop)
                                args.push(arg);
                            else {
                                var paramName = defaultParamNames[idx];
                                params[paramName] = arg;
                            }

                        }
                    }
                }

                var oldResult = serviceFactory["__" + methodName].apply($this, args.length === 0 ? arguments : <any>args);
                // Преобразование старого результата в нормальный промис
                return $this.configServiceResult(oldResult);
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
                        query: {
                            method: "GET",
                            isArray: true,
                            transformResponse: (data, headers) => this.transformServiceResponse(data, headers) 
                        },
                        create: { method: "POST", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        update: { method: "PUT", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) },
                        delete: { method: "DELETE", transformResponse: (data, headers) => this.transformServiceResponse(data, headers) }
                };
                // Добавляем дополнительные методы
                for (var method in x.value) {
                    if (x.value.hasOwnProperty(method)) {
                        var action = x.value[method];
                        if (!action.url)
                            action.url = "{0}{1}".format(urlBase, action.route || "");
                        action.route = undefined;
                        // Заполняем параметры
                        if (action.params) {
                            paramNames[method] = [];
                            for (var paramName in action.params) {
                                if (action.params.hasOwnProperty(paramName)) {
                                    paramNames[method].push(paramName);
                                }
                            }
                        } else {
                            paramNames[method] = action.url.split(/:([\w]+)/).where(p => p && p[0] !== '/').toArray();
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