'use strict';

module App.Controllers {

    export class Admin extends Controller {

        Test;
    
        Test1;

        Text: string = '333';

        SearchTextValue;

        Disabled: boolean = false;

        Init() {
            //this.title = GetAdminName("Admin");
        }

        //#region private methods
        activated() {
            this.log('Activated Admin View');
            this.Test1 = ['1111111111', '22222222222222', '333333333333333'];
/*
            this.$timeout(() => { this.Test = []; this.Test1 = this.Test.orderBy(s => s).toArray(); }, 1000);
            this.$timeout(() => { this.Test.push('5'); this.Test1 = this.Test.orderBy(s => s).toArray(); }, 4000);
            this.$timeout(() => { this.Test.push('4'); this.Test1 = this.Test.orderBy(s => s).toArray(); }, 2000);
            this.$timeout(() => { this.Test.push('3'); this.Test1 = this.Test.orderBy(s => s).toArray(); }, 3000);
*/
        }
        //#endregion

        SearchText(value) {
           // alert(value);
        }

        Clear() {
            this.SearchTextValue = '';
        }

        Switch() {
            //this.Disabled = !this.Disabled;
//            this.SearchTextValue = '1111';
        }
    }

    // Register with angular
    app.controller('admin', Admin.Factory());
}