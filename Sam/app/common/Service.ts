module App {

    /**
     * Наследуйте все ангуляр сервисы от этого класса. 
     * По умолчанию доступны сервисы NgObject плюс $http и $resource.
     * 
     * Пример инициализации:
     * app.service('myService', MyService.Factory('svc1', 'svc2'));
     */
    export class Service extends LionSoftAngular.Service {
    }
}