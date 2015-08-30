'use strict';

/**
 * Интерфейс нашего приложения
 */
interface IApp extends ng.IModule, LionSoftAngular.INgObject {
    webConfig: any;
    isDebugMode: boolean;
    api: App.IApiService;
    popup: LionSoftAngular.IPopupService;
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
    app.run(['$route',  $route => {
        // Include $route to kick start the router.
    }]);

    app.config(() => {
        app.isDebugMode = window["__isDebugMode"];
        app.webConfig = window["__webConfig"] || {};
    });    

    //#region - Настройка общедоступных сервисов API -
    app.run(['ApiService', '$rootScope', 'popupService', '$q', '$injector', '$log', '$timeout', '$window',
        (api, $rootScope, popup, $q, $injector, $log, $timeout, $window) => {
            app.api = api;
            app.popup = popup;
            $rootScope.isDebugMode = app.isDebugMode;
            $rootScope.App = App;
            app.$injector = $injector;
        }]);    
    //#endregion

}

var app = App.app;
