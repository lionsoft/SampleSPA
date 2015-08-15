module App {

    /**
     * Наследуйте все директивы не имеющие html-темплейта от этого класса.
     * Стили будут загружаться относительно папки URL.NAVIS_DIRECTIVES_ROOT/<имя-директивы>. 
     * Скоуп, элемент и атрибуты директивы доступны через св-ва $scope, $element, $attrs.
     * По умолчанию доступны сервисы $parse, $compile, $sce 
     */
    export class Directive extends LionSoftAngular.Directive {

        /**
         * Do not override this method. Use methods this.PreLink, this.Link, this.Compile instead.
         */
        compile = (element, attrs, transclude) => {
            this.ngName = this.name || this.ngName;
            this.rootFolder = URL.DIRECTIVES_ROOT + this.getName(false) + "/";
            this.$element = element;
            this.$attrs = attrs;
            this.Compile(element, attrs, transclude);
            return {
                pre: (scope, element, attrs, controller, transclude) => {
                    this.$scope = scope;
                    this.PreLink(scope, element, attrs, controller, transclude);
                },
                post: (scope, element, attrs, controller, transclude) => this.Link(scope, element, attrs, controller, transclude)
            }
        };
    }
}