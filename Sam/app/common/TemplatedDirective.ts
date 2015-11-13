module App {

    /**
     * Наследуйте все директивы, имеющие html-темплейт от этого класса.
     * Темплейты и стили будут загружаться относительно папки URL.DIRECTIVES_ROOT/<имя-директивы>. 
     */
    export class TemplatedDirective extends LionSoftAngular.TemplatedDirective {

        promiseFromResult<T>(res: T): IPromise<T> {
            return <any>super.promiseFromResult(res);
        }

        templateUrl = (elem, attr) => {
            this.ngName = this.name || this.ngName;
            this.rootFolder = URL.DIRECTIVES_ROOT + this.getName(false) + "/";
            return this.GetTemplateUrl(elem, attr).ExpandPath(this.rootFolder);
        };
    }
}