'use strict';

module App.Controllers {

    export class Login extends Controller {

        public login: string = "1";
        public password: string = "1";
        public textError: string;
        public inputType = "password";
        public rememberMe: boolean;
        public loginAction: string;

        HideShowPassword() {
            if (this.inputType === 'password')
                this.inputType = 'text';
            else
                this.inputType = 'password';
                $('#inputPassword').focus();
        }

        DoLogin() {
            app.$auth.Login(this.login, this.password, this.rememberMe)
                .then(() => this.$location.path(this.$rootScope['$priorLocation'] || "/"))
                .catch(e => this.textError = e);
        }
    }

    // Register with angular
    app.controller('login', Login.Factory());
}