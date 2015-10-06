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
        busyMessage = 'Please wait...';
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
        public IsTopNavVisible: boolean;
        public allRoutes: IAppRoute[];
        public sideBarMenuItems: IAppRoute[];
        public topNavMenuItems: string[];

        public get selectedMenuItem(): string {
            // Check the case when home page is not in menus
            if (this.$route.current.url === '/' && (!this.$route.current.settings || !this.$route.current.settings.nav))
                return undefined;
            var res = this.$rootScope.$selectedMenuItem;

            if (!res) {
                res = this.topNavMenuItems.firstOrDefault();
                // Check the case when home page is not in menus
//                if (this.$route.current.url === '/' && this.$route.current.settings && this.$route.current.settings.topMenu !== res)
//                    res = undefined;
                this.selectedMenuItem = res;
            }
            return res;
        }
        public set selectedMenuItem(value: string) {
            this.$rootScope.$selectedMenuItem = value;
        }


        public isCurrent(route: IAppRoute) {
            this.IsTopNavVisible = this.$route.current.name !== "login";
            this.IsSidebarVisible = this.IsTopNavVisible && (this.topNavMenuItems.length === 0 || this.selectedMenuItem && this.sideBarMenuItems.length > 1);
            if (this.IsSidebarVisible)
                $('.mainbar').removeClass("no-h-margins");
            else
                $('.mainbar').addClass("no-h-margins");
            
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
            this.allRoutes = Enumerable.from(this.$routes).where(r => r.settings && (r.settings.nav > 0 || r.settings.topMenu) && RouteConfigurator.IsRouteGranted(r)).orderBy(r => r.settings.nav).toArray(); 
            this.topNavMenuItems = this.allRoutes.where(x => !!x.settings.topMenu).select(x => x.settings.topMenu).distinct().orderBy(x => x).toArray();
            this.sideBarMenuItems = this.allRoutes.where(r => r.settings.nav > 0 && r.settings.topMenu === this.selectedMenuItem).toArray();
        }

        public selectMenuItem(menuItem) {
            if (this.selectedMenuItem === menuItem) return;
            this.selectedMenuItem = menuItem;
            this.sideBarMenuItems = this.allRoutes.where(r => r.settings.topMenu === menuItem).toArray();
            if (this.sideBarMenuItems.length > 0) 
                this.$location.path(this.sideBarMenuItems[0].url);
            else 
                this.$location.path("/");
        }
    }

    // Register with angular
    app.controller(Shell.controllerId,
        ['$rootScope', 'common', 'config', '$scope', '$route', 'routes', '$location',
            ($rS, com, con, $scope, $route, routes, $location) => new Shell($rS, com, con, $scope, $route, routes, $location)]);
}