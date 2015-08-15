'use strict';

module App {

    export interface IUser {
        Id: string;
    }

    export interface IAutenticationService {

        IsLoggedIn: boolean;

        LoggedUser: IUser;

        LoggedUserId: string;
    }

    class AutenticationService implements IAutenticationService {

        static $inject = ['$rootScope'];

        constructor(private $rootScope) {
            this.LoggedUser = app['__loggedUser'];
            app['__loggedUser'] = undefined;
            app.$auth = this;
            $rootScope.$auth = this;
        }

        public get IsLoggedIn(): boolean { return !!this.LoggedUser; }

        public LoggedUser: IUser;

        public get LoggedUserId() { return this.LoggedUser ? this.LoggedUser.Id : undefined; }
    }

    App.Shared.commonModule.service('$auth', AutenticationService);
} 