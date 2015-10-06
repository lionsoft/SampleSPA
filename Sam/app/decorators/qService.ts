'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     * Configure $q to return App.IPromise with HandleError and ExtractError methods
     */
    class QServiceDecorator extends LionSoftAngular.ServiceDecorator {

        public static addFactoryInjections(injects: string[]) {
            this.addInjection(injects, "$delegate");
        }

        Decorate($delegate) {
            var savedDefer = $delegate.defer;
            $delegate.defer = () => {
                var res = savedDefer();
                res.promise.HandleError = () => {
                    res.promise.catch(reason => {
                        console.error(reason);
                        ApiServiceBase.HandleError(reason);
                    });
                    return res.promise;
                };
                res.promise.ExtractError = () => {
                    var newRes1 = $delegate.defer();
                    res.promise
                        .then(r => newRes1.resolve(r))
                        .catch(reason => newRes1.reject(ApiServiceBase.ExctractError(reason)));
                    return newRes1.promise;
                };
                return res;
            }
        }
    }

    app.decorator("$q", QServiceDecorator.Factory());
}  
