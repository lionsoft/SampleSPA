'use strict';

module App.Controllers {

    export interface ISidebarCtrl {
        isCurrent(route): string;
        navRoutes: IAppRoute[];
    }

    export class SidebarCtrl implements ISidebarCtrl {
        navRoutes: IAppRoute[];

        //using shortcut syntax on private variables in the constructor
        constructor(private $route, private $config, private $routes: IAppRoute[]) {
            this.activate();
        }

        public isCurrent(route: IAppRoute) {
            if (!route.name || !this.$route.current || !this.$route.current.name) {
                return '';
            }
            var menuName = route.name;
//            var res = this.$route.current.name.substr(0, menuName.length) === menuName ? 'current' : '';
            var res = (this.$route.current.name === menuName || this.$route.current.name.substr(0, menuName.length + 1) === `${menuName}.`) ? 'current' : '';

            this.IsSidebarVisible = this.$route.current.name !== "login";
            return res;
        }

        public navClick() {

        }

        private activate() {
            this.getNavRoutes();
        }

        private getNavRoutes() {
            this.navRoutes = (<any>(this.$routes)).filter(r => r.settings && r.settings.nav)
                .sort((r1, r2) => r1.settings.nav - r2.settings.nav);
        }

        public GetRoutes() {
            return this.navRoutes;
        }

        public IsSidebarVisible: boolean;
    }

    // Register with angular
    app.controller('sidebarCtrl', ['$route', 'config', 'routes', ($r, c, r) => new SidebarCtrl($r, c, r)]);
}