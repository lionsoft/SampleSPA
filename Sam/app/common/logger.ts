'use strict';

interface Window {
    info(message: any): void;
    success(message: any): void;
    error(message: any): void;
    warning(message: any): void;
}
declare function info(message): void;
declare function success(message): void;
declare function error(message): void;
declare function warning(message): void;


module App.Shared{

    export interface ILogger {
        getLogFn(moduleId: string, fnName?: string): (msg: string, data?: any, showToast?: boolean) => void;
        log(message: string, data: any, source: string, showToast: boolean);
        logError(message: string, data: any, source: string, showToast: boolean);
        logSuccess(message: string, data: any, source: string, showToast: boolean);
        logWarning(message: string, data: any, source: string, showToast: boolean);
    }
    

    export class Logger implements ILogger {

        //#region Variables
        logFn: (msg: string, data?: any, moduleId?: any, showToast?: boolean) => void;
        service = {
            getLogFn: this.getLogFn,
            log: this.log,
            logError: this.logError,
            logSuccess: this.logSuccess,
            logWarning: this.logWarning
        };
        //#endregion

        Translate(langKey: string): string {
            return this.$filter("translate")(langKey);
        }
        
        constructor(private $log: ng.ILogService, private $filter: ng.IFilterService) {
            this.$log = $log;
            window.alert = (msg) => this.getLogFn("")(this.Translate(msg), "", true);
            window.info = window.alert;
            window.success = (msg) => this.getLogFn("", "success")(this.Translate(msg), "", true);
            window.error = (msg) => this.getLogFn("", "error")(this.Translate(msg), "", true);
            window.warning = (msg) => this.getLogFn("", "warning")(this.Translate(msg), "", true);
        }
        
        //#region Public Methods
        //TODO: see if there is a way to solve this more intuitive than returning an anonymous function
        getLogFn(moduleId: string, logFunctionName?: string): (msg: string, data?: any, showToast?: boolean) => void {
            logFunctionName = logFunctionName || 'log';
            switch (logFunctionName.toLowerCase()) { // convert aliases
                case 'success':
                    logFunctionName = 'logSuccess'; break;
                case 'error':
                    logFunctionName = 'logError'; break;
                case 'warn':
                    logFunctionName = 'logWarning'; break;
                case 'warning':
                    logFunctionName = 'logWarning'; break;
            }
            
            
            return (msg: string, data?: any, showToast?: boolean) => {
                this.logFn = this.service[logFunctionName] || this.service.log;
                this.logFn(msg, data, moduleId, (showToast === undefined) ? true : showToast);
            };
        }

        log(message: string, data: any, source: string, showToast: boolean)
        {
            this.logIt(message, data, source, showToast, 'info');
        }

        logWarning(message: string, data: any, source: string, showToast: boolean)
        {
            this.logIt(message, data, source, showToast, 'warning');
        }

        logSuccess(message: string, data: any, source: string, showToast: boolean)
        {
            this.logIt(message, data, source, showToast, 'success');
        }

        logError(message: string, data: any, source: string, showToast: boolean)
        {
            this.logIt(message, data, source, showToast, 'error');
        }

        //#endregion
        private logIt(message:string, data:any, source:string, showToast:any, toastType:string) {
            var write = (toastType === 'error') ? this.$log.error : this.$log.log;
            source = source ? '[' + source + '] ' : '';
            write(source, message, data);
            if (showToast) {
                if (toastType === 'error') {
                    toastr.error(message);
                } else if (toastType === 'warning') {
                    toastr.warning(message);
                } else if (toastType === 'success') {
                    toastr.success(message);
                } else {
                    toastr.info(message);
                }
            }
        }
    }

    // Register with angular
    commonModule.factory('logger', ['$log', '$filter', ($log, $filter) => new Logger($log, $filter)]);
}