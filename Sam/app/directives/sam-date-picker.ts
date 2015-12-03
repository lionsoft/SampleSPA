'use strict';

declare module BootstrapV3DatetimePicker {
    interface DatetimepickerOptions {
        widgetPositioning?: { horizontal: string; vertical: string };
/*
        format?: string;
        locale?: string;
        inline?: boolean;
        showTodayButton?: boolean;
*/
        showClear?: boolean;
        keyBinds?: any;
    }
}

module App.Directives {

    class SamDatePicker extends Directive {

        restrict = 'A';

        require = "?ngModel";

        scope = {
            samUseCurrent: '=',
            samWidgetPositioning: '=',
            samInline: '=',
            samIsTime: '=',
            samViewDate: '=',
            samNewData: '=',
            samShowTodayButton: '=',
            samBeforeShowDay: '&'
        };


        Link(scope, element, attrs, controller: ng.INgModelController, transclude) {

            var elemParent = element.parent();

            var inputGroup: JQuery;
            var btnIconClass: string;

            if (!scope.samInline) {
                inputGroup = angular.element('<div>').addClass('input-group');
                var inputGroupBtn = angular.element('<span>').addClass('input-group-addon');
                btnIconClass = this.GetButtonIcon();
                var inputBtnIcon = angular.element('<i>').addClass(btnIconClass);
                element.addClass('form-control');
                inputGroupBtn.append(inputBtnIcon);
                inputGroupBtn[0].style.cursor = 'pointer';

                inputGroup.append(element);
                inputGroup.append(inputGroupBtn);

                elemParent.append(inputGroup);
            }

            var config: BootstrapV3DatetimePicker.DatetimepickerOptions = {
                // значения по-умолчанию
                locale: 'en',
                showTodayButton: !(scope.samShowTodayButton === false),
                inline: scope.samInline,
                showClear: true,
                keyBinds: null,
                widgetPositioning: {
                    horizontal: 'right',
                    vertical: 'auto'
                },
                // будет ли выводится в инпуте текущая дата-время
                useCurrent: !!scope.samUseCurrent
            }

            if (attrs.samWidgetPositioning) {
                config.widgetPositioning.horizontal = scope.samWidgetPositioning.horizontal;
                config.widgetPositioning.vertical = scope.samWidgetPositioning.vertical;
            }

            this.Configure(attrs, config, btnIconClass || null);

            var dtp = (inputGroup || element).datetimepicker(config);

            
            if (controller) {
                controller.$parsers.push(val => {
                    var date = moment(val, <string>config.format);
                    if (!date.isValid() || date.year() < 1950)
                        date = moment(controller.$modelValue, <string>config.format);
                    var res = (date && date.isValid() && date.year() > 1950) ? date.toDate() : undefined;
                    return res || null;

                });

                controller.$formatters.push(val => {
                    if (!config.format || !val) return "";
                    var retVal = moment(val).format(<string>config.format);
                    return retVal;
                });

                if (inputGroup)
                    inputGroup.on('dp.hide', () => {
                        controller.$setViewValue(element[0].value);
                    });
                else {
                    dtp.on("dp.change", (e) => {
                        controller.$setViewValue(e.date.toString());
                        scope.$emit("calendarViewChanged", e.date);
                    });

                    dtp.on("dp.update", (e) => {
                        scope.samViewDate = e.viewDate;
                        scope.$emit("calendarViewChanged", e.viewDate);
                    });
                }
            }
        }

        Configure(attrs, config: BootstrapV3DatetimePicker.DatetimepickerOptions, defaultIcon?: string) {
            // от формата зависит наличие/отсутствие выбора времени
            config.format = moment.localeData().longDateFormat("L");
        }

        GetButtonIcon() {
            return 'fa fa-calendar';
        }
    }

    class SamTimePicker extends SamDatePicker {
        Configure(attrs, config: BootstrapV3DatetimePicker.DatetimepickerOptions, defaultIcon?: string) {
            // от формата зависит наличие/отсутствие выбора времени
            config.format = moment.localeData().longDateFormat("LT");
        }
        GetButtonIcon() {
            return 'fa fa-clock-o';
        }
    }

    class SamDateTimePicker extends SamDatePicker {
        Configure(attrs, config: BootstrapV3DatetimePicker.DatetimepickerOptions, defaultIcon?: string) {
            // от формата зависит наличие/отсутствие выбора времени
            config.format = moment.localeData().longDateFormat("L") + " " + moment.localeData().longDateFormat("LT");
        }
    }

    app
        .directive('samDatePicker', SamDatePicker.Factory())
        .directive('samTimePicker', SamTimePicker.Factory())
        .directive('samDateTimePicker', SamDateTimePicker.Factory())
    ;
}