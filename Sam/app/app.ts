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

type DateTime = Date | moment.Moment | string;

module App {

    export var app: IApp = <IApp>angular.module('app', [
        // Angular modules 
        'ngAnimate',               // animations
        'ngRoute',                 // routing
        'ngSanitize',              // sanitizes html bindings (ex: sidebarCtrl.js)
        "ngResource",
        "pascalprecht.translate",  // translate provider

        'angular-loading-bar',
        'angularFileUpload',

        // Custom modules 
        'common',                  // common functions, logger, spinner
        'common.bootstrap',        // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',            // ui-bootstrap (ex: carousel, pagination, dialog)
        "LionSoftAngular",
        "ui",
        "ui.select",

        "smart-table",

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
            app.$q = $q;
            app.$log = $log;
            app.$timeout = $timeout;
            app.$window = $window;
            app.$rootScope = $rootScope;
            app.get = (name) => $injector.get(name);
            app.defer = () => $q.defer();
            app.promiseFromResult = (res) => {
                var d = $q.defer();
                d.resolve(res);
                return d.promise;
            }
        }]);    
    //#endregion

}

var app = App.app;
