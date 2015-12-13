'use strict';
module App {
    export class RouteConfigurator {

        static IsRouteGranted(route: IAppRoute, inTopMenuOnly: boolean = false): boolean {
            var res = route && !route.isInvisible && (!route.auth || !angular.isArray(route.roles) || (app.$auth && app.$auth.LoggedUser && route.roles.contains(app.$auth.LoggedUser.UserRole)));
            if (app.$rootScope.$selectedMenuItem && res && inTopMenuOnly && route.settings && route.settings.topMenu)
                res = app.$rootScope.$selectedMenuItem === route.settings.topMenu;
            return res;
        }

        private _routes: IAppRoute[] = [];

        constructor(private $routeProvider: ng.route.IRouteProvider, public routes: IAppRoute[]) {
            routes.forEach(r => {
                if (r) {
                    var template = "";
                    if (!r.templateUrl)
                        r.templateUrl = r.name;

                    if (typeof r.templateUrl === "string") {
                        template = <string>r.templateUrl;
                        if (!template.Contains("/") && !template.EndsWith(".html")) {
                            template = "/app/views/{0}/{0}.html".format(template);
                            r.templateUrl = template;
                        }
                    } else if (typeof r.templateUrl === "function") {
                        template = (<any>(r.templateUrl))();
                    }

                    if (template) {
                        var path = template.ExtractDirectory();
                        var name = template.ExtractOnlyFileName();
                        r.files = [];
/*
                        var scriptFileName = path + '/' + name + '.js';
                        var styleFileName = path + '/' + name + '.css';
                        if (!r.files) r.files = [];
                        r.files = r.files.selectMany(f => f.split(',')).select(f => {
                            if (!f.StartsWith('/'))
                                f = path + '/' + f;
                            if (!f.EndsWith('.js'))
                                f = f + '.js';
                            return f;
                        }).toArray();
                        if (!r.files.Contains(scriptFileName))
                            r.files.push(scriptFileName);
                        if (!r.files.Contains(styleFileName))
                            r.files.push(styleFileName);
*/

                        if (r.files && r.files.length > 0) {
                            r.resolve = r.resolve || {};
                            r.resolve['lazy'] = [
                                '$ocLazyLoad', '$q', ($ocLazyLoad, $q: ng.IQService) => {
                                    if (r.files && r.files.length > 0)
                                        return $ocLazyLoad.load([{ name: App.app.name, files: r.files, serie: true }]);
                                }
                            ];
                        }

                        r.controller = r.controller || name;
                        r.controllerAs = r.controllerAs || "$";
                    }
                    r.redirectTo = ($routeParams, $locationPath, $locationSearch) => this.redirectToDefault($routeParams, $locationPath, $locationSearch);
                    $routeProvider.when(r.url, r);
                    this._routes.push(r);
                }
            });

            //$routeProvider.otherwise({ redirectTo: '/' });
            $routeProvider.otherwise({ redirectTo: ($routeParams, $locationPath, $locationSearch) => this.redirectToDefault($routeParams, $locationPath, $locationSearch) });
        }

        redirectToDefault($routeParams?: angular.route.IRouteParamsService, $locationPath?: string, $locationSearch?: any): string {
            var route = this._routes.firstOrDefault(r => r.url === $locationPath);
            if (!route && $locationPath) {
                // такой роут не найден - возможно это роут с параметрами
                var paramsRoutes = this._routes.where(r => r.url.Contains("/:")).select(r => ({route: r, url: r.url.split("/:")[0]})).toArray();
                var locPaths = $locationPath.split("/");
                while (!route && locPaths.length > 1) {
                    locPaths.length--;
                    var locPath = locPaths.join("/");
                    route = paramsRoutes.where(r => r.url === locPath).select(r => r.route).firstOrDefault();
                }
            }
            if (route && RouteConfigurator.IsRouteGranted(route)) {
                if (route.settings && route.settings.topMenu)
                    app.$rootScope.$selectedMenuItem = route.settings.topMenu;
                return $locationPath;
            }
            // try to find route enabled route
            route = this._routes.firstOrDefault(r => r.url === "/");
            if (!RouteConfigurator.IsRouteGranted(route, true)) {
                route = this._routes.where(r => r.settings && r.url && !r.url.StartsWith("/login") && RouteConfigurator.IsRouteGranted(r, true)).orderBy(x => x.settings.topMenu).thenBy(x => x.settings.nav).firstOrDefault();
            }
            if (route) {
                if (route.settings && route.settings.topMenu)
                    app.$rootScope.$selectedMenuItem = route.settings.topMenu;
                return route.url;
            }
            return "/login";
        }

    }

    // Define the routes - since this goes right to an app.constant, no use for a class
    // Could make it a static property of the RouteConfigurator class
    function getRoutes(): IAppRoute[] {
        return Routes;
    }

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config([
        '$routeProvider', 'routes', '$locationProvider',
        ($routeProvider, routes/*, $locationProvider*/) => {
            /*
                        $locationProvider.html5Mode({
                            enabled: true,
                            requireBase: false
                        });
            */
            return new RouteConfigurator($routeProvider, routes);
        }
    ]);


    //#region - Переход на страницу логина при попытке получить доступ к страницам, требующим авторизации -
    app.run(["$location", "$rootScope", "$route", "config", '$auth', ($location, $rootScope, $route, config: IConfigurations, $auth: IAutenticationService) => {

        $rootScope.$on('$locationChangeStart', (evt, next, current) => {
            if (!$rootScope.$redirectToLogin) {
                $rootScope.$priorLocation = "/";
                if (current) {
                    $rootScope.$priorLocation = current.split('#', 2)[1] || "/";
                }
            } else
                $rootScope.$redirectToLogin = undefined;

            var path = $location.path();
            if (path !== "/" && path.EndsWith("/")) {
                path = path.substring(0, path.length - 1);
            }

            var nextRoute = $route.routes[path];
            if (nextRoute) {
                if (nextRoute.auth) {
                    if (!$auth.IsLoggedIn) {
                        // if page requires authorization but user is not logged in
                        if (current.Contains("/#/login")) {
                            // ignore login page
                            evt.preventDefault();
                            $rootScope.$broadcast(config.events.controllerActivateSuccess);
                        } else {
                            // redirect to login page
                            $rootScope.$priorLocation = path;
                            $rootScope.$redirectToLogin = true;
                            $location.path("/login");
                            $rootScope.$broadcast(config.events.controllerActivateSuccess);
                            evt.preventDefault();
                        }
                    } 
                }
            }
        });
    }]);    
    //#endregion

}