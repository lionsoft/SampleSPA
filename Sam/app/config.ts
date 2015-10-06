'use strict';
module App {

    export interface IEvents {
        controllerActivateSuccess: string;
        spinnerToggle: string;
    }

    export interface IConfigurations {
        appErrorPrefix: string;  //Configure the exceptionHandler decorator
        docTitle: string;
        events: IEvents;
        version: string,
        imageSettings: { imageBasePath: string, unknownPersonImageSource: string }
    }

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    var events: IEvents = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle'
    };

    var config: IConfigurations = {
        appErrorPrefix: '[HT Error] ', //Configure the exceptionHandler decorator
        docTitle: 'HotTowel: ',
        events: events,
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
    app.config(['commonConfigProvider', (cfg: Shared.ICommonConfig) => {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    //#endregion

    //#region Configure CORS for $http provider
    app.config(['$httpProvider', $httpProvider => {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        // Должен остаться признак, что это AJAX-запрос 
        $httpProvider.defaults.headers.common['X-Ajax-Request'] = "1";
    }]);
    //#endregion

    //#region Configure Popover provider
    app.config(['$tooltipProvider', ($tooltipProvider: ng.ui.bootstrap.ITooltipProvider) => {
        $tooltipProvider.options({ appendToBody: true});
    }]);
    //#endregion

    //#region Configure SmartTable provider
    app.config(['stConfig', (stConfig: st.IConfig) => {
        stConfig.select.selectedClass = "active";
    }]);
    //#endregion
}


 