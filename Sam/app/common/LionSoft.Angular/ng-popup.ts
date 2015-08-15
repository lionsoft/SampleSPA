// ReSharper disable InconsistentNaming
declare module LionSoftAngular {
    interface IModalInstance {
        close(result): any;
        dismiss(cancel: string): any;
    }

    interface IPopupDefaults {
        /** 
            Controls presence of a backdrop. 
            Allowed values: true (default), 
                            false(no backdrop), 
                            'static' - backdrop is present but modal window is not closed when clicking outside of the modal window.
        */
        backdrop?: any;

        /**
            Indicates whether the dialog should be closable by hitting the ESC key, defaults to true
        */
        keyboard?: boolean;

        /**
            Indicates whether the dialog should fade on opening, defaults to true
        */
        modalFade?: boolean;

        templateUrlBase?: string;

        defaultDialogTemplateUrl?: string;

        /**
            Additional CSS class(es) to be added to a modal window template
        */
        windowClass?: string; 

        /**
            Indicates whether the dialog should always return success promise when dialog is closed by $modalInstance.dismiss(), defaults to false
        */
        noCancelPromise?: boolean;
    }

    interface IPopupDialogOptions {
        templateUrl?: string;
        headerContent?: string;
        bodyContent?: string;
        yesButtonContent?: string;
        noButtonContent?: string;
        cancelButtonContent?: string;
        scope?: any;
                                                                               
        /* for prompt dialog */
        beforeInputContent?: string;
        afterInputContent?: string;
    }

    interface IPopupService {
        showDialog(dialogOptions: IPopupDialogOptions, popupDefaults?: IPopupDefaults): ng.IPromise<boolean>;

        popup<TResult>(templateUrl: string, scope?: any, popupDefaults?: IPopupDefaults): ng.IPromise<TResult>;
        popupModal<TResult>(templateUrl: string, scope?: any, popupDefaults?: IPopupDefaults): ng.IPromise<TResult>;

        info(text: string, header?: string): ng.IPromise<void>;
        alert(text: string, header?: string): ng.IPromise<void>;
        warning(text: string, header?: string): ng.IPromise<void>;
        error(text: string, header?: string): ng.IPromise<void>;
        confirm(text: string, header?: string): ng.IPromise<void>;
        ask(text: string, cancelButton: boolean, header?: string): ng.IPromise<boolean>;

        prompt(text: string, header?: string, value?: string, addParams?: IPopupDialogOptions): ng.IPromise<string>;
    }

    var popupDefaults: IPopupDefaults;
}

/*
declare module angular {
    interface IAttributes {
        ngPopup: string;
    }
}
*/

// ReSharper restore InconsistentNaming

module LionSoftAngular {

