/// <reference path="../common/common.ts" />
'use strict';

module App.Controllers
{
    export interface IShell
    {
        busyMessage: string;
        isBusy: boolean;
        spinnerOperations: {
            radius: number;
            lines: number;
            length: number;
            width: number;
            speed: number;
            corners: number;
            trail: number;
            color: string;
        }
        toggleSpinner(on: boolean): void;
    }

    export class Shell implements IShell
    {
        public static controllerId = 'shell';
        
        //#region Variables
        busyMessage = Site.BUSY_MESSAGE;
        controllerId = Shell.controllerId;
        isBusy= true;
        spinnerOperations = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        }
        //#endregion

        constructor(public $rootScope: any, public common: App.Shared.ICommon, public config: any, public $scope: ng.IScope, public $route, public $routes: IAppRoute[], public $location: ng.ILocationService)
        {
            this.activate();
            this.registerEvents();
        }

        public toggleSpinner(on: boolean): void {
            this.isBusy = on;
        }

        private activate()
        {
            var logger = this.common.logger.getLogFn(this.controllerId, 'success');
            //logger('Hot Towel Angular loaded!', null, true);
            this.common.activateController([], this.controllerId);
            this.$scope.$watch("vm.IsSidebarVisible", x => this.updateNavRoutes());
        }

        private registerEvents()
        {
            var events = this.config.events;
            this.$rootScope.$on('$routeChangeStart',
                (event, next, current) => {
                    if (next.$$route && current.$$route && next.$$route !== current.$$route)
                        this.toggleSpinner(true);
                }
            );

            this.$rootScope.$on(events.controllerActivateSuccess,
                data => {
                    this.toggleSpinner(false);
                }
            );

            this.$rootScope.$on(events.spinnerToggle,
                data => {
                    this.toggleSpinner(data.show);
                }
            );
        }




        public IsSidebarVisible: boolean;
        public allRoutes: IAppRoute[];

        public get selectedMenuItem(): string {
            var res = this.$rootScope.$selectedMenuItem;
            if (!res) {
                res = this.GetNavMenuItems().firstOrDefault();
                this.selectedMenuItem = res;
            }
            return res;
        }
        public set selectedMenuItem(value: string) {
            this.$rootScope.$selectedMenuItem = value;
        }


        public isCurrent(route: IAppRoute) {
            this.IsSidebarVisible = this.$route.current.name !== "login";
            var res = "";
            if (this.$route.current && this.$route.current.name) {
                if (route && route.name) {
                    var menuName = route.name;
                    res = (this.$route.current.name === menuName || this.$route.current.name.substr(0, menuName.length + 1) === `${menuName}.`) ? 'current' : '';
                }
            }
            return res;
        }

        private updateNavRoutes() {
            this.allRoutes = Enumerable.from(this.$routes).where(r => r.settings && r.settings.nav > 0 && RouteConfigurator.IsRouteGranted(r)).orderBy(r => r.settings.nav).toArray(); 
        }

        public selectMenuItem(menuItem) {
            if (this.selectedMenuItem === menuItem) return;
            this.selectedMenuItem = menuItem;
                this.$location.path("/");
        }

        public GetSideBarMenuItems(): IAppRoute[] {
            return this.allRoutes.where(r => !r.settings || !r.settings.topMenu || r.settings.topMenu === this.selectedMenuItem).toArray();
        }

        public GetNavMenuItems(): string[] {
            return this.allRoutes.where(x => !!x.settings.topMenu).select(x => x.settings.topMenu).distinct().orderBy(x => x).toArray();
        }
    }

    // Register with angular
    app.controller(Shell.controllerId,
        ['$rootScope', 'common', 'config', '$scope', '$route', 'routes', '$location',
            ($rS, com, con, $scope, $route, routes, $location) => new Shell($rS, com, con, $scope, $route, routes, $location)]);
}