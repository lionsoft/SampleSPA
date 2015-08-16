'use strict';

// ReSharper disable InconsistentNaming
module App {

    export interface IUser {
        Id: string;
        Login: string;
        Name: string;
    }

    export interface IAutenticationService {

        IsLoggedIn: boolean;

        LoggedUser: IUser;

        LoggedUserId: string;

        Login(login: string, password: string, rememberMe: boolean): ng.IPromise<void>;

        Logout(): ng.IPromise<void>;
    }

    class AutenticationService implements IAutenticationService {

        static $inject = ['$rootScope'];

        constructor(private $rootScope) {
            this.LoggedUser = app['__loggedUser'];
            app['__loggedUser'] = undefined;
            app.$auth = this;
            $rootScope.$auth = this;
        }

        get IsLoggedIn(): boolean { return !!this.LoggedUser; }

        LoggedUser: IUser;

        get LoggedUserId() { return this.LoggedUser ? this.LoggedUser.Id : undefined; }

        Login(login: string, password: string, rememberMe: boolean): ng.IPromise<void> {
            return <any>app.api.Account.Login(login, password, rememberMe).ExtractError().then(user => this.LoggedUser = user);
        }

        Logout(): ng.IPromise<void> {
            return app.api.Account.Logout().HandleError().then(() => this.LoggedUser = undefined);
        }


    }

    App.Shared.commonModule.service('$auth', AutenticationService);
} 