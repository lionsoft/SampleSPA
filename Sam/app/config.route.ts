'use strict';
module App {
    export class RouteConfigurator {
        constructor($routeProvider: ng.route.IRouteProvider, routes: IAppRoute[]) {
            routes.forEach(r => {
                var template = "";
                if (!r.templateUrl)
                    r.templateUrl = r.name;

                if (typeof r.templateUrl === "string") {
                    template = <string>r.templateUrl;
                    if (!template.Contains("/") && !template.EndsWith(".html")) {
                        template = "/app/views/{0}/{0}.html".format(template);
                        r.templateUrl = template;
                    }
                }
                else if (typeof r.templateUrl === "function") {
                    template = (<any>(r.templateUrl))();
                }

                if (template) {
                    var path = template.ExtractDirectory();
                    var name = template.ExtractFileName().split('.')[0];
                    var scriptFileName = path + '/' + name + '.js';
                    var styleFileName = path + '/' + name + '.css';
                    if (!r.files) r.files = [];
                    r.files = r.files.select(f => {
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
                $routeProvider.when(r.url, r);
            });
            $routeProvider.otherwise({ redirectTo: '/' });
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
        ($routeProvider, routes, $locationProvider) => {
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
            var nextRoute = $route.routes[$location.path()];
            if (nextRoute && nextRoute.originalPath === "") {
                $rootScope.$broadcast(config.events.controllerActivateSuccess);
                $location.path("/");
            }
            else if (nextRoute && nextRoute.auth && !$auth.IsLoggedIn) {
                if (current.Contains("/#/login")) {
                    evt.preventDefault();
                } else {
                    $location.path("/login/{0}".format(encodeURIComponent($location.path())));
                    $rootScope.$broadcast(config.events.controllerActivateSuccess);
                }
            }
        });
    }]);    
    //#endregion

}