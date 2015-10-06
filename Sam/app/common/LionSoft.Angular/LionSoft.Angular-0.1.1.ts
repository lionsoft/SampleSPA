var $$ = arg => angular.element(arg);

interface Document {
    createStyleSheet: (styleFile: string) => void;
}

interface Window {
    navigate: (url: string) => void;
}

declare module angular
{
    interface IWindowService {
        navigate: (url: string) => void;
    }

    interface IFilterFunc {
        (value: any, ...params: any[]): any;
    }
}

interface IKeyValue {
    Key: any;
    Value: any;
}


module LionSoftAngular {
    "use strict";


    // ReSharper disable once InconsistentNaming
    /**
        Current root folder of the LionSoft.Js-{version}.js
        Warning! If minification bundles is used - you should set this parameter manually to correct value.
    */
    //export var rootFolder: string = LionSoftJs.getBasePath();
    export var rootFolder: string = "/app/common/LionSoft.Angular/";


    // ReSharper disable once InconsistentNaming
    export var Module: ng.IModule = angular.module("ng-lionsoft", ["ngSanitize"]);

    // ReSharper disable once InconsistentNaming
    export function module(...requires: string[]): ng.IModule {
        Module.requires = Module.requires.concat(requires).toArray();
        return Module;
    }

    export function ValidateForm(form: ng.INgModelController): boolean {
        if (form.$invalid) {
            for (var errorName in form.$error) {
                if (form.$error.hasOwnProperty(errorName)) {
                    var errors = form.$error[errorName];
                    for (var control of errors) {
                        // ReSharper disable once QualifiedExpressionIsNull
                        control.$setTouched();
                    }
                }
            }
        }
        return !form.$invalid;
    }

    angular.module("LionSoftAngular", ["ng-lionsoft"]);

    if (!window["$"])
        window["$"] = $$;

    // ReSharper disable InconsistentNaming
    /**
     * Все angular-объекты реализуют этот интерфейс
     */
    export interface INgObject {
        $q: ng.IQService;
        $injector: ng.auto.IInjectorService;
        $log: ng.ILogService;
        $timeout: ng.ITimeoutService;
        $window: ng.IWindowService;

        /**
         * Ссылка на глобальный скоуп.
         */
        $rootScope: ng.IRootScopeService | any;

        /**
         * Возвращает ссылку на зависимость по её имени.
         * @param serviceName Имя зависимости
         */
        get(serviceName: string): any;

        /**
         * Возвращает Defer-объект указанного типа.
         */
        defer<T>(): ng.IDeferred<T>;

        /**
         * Оборачивает готовый результат в промис.
         * @param res Результат
         */
        promiseFromResult<T>(res: T): ng.IPromise<T>;
    }


    /**
     * Все angular-контроллеры реализуют этот интерфейс
     */
    export interface IController extends INgObject {

        /**
         * Ссылка на текущий скоуп контроллера.
         */
        $scope: ng.IScope;

        /**
         * Можно использовать для индикации процесса загрузки.
         */
        loading: boolean;

        /**
         * Можно использовать для заголовка страницы.
         */
        title: string;
    }

    /**
     * Все angular-сервисы реализуют этот интерфейс
     */
    export interface IService extends INgObject {

    }

    /**
     * Все angular-фабрики реализуют этот интерфейс
     */
    export interface IFactory extends IService {
        
    }

    /**
     * Возвращает название класса
     */
    export function getClassName(obj: Object) {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(typeof obj === "function" ? obj.toString() : obj.constructor.toString());
        var res = (results && results.length > 1) ? results[1] : "";
        return res;
    }


    /**
     * Наследуйте все базовые ангуляр объекты от этого класса.
     * По умолчанию доступны сервисы $injector, $q, $log, $timeout, $windows как свойства этого класса.
     */
    export class NgObject implements INgObject {

        /**
         * Путь загрузки файла скрипта объекта.
         * Должно быть установлено вручную, если путь отличается от LionSoftAngular.rootFolder
         */
        rootFolder: string;


        /**
         * Перечисление всех переданных в конструктор инъекций сервисов ангуляра.
         */
        protected ng: any = {};

        $injector: ng.auto.IInjectorService;
        $q: ng.IQService;
        $log: ng.ILogService;
        $timeout: ng.ITimeoutService;
        $window: ng.IWindowService;

