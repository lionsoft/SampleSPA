'use strict';

module App.Controllers {

    class Page1 extends PageController {

        Init() {
        }

        Activated() {
        }

        selectedItem: string;
        selectedDate;
        selectedTime;
        selectedDateTime;

        showToast(type: string) {
            switch (type) {
                case 'alert':
                    alert('alert/info');
                    break;
                case 'success':
                    success('success');
                    break;
                case 'warning':
                    warning('warning');
                    break;
                case 'error':
                    error('error');
            }
        }
    }

    app.controller('page1', Page1.Factory());

} 