module App {

    /**
     * Все angular-контроллеры реализуют этот интерфейс
     *
     * Наследуйте все ангуляр контроллеры от этого класса.
     * Вам будут доступны основные сервисы ангуляра, как свойства этого класса.
     */
    export class Controller extends LionSoftAngular.Controller {

        common: Shared.ICommon;

        promiseFromResult<T>(res: T): IPromise<T> {
            return <any>super.promiseFromResult(res);
        }

        /**
         * Ссылка на сервис-переводчик
         */
        $translate: ng.translate.ITranslateService;

        $filter: ng.IFilterService;

        $route: ng.route.IRouteService;

        /**
         * Каталог из которого был загружен контроллер
         */
        $currentDirectory: string;

        log: (msg: string, data?: any, showToast?: boolean) => void;

        /**
         * Добавление дополнительных зависимостей, нужных для работы
         */
        protected static addFactoryInjections(injects: string[]) {
            LionSoftAngular.Controller.addFactoryInjections(injects);
            this.addInjection(injects, "$route", "common", "$translate", "$filter");
        }

        Translate(langKey: string): string {
            return this.$filter("translate")(langKey);
        }

        init(callInit: boolean) {
            this.$currentDirectory = this.$route.current['loadedTemplateUrl'].ExtractDirectory();
            if (LionSoftAngular.popupDefaults) {
                LionSoftAngular.popupDefaults.templateUrlBase = this.$currentDirectory;
            }
            super.init(false);
            this.ngName = this.$route.current.controller.toString();
            this.log = this.common.logger.getLogFn(this.ngName);
            if (callInit)
                this.Init();
        }
    }

    /**
     * Все angular-контроллеры реализуют этот интерфейс
     *
     * Наследуйте все ангуляр контроллеры от этого класса.
     * Вам будут доступны основные сервисы ангуляра, как свойства этого класса.
     */ 
    export class PageController extends Controller {

        private _activateCalled: boolean;

        $location: ng.ILocationService;

        $routeParams: any;

        /**
         * Добавление дополнительных зависимостей, нужных для работы
         */
        protected static addFactoryInjections(injects: string[]) {
            Controller.addFactoryInjections(injects);
            this.addInjection(injects, "$routeParams", "$location");
        }

        // ReSharper disable once InconsistentNaming
        init(callInit: boolean) {
            this.loading = true;
            super.init(false);
            this.title = this.$route.current['title'];
            var controllerAs = this.$route.current.controllerAs;
            $('body').attr("id", this.ngName);
            this.$rootScope['title'] = undefined;
            var appTitle = this.Translate(Site.TITLE);
            this.$scope.$watch((controllerAs ? controllerAs + "." : "") + "title", (newVal: string) => {
                if (newVal)
                    this.$rootScope['title'] = this.Translate(newVal) + " - " + appTitle;
                else
                    this.$rootScope['title'] = appTitle;
            });
            if (callInit)
                this.Init();
            if (!this._activateCalled)
                this.activate();
        }

        /**
         * Выполняет активизацию контроллера. 
         * Требуется обязательный вызов из конструктора контроллера.
         * @param promises Список промисов асихронных операций, по окончанию выполнения которых считается, что контроллер активизирован. 
         * @returns {} Промис об окончании активизации
         */
        protected activate(...promises: Array<ng.IPromise<any>>): ng.IPromise<any> {
            this._activateCalled = true;
            return this.common.activateController(promises, this.ngName)
                .then(() => {
                    this.Activated();
                    this.$$updateWatchersCount();
                    if (this.$rootScope['currentController'] && this.$rootScope['currentController'] !== this && this.$rootScope['currentController'].deactivate)
                        this.$rootScope['currentController'].deactivate(this);
                    this.$rootScope['currentController'] = this;
                })
                .finally(() => {
                    this.loading = false;
                });
        }

        /**
         * Выполняет деактивизацию контроллера страницы. 
         * Вызывается после активизации нового контроллера страницы.
         * @param newController Ссылка на новый контроллер страницы. 
         */
        protected deactivate(newController: Controller) {
            this.Deactivated(newController);
        }

        // ReSharper disable once InconsistentNaming
        /**
         * Обновляет количество всех текущих вотчеров приложения.
         * @returns {} 
         */
        protected $$updateWatchersCount()
        {
            if (!app.isDebugMode)
                return;
            this.$timeout(() => {
                this.$rootScope['$$warchersCount'] = this.common.currentWatchersCount();
            });
            setTimeout(() => this.$$updateWatchersCount(), 1000);
        }

        /**
         * Вызывается когда контроллер проинициализирован.
         */
        Activated() {
        }


        /**
         * Вызывается после деинициализации контроллера.
         */
        Deactivated(newController: Controller) {
        }

    }
}