        /**
         * Ссылка на глобальный скоуп.
         */
        $rootScope: ng.IRootScopeService;

        constructor(...injections: any[]) {
            if (injections && injections.length > 0)
                this.initInjections.apply(this, injections);
        }


        protected getFactoryResult(): any {
            return this;
        }

        /**
         * Инициализация зависимостей объекта.
         * @param injections 
         * @returns {} 
         */
        protected initInjections(...injections: any[]) {
            for (var i = 0; i < injections.length; i++) {
                var paramName = this.constructor.$inject[i];
                if (paramName) {
                    this.ng[paramName] = injections[i];
                    if (!(paramName in this))
                        this[paramName] = injections[i];
                }
            }
            this.init(true);
            this.rootFolder = this.rootFolder || LionSoftAngular.rootFolder;
        }

        /**
         * Добавляет названия зависимостей в список, если их там ещё нет.
         */
        protected static addInjection(injects: string[], ...injection: string[]) {
            if (injects) {
                for (var i = 0; i < injection.length; i++) {
                    if (!injects.Contains(injection[i])) injects.push(injection[i]);
                }
            }
        }

        /**
         * Добавление дополнительных зависимостей, нужных для работы - "$injector", "$q", "$log", "$timeout", "$window", "$rootScope"
         */
        protected static addFactoryInjections(injects: string[]) {
            NgObject.addInjection(injects, "$injector", "$q", "$log", "$timeout", "$window", "$rootScope");
        }

        public static Factory(...injects: string[]): any {
            this.addFactoryInjections(injects);
            var factory = (...args: any[]) => {
                var res = new this();
                res.constructor.$inject = injects;
                res.initInjections.apply(res, args);
                return res.getFactoryResult();
            }
            factory.$inject = injects;
            return factory;
        }

        protected init(callInit: boolean) {
            this.ngName = this.ngName || getClassName(this);
            if (callInit)
                this.Init();
        }

        /**
         * Всю инициализацию необходимо делать в этом методе, а не в конструкторе.
         */
        Init(): void {

        }

        /**
         * Получить angular-интерфейс по его имени.
         * @param serviceName Наименование интерфейса
         */
        get(serviceName: string): any { return this.$injector.get(serviceName); }

        /**
         * Создаёт defer-объект указанного типа результата.
         */
        defer<T>(): ng.IDeferred<T> { return this.$q.defer<T>(); }

        promiseFromResult<T>(res: T): ng.IPromise<T> {
            var d = this.defer<T>();
            d.resolve(res);
            return d.promise;
        }


        /**
         * Возвращает название класса
         */
        get ClassName() {
            return getClassName(this);
        }

        /**
         * Название объекта, переданное при регистрации
         */
        ngName: string;

        /**
         * Возращает название объекта либо в виде camel case либо в виде наименования атрибута (маленькими буквами через дефис)
         */
        getName(camelCase: boolean = true) {
            if (!this.ngName) {
                this.ngName = this.ClassName;
                if (this.ngName.length > 1)
                    this.ngName = this.ngName[0].toLowerCase() + this.ngName.substr(1);
            }
            var res = this.ngName;
            if (res)
                res = res[0].toLowerCase() + res.substr(1);
            if (!camelCase && res) {
                res = res.replace(/[A-Z]/g, (match/*, index, original*/) => ('-' + match.toLowerCase()));
            }
            return res;
        }
    }


    /**
     * Наследуйте все ангуляр контроллеры от этого класса.
     * По умолчанию доступны сервисы NgObject плюс $scope и popupService.
     * 
     * Пример инициализации:
     * app.controller('myController', MyController.Factory('svc1', 'svc2'));
     */
    export class Controller extends NgObject implements IController {

        /**
         * Ссылка на текущий скоуп контроллера.
         */
        $scope: ng.IScope;

        popupService: IPopupService;


        /**
         * Можно использовать для индикации процесса загрузки.
         */
        loading: boolean;


        /**
         * Можно использовать для заголовка страницы.
         */
        title: string;


        /**
         * Добавление дополнительных зависимостей, нужных для работы контроллера - $scope
         */
        protected static addFactoryInjections(injects: string[]) {
            NgObject.addFactoryInjections(injects);
            this.addInjection(injects, "$scope", "popupService");
        }

        /**
         * Возврат на предыдущую страницу
         * @param backUrl Адрес предыдущей страницы. Если не указан будет предпринята попытка понять самостоятельно куда вернуться.
         */
        GoBack(backUrl?: string) {
            backUrl = backUrl || document.referrer;
            if (backUrl)
                if (this.$window.navigate)
                    this.$window.navigate(backUrl);
                else
                    location.href = backUrl;
            else {
                //this.$window.open("", "_self").close();
                if (window.history)
                    window.history.back();
            }
        }
    }

    /**
     * Наследуйте все ангуляр сервисы от этого класса. 
     * По умолчанию доступны сервисы NgObject плюс $http и $resource.
     * 
     * Пример инициализации:
     * app.service('myService', MyService.Factory('svc1', 'svc2'));
     */
    export class Service extends NgObject implements IService {

        $http: ng.IHttpService;
        $resource: ng.resource.IResourceService;

        public static addFactoryInjections(injects: string[]) {
            NgObject.addFactoryInjections(injects);
            this.addInjection(injects, "$http", "$resource");
        }
    }

    /**
     * Наследуйте все ангуляр фабрики от этого класса.
     * По умолчанию доступны сервисы NgObject плюс $http и $resource.
     * 
     * Пример инициализации:
     * app.factory('myFactory', MyFactory.Factory('svc1', 'svc2'));
     */
    export class Factory extends Service implements IFactory {

    }


    /**
     * Наследуйте все ангуляр фильтры от этого класса.
     * По умолчанию доступны сервисы NgObject.
     * В наследнике следует переопределить метод Execute(value)
     * 
     * Пример инициализации:
     * app.filter('myFilter', MyFilter.Factory('svc1', 'svc2'));
     */
    export class Filter extends NgObject {

        protected getFactoryResult(): any {
            return (value, ...params) => this.Execute(value, ...params);
        }

        public Execute(value: any[]|any, ...params): any[]|any {
            return value;
        }
    }


    /**
     * Наследуйте все директивы не имеющие html-темплейта от этого класса.
     * Скоуп, элемент и атрибуты директивы доступны через св-ва $scope, $element, $attrs.
     * По умолчанию доступны сервисы $parse, $compile, $sce 
     * 
     * Пример создания директивы (my-directive):
     *   class MyDirective : Directive {
     *
     *       scope: IMyDirectiveScope = { ... };
     * 
     *       Init() {
     *           this.restrict = "AE";
     *       }
     *
     *       Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controllers: any, transclude: ng.ITranscludeFunction) {
     *           ...
     *       }
     *   }
     *   new MyDirective().Register();
     */
    export class Directive extends NgObject implements ng.IDirective {

        static LoadedStyles = {};

        static LoadStyle(styleFile: string) {
            if (!this.LoadedStyles[styleFile]) {
                if (document.createStyleSheet) {
                    document.createStyleSheet(styleFile); //IE
                } else {
                    var link = document.createElement("link");
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.href = styleFile;
                    document.getElementsByTagName("head")[0].appendChild(link);
                }
                this.LoadedStyles[styleFile] = true;
            }
        }

        LoadStyle(styleFile: string) {
            TemplatedDirective.LoadStyle(styleFile.ExpandPath(this.rootFolder));
        }

        /**
         * Do not override this method. Use methods this.PreLink, this.Link, this.Compile instead.
         */
        compile = (element, attrs, transclude) => {
            this.Compile(element, attrs, transclude);
            return {
                pre: (scope, element, attrs, controller, transclude) => {
                    this.PreLink(scope, element, attrs, controller, transclude);
                },
                post: (scope, element, attrs, controller, transclude) => this.Link(scope, element, attrs, controller, transclude)
            }
        };

        /**
         * Название директивы в camelCase нотации
         */
        name: string;

        $compile: ng.ICompileService;

        $parse: ng.IParseService;

        $sce: ng.ISCEService;

        /**
         * Добавление дополнительных зависимостей, нужных для работы - $compile, $parse, $sce
         */
        protected static addFactoryInjections(injects: string[]) {
            NgObject.addFactoryInjections(injects);
            this.addInjection(injects, "$compile", "$parse", "$sce");
        }

        protected init(callInit: boolean) {
            this.Declare(this);
            super.init(callInit);
        }

        /**
        * Override this method to declare directive.
        * If you want to use this.NgName property in the declaration of the directive use this method only.
        * @param d this directive
        */
        Declare(d: ng.IDirective): void {
            // Do not comment out these definitions. They are here only for sample.
            /*
                d.restrict = "AE";
                d.scope = { val: '@' + this.NgName };
            */
        }

        Compile(element: ng.IAugmentedJQuery, attrs: ng.IAttributes, transclude: ng.ITranscludeFunction) {
        }

        PreLink(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controllers: any, transclude: ng.ITranscludeFunction) {
        }


        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controllers: any, transclude: ng.ITranscludeFunction) {
        }
    }

    /**
     * Наследуйте все директивы, имеющие html-темплейт от этого класса.
     * Темплейт будет автоматически загружен из папки $LionSoftAngular.rootFolder/html и именем темплейта будет имя директивы. 
     */
    export class TemplatedDirective extends Directive {

        templateUrl = (elem, attr) => this.GetTemplateUrl(elem, attr).ExpandPath(this.rootFolder);

        GetTemplateUrl(element: ng.IAugmentedJQuery, attrs: ng.IAttributes): string {
            //this.LoadStyle("css/{0}.html".format(this.getName(false)).ExpandPath(this.rootFolder));
            return "html/{0}.html".format(this.getName(false));
        }
    }

    /**
     * Наследуйте все декораторы сервисов от этого класса.
     * По умолчанию доступны сервисы Service + $delegate.
     * В наследнике следует переопределить метод Decorate($delegate)
     * 
     * Пример инициализации:
     * app.decorator('myService', MyServiceDecorator.Factory());
     */
    export class ServiceDecorator extends Service {
        $delegate: any;

        public static addFactoryInjections(injects: string[]) {
            NgObject.addFactoryInjections(injects);
            this.addInjection(injects, "$delegate");
        }

        protected getFactoryResult(): any {
            return this.Decorate(this.$delegate) || this.$delegate;
        }

        protected Decorate($delegate: any): any {
            return $delegate;
        }
    }

    /**
     * Наследуйте все декораторы директив от этого класса.
     * По умолчанию доступны сервисы Directive + $delegate.
     * В наследнике следует переопределить методы Compile, PreLink, Link
     * Вызовы super.Compile(...), super.PreLink(...), super.Link(...) будут равносильны оригинальным вызовам 
     * 
     * Пример инициализации:
     * app.decorator('mySuperDirective', MySuperDirectiveDecorator.Factory());
     */
    export class DirectiveDecorator extends Directive {

        $delegate: any;

        private _oldCompile: Function;
        private _pre: Function;
        private _post: Function;

        public static addFactoryInjections(injects: string[]) {
            NgObject.addFactoryInjections(injects);
            this.addInjection(injects, "$delegate");
        }

        Compile(element: ng.IAugmentedJQuery, attrs: ng.IAttributes, transclude: ng.ITranscludeFunction) {
            var pre_post = this._oldCompile(element, attrs, transclude);
            if (pre_post) {
                if (typeof pre_post === "function") {
                    this._post = pre_post;
                } else {
                    this._pre = pre_post.pre;
                    this._post = pre_post.post;
                }
            }
        }

        PreLink(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controllers: any, transclude: ng.ITranscludeFunction) {
            if (this._pre)
                this._pre(scope, element, attrs, controllers, transclude);
        }


        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controllers: any, transclude: ng.ITranscludeFunction) {
            if (this._post)
                this._post(scope, element, attrs, controllers, transclude);
        }

        protected getFactoryResult(): any {
            var directive = this.$delegate[0];
            this._oldCompile = directive.compile;

            directive.compile = (element, attrs, transclude) => {
                this.Compile(element, attrs, transclude);
                return {
                    pre: (scope, element, attrs, controllers, transcludeFn) => this.PreLink(scope, element, attrs, controllers, transcludeFn),
                    post: (scope, element, attrs, controllers, transcludeFn) => this.Link(scope, element, attrs, controllers, transcludeFn)
                };
            }
            return this.$delegate;
        }
    }

}



