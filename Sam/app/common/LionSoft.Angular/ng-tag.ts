module LionSoftAngular {

    /**
     * Оборачивает контекст в виде ярлычка-тэга (используется стиль TwitterBootstrap).
     * Возможно использование как выражения (значение атрибута), так и конкретного значения - значение контента.
     * Примеры:
     *      <span ng-tag>Tag1</span>
     *      <span ng-tag='$.TagName'></span>
     *      <ng-tag><a href='#'>RefTeg</a></ng-tag>
     */
    class NgTag extends TemplatedDirective {

        Declare(d: ng.IDirective) {
            d.transclude = true;
            d.scope = { tag: '=' + this.name };
        }

        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction) {
            element.on('mouseover', (event: JQueryEventObject) => { });
        }
    }

    /**
     * Вывод массива строк в виде строки ярлычков-тегов (используется стиль TwitterBootstrap).
     * Используется значение атрибута как выражения для получения списка строк-значений тегов.
     * Примеры:
     *      <div ng-tags='$.TagNames'></div>
     */
    class NgTags extends TemplatedDirective {
        
        Declare(d: ng.IDirective) {
            d.restrict = 'A';
            d.scope = { tags: '=' + this.name };
        }
    }

    LionSoftAngular.Module
        .directive("ngTag", NgTag.Factory())
        .directive("ngTags", NgTags.Factory())
    ;

} 