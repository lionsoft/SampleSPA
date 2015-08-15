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
        private common: App.Shared.ICommon;
        private config: any;
        private $rootScope: any;
        //#endregion

        constructor($rootScope: any, common: App.Shared.ICommon, config: any)
        {
            this.common = common;
            this.config = config;
            this.$rootScope = $rootScope;

            this.activate();
            this.registerEvents();
        }
        public toggleSpinner(on: boolean): void {
            this.isBusy = on;
        }

        private activate()
        {
            var logger = this.common.logger.getLogFn(this.controllerId, 'success');
            logger('Hot Towel Angular loaded!', null, true);

            this.common.activateController([], this.controllerId);
        }

        private registerEvents()
        {
            var events = this.config.events;
            this.$rootScope.$on('$routeChangeStart',
                (event, next, current) => { this.toggleSpinner(true); }
            );

            this.$rootScope.$on(events.controllerActivateSuccess,
                data => { this.toggleSpinner(false); }
            );

            this.$rootScope.$on(events.spinnerToggle,
                data => { this.toggleSpinner(data.show); }
            );
        }


    }

    // Register with angular
    app.controller(Shell.controllerId,
        ['$rootScope', 'common', 'config',
            ($rS, com, con) => new Shell($rS, com, con)]);
}