'use strict';

module App.Controllers {

    export class Login extends Controller {

        public login: string = 'eleybov@gmail.com';
        public password: string = 'P@ssw0rd';
        public textError: string;
        public inputType: string = 'password';
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
                .then(() => this.$location.path(decodeURIComponent(this.$routeParams.returnUrl)))
                .catch(e => this.textError = e);
        }
    }

    // Register with angular
    app.controller('login', Login.Factory());
}