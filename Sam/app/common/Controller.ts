module App {

    /**
     * Все angular-контроллеры реализуют этот интерфейс
     *
     * Наследуйте все ангуляр контроллеры от этого класса.
     * Вам будут доступны основные сервисы ангуляра, как свойства этого класса.
     */ 
    export class Controller extends LionSoftAngular.Controller {

        private _activateCalled: boolean;

        common: Shared.ICommon;

        /**
         * Ссылка на сервис-переводчик
         */
        $translate: angular.translate.ITranslateService;

        $filter: ng.IFilterService;

        $route: angular.route.IRouteService;

        $routeParams: any;

        log: (msg: string, data?: any, showToast?: boolean) => void;

        /**
         * Добавление дополнительных зависимостей, нужных для работы
         */
        protected static addFactoryInjections(injects: string[]) {
            LionSoftAngular.Controller.addFactoryInjections(injects);
            this.addInjection(injects, "common", "$scope", "$route", "$routeParams", "$translate", "$filter");
        }


        init(callInit: boolean) {
            this.loading = true;
            this.title = this.$route.current['title'];
            super.init(false);
            var controllerAs = this.$route.current.controllerAs;
            this.ngName = this.$route.current.controller.toString();
            this.log = this.common.logger.getLogFn(this.ngName);
            this.$rootScope['title'] = undefined;
            var appTitle = this.$filter("translate")("APP_TITLE");
            this.$scope.$watch((controllerAs ? controllerAs + "." : "") + "title", newVal => {
                if (newVal)
                    this.$rootScope['title'] = newVal + " - " + appTitle;
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
                .then(() => this.activated())
                .finally(() => this.loading = false);
        }

        /**
         * Вызывается когда контроллер проинициализирован.
         */
        activated() {

        }
    }
}