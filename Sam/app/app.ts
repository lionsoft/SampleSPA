'use strict';

/**
 * Интерфейс нашего приложения
 */
interface IApp extends ng.IModule, LionSoftAngular.INgObject {
    api: App.IApiService;
    $auth: App.IAutenticationService;
}

module App {

    export var app: IApp = <IApp>angular.module('app', [
        // Angular modules 
        'ngAnimate',               // animations
        'ngRoute',                 // routing
        'ngSanitize',              // sanitizes html bindings (ex: sidebarCtrl.js)
        "ngResource",
        "pascalprecht.translate",  // translate provider

        'angular-loading-bar',

        // Custom modules 
        'common',                  // common functions, logger, spinner
        'common.bootstrap',        // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',            // ui-bootstrap (ex: carousel, pagination, dialog)
        "LionSoftAngular",
        "ui",
        "ui.select",
        "datatables",
        "datatables.factory",
        "datatables.bootstrap",
        "oc.lazyLoad"
    ]);

    // Handle routing errors and success events
    app.run(['$route', function ($route) {
        // Include $route to kick start the router.
    }]);
}

var app: IApp = App.app;


