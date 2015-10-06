'use strict';
module App.Shared {

    export interface ICommon {
        throttles: Object;
        activateController(promises: Array<ng.IPromise<any>>, controllerId: string);
        $broadcast(event: string, data: any);
        createSearchThrottle(viewmodel: any, list: string, filteredList: string, filter: string, delay: number): Function;
        debouncedThrottle(callback: Function, delay?: number, immediate?: boolean): void;
        debouncedThrottle(key: string, callback: Function, delay?: number, immediate?: boolean): void;
        isNumber(val: any): boolean;
        textContains(text: string, searchText: string): boolean;
        $q: ng.IQService;
        $rootScope: ng.IRootScopeService;
        $timeout: ng.ITimeoutService;
        commonConfig: any;
        logger: ILogger;

        currentWatchersCount(): number;
    }
    export class Common extends LionSoftAngular.Factory implements ICommon {

        //#region variables
        commonConfig: ICommonConfig;
        logger: ILogger;

        throttles: Object;
        //#endregion

        //#region public methods
        activateController(promises: Array<ng.IPromise<any>>, controllerId: string) {
            return this.$q.all(promises).then(this.broadcastSuccessEvent(controllerId));
        }

        private broadcastSuccessEvent(controllerId)
        {
            var data = { controllerId: controllerId };
            return this.$broadcast(this.commonConfig.config.controllerActivateSuccessEvent, data);
        }

        $broadcast(eventName: string, data: any) {
            return this.$rootScope.$broadcast.apply(this.$rootScope, arguments);
        }

        public createSearchThrottle(viewmodel: any, list: string, filteredList: string, filter: string, delay: number): Function {
            // After a delay, search a viewmodel's list using 
            // a filter function, and return a filteredList.

            // custom delay or use default
            delay = +delay || 300;
            // if only vm and list parameters were passed, set others by naming convention 
            if (!filteredList) {
                // assuming list is named sessions, filteredList is filteredSessions
                filteredList = 'filtered' + list[0].toUpperCase() + list.substr(1).toLowerCase(); // string
                // filter function is named sessionFilter
                filter = list + 'Filter'; // function in string form
            }

            // create the filtering function we will call from here
            var filterFn = () => {
                // translates to ...
                // vm.filteredSessions 
                //      = vm.sessions.filter(function(item( { returns vm.sessionFilter (item) } );
                viewmodel[filteredList] = viewmodel[list].filter
                    (
                    item => viewmodel[filter](item)
                    );
            };

            return (() => {
                // Wrapped in outer IFFE so we can use closure 
                // over filterInputTimeout which references the timeout
                var filterInputTimeout;

                // return what becomes the 'applyFilter' function in the controller
                return searchNow => {
                    if (filterInputTimeout) {
                        this.$timeout.cancel(filterInputTimeout);
                        filterInputTimeout = null;
                    }
                    if (searchNow || !delay) {
                        filterFn();
                    } else {
                        filterInputTimeout = this.$timeout(filterFn, delay);
                    }
                };
            })();
        }

        public debouncedThrottle(callback: Function, delay?: number, immediate?: boolean): void;
        public debouncedThrottle(key: string, callback: Function, delay?: number, immediate?: boolean): void;
        public debouncedThrottle(p1, p2, p3?, p4?): void {
            var key: string;
            var callback: Function;
            var delay: number;
            var immediate: boolean;
            if (typeof p1 === "function") {
                key = p1.toString().ToMd5();
                callback = p1;
                delay = p3;
                immediate = p4;
            } else {
                key = p1;
                callback = p2;
                delay = p3;
                immediate = p4;
            }


            // Perform some action (callback) after a delay. 
            // Track the callback by key, so if the same callback 
            // is issued again, restart the delay.

            var defaultDelay = 1000;
            delay = delay || defaultDelay;
            if (this.throttles[key]) {
                this.$timeout.cancel(this.throttles[key]);
                this.throttles[key] = undefined;
            }
            if (immediate) {
                callback();
            } else {
                this.throttles[key] = this.$timeout(<any>callback, delay);
            }
        }

        isNumber(val: any): boolean {
            // negative or positive
            return /^[-]?\d+$/.test(val);
        }

        textContains(text: string, searchText: string): boolean {
            return text && -1 !== text.toLowerCase().indexOf(searchText.toLowerCase());
        }
        //#endregion


        currentWatchersCount(): number {
            var root = angular.element(document.getElementsByTagName('body'));

            var watchers = [];

            var f = element => {
                angular.forEach(['$scope', '$isolateScope'], scopeProperty => {
                    if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                        angular.forEach(element.data()[scopeProperty].$$watchers, watcher => {
                            watchers.push(watcher);
                        });
                    }
                });

                angular.forEach(element.children(), childElement => {
                    f(angular.element(childElement));
                });
            };

            f(root);

            // Remove duplicate watchers
            var watchersWithoutDuplicates = [];
            angular.forEach(watchers, item => {
                if (watchersWithoutDuplicates.indexOf(item) < 0) {
                    watchersWithoutDuplicates.push(item);
                }
            });

            return watchersWithoutDuplicates.length;
        }

    }

    //#region explanation
    //-------STARTING COMMON MODULE----------
    // NB! script for this file must get loaded before the "child" script files

    // THIS CREATES THE ANGULAR CONTAINER NAMED 'common', A BAG THAT HOLDS SERVICES
    // CREATION OF A MODULE IS DONE USING ...module('moduleName', []) => retrieved using ...module.('...')
    // Contains services:
    //  - common
    //  - logger
    //  - spinner
    //#endregion
    export var commonModule: ng.IModule = angular.module('common', []); 
        
    // Creates "common" service
    commonModule.factory("common", Common.Factory('commonConfig', 'logger'));

}