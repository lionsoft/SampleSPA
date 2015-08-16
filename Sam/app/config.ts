/// <reference path="common/commonconfig.ts" />
module App {
    'use strict';
    import shared = App.Shared;

    export interface IEvents {
        controllerActivateSuccess: string;
        spinnerToggle: string;
    }

    export interface IConfigurations {
        appErrorPrefix: string;//Configure the exceptionHandler decorator
        docTitle: string;
        events: IEvents;
        remoteServiceName: string;
        version: string,
        imageSettings: { imageBasePath: string, unknownPersonImageSource: string }
    }

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    // For use with the HotTowel-Angular-Breeze add-on that uses Breeze
    var remoteServiceName = 'breeze/Breeze';

    var events: IEvents = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle'
    };

    var config: IConfigurations = {
        appErrorPrefix: '[HT Error] ', //Configure the exceptionHandler decorator
        docTitle: 'HotTowel: ',
        events: events,
        remoteServiceName: remoteServiceName,
        version: '2.1.0',
        imageSettings: { imageBasePath: '', unknownPersonImageSource: '' }
    };

    app.value('config', config);

    app.config(['$logProvider', $logProvider => {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', (cfg:shared.ICommonConfig) => {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    //#endregion

    //#region Configure CORS for $http provider
    app.config(['$httpProvider', $httpProvider => {
        $httpProvider.defaults.useXDomain = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
        // Должен остаться признак, что это AJAX-запрос 
        $httpProvider.defaults.headers.common['X-Ajax-Request'] = "1";
    }]);
    //#endregion

    LionSoftAngular.Services.app = app;

    //#region - Настройка общедоступных сервисов API -
    app.run(['ApiService', 'popupService', (api, popup) => {
        app.api = api;
        app.popup = popup;
    }]);    
    //#endregion

}

 