    LionSoftAngular.Module
        /**
        * Регистрирует сервис ангуляра для вызова Popup-окон.
        * Пример:
        *     popupService.info('Info message');
        */
        .service("popupService", ["$modal", "$q", function($modal, $q) {

                LionSoftAngular.popupDefaults = {
                    backdrop: true,
                    keyboard: true,
                    modalFade: true,
                    templateUrlBase: LionSoftJs.appFolder,
                    defaultDialogTemplateUrl: LionSoftAngular.rootFolder + 'html/ng-dialog.html'
                };

                this.popupModal = (templateUrl: string, scope?: any, popupDefaults?: LionSoftAngular.IPopupDefaults): ng.IPromise<any> => {
                    popupDefaults = popupDefaults || {};
                    popupDefaults.backdrop = 'static';
                    return this.showDialog({ templateUrl: templateUrl, scope: scope }, popupDefaults);
                };

                this.popup = (templateUrl: string, scope?: any, popupDefaults?: LionSoftAngular.IPopupDefaults): ng.IPromise<any> => {
                    popupDefaults = popupDefaults || {};
                    popupDefaults.backdrop = LionSoftAngular.popupDefaults.backdrop;
                    return this.showDialog({ templateUrl: templateUrl, scope: scope }, popupDefaults);
                };

                this.showDialog = (dialogOptions: LionSoftAngular.IPopupDialogOptions, popupDefaults?: LionSoftAngular.IPopupDefaults): ng.IPromise<boolean> => {

                    popupDefaults = popupDefaults || {};

                    //Create temp objects to work with since we're in a singleton service
                    var tempPopupDefaults: LionSoftAngular.IPopupDefaults = {};

                    angular.extend(tempPopupDefaults, LionSoftAngular.popupDefaults, popupDefaults);

                    var tempDialogOptions: LionSoftAngular.IPopupDialogOptions = dialogOptions || {};
                    tempDialogOptions.templateUrl = tempDialogOptions.templateUrl || LionSoftAngular.popupDefaults.defaultDialogTemplateUrl;
                    if (!tempDialogOptions.yesButtonContent && !tempDialogOptions.noButtonContent && !tempDialogOptions.cancelButtonContent)
                        tempDialogOptions.yesButtonContent = "OK";

                    if (tempDialogOptions.yesButtonContent && (tempDialogOptions.noButtonContent || tempDialogOptions.cancelButtonContent)) {
                        tempPopupDefaults.backdrop = 'static';
                        tempPopupDefaults.keyboard = false;
                    } else if (tempPopupDefaults.noCancelPromise === undefined) {
                        tempPopupDefaults.noCancelPromise = true;
                    }

                    (<any>tempPopupDefaults).templateUrl = tempDialogOptions.templateUrl.ExpandPath(tempPopupDefaults.templateUrlBase) + "?" + Math.random();

                    (<any>tempPopupDefaults).controller = ["$scope", "$modalInstance", ($scope, $modalInstance: LionSoftAngular.IModalInstance) => {
                        angular.extend($scope, tempDialogOptions);
                        $scope.$modalInstance = $modalInstance;
                        $scope.ok = result => { $modalInstance.close(result); };
                        $scope.cancel = result => { $modalInstance.dismiss(result); };
                        $scope.close = () => { $modalInstance.close(undefined); };
                        $scope.hasYesButtonContent = isAssigned(tempDialogOptions.yesButtonContent);
                        $scope.hasNoButtonContent = isAssigned(tempDialogOptions.noButtonContent);
                        $scope.hasCancelButtonContent = isAssigned(tempDialogOptions.cancelButtonContent);
                        $scope.hasHeaderContent = isAssigned(tempDialogOptions.headerContent);
                        $scope.hasBodyContent = isAssigned(tempDialogOptions.bodyContent);
                    }];

                    var res = $modal.open(tempPopupDefaults).result;
                    if (tempPopupDefaults.noCancelPromise) {
                        //var resDeffered = App.defer<boolean>();
                        var resDeffered = $q.defer();
                        res.then(r => resDeffered.resolve(r)).catch(r => resDeffered.resolve(r));
                        return resDeffered.promise;
                    } else {
                        return res;
                    }
                };

                this.info = (text: string, header?: string): ng.IPromise<void> => {
                    return this.showDialog({ bodyContent: text, headerContent: header || "Information", panelClass: "panel-info" });
                };
                this.alert = this.info;
                this.warning = (text: string, header?: string): ng.IPromise<void> => {
                    return this.showDialog({ bodyContent: text, headerContent: header || "Warning", panelClass: "panel-warning" });
                };
                this.error = (text: string, header?: string): ng.IPromise<void> => {
                    return this.showDialog({ bodyContent: text, headerContent: header || "Error", panelClass: "panel-danger" });
                };
                this.confirm = (text: string, header?: string): ng.IPromise<void> => {
                    return this.showDialog({
                        bodyContent: text,
                        headerContent: header || "Confirmation",
                        yesButtonContent: "Yes",
                        cancelButtonContent: "No",
                        panelClass: "panel-success",
                        isConfirmDialog: true,
                    });
                };
                this.ask = (text: string, cancelButton: boolean, header?: string): ng.IPromise<boolean> => {
                    return this.showDialog({
                        bodyContent: text,
                        headerContent: header || "Confirmation",
                        yesButtonContent: "Yes",
                        noButtonContent: "No",
                        cancelButtonContent: cancelButton ? "Cancel" : undefined,
                        panelClass: "panel-success",
                        isAskDialog: true,
                    });
                };

                this.prompt = (text: string, header?: string, value?: string, addParams?: IPopupDialogOptions): ng.IPromise<string> => {
                    var params = {
                        templateUrl: LionSoftAngular.rootFolder + "html/ng-prompt-dialog.html",
                        bodyContent: text,
                        headerContent: header || "Prompt",
                        yesButtonContent: "OK",
                        cancelButtonContent: "Cancel",
                        panelClass: "panel-success",
                        scope: { value: value },
                    };
                    angular.extend(params, addParams);
                    return this.showDialog(params);
                };

            }
        ]);

    /**
     * По клику на элементе открывает Popup-окно загруженное с темплейта, указанного в качестве значения параметра атрибута.
     * Пример:
     *      <a href='#' ng-popup="/Home/Test">RefTag</a>
     */
    class NgPopup extends Directive {

        restrict = 'A';

        popupService: IPopupService;

        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
            var ngPopupUrl = attrs[this.name];
            element.bind("click", () => this.popupService.popup(ngPopupUrl, scope));
        }
    }

    LionSoftAngular.Module.directive("ngPopup", NgPopup.Factory("popupService"));
}