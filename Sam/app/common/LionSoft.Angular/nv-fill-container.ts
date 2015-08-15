declare var ResizeSensor;

module LionSoftAngular {

    /**
     * Автоматически расширяет все непосредственные дочерние элементы, помеченные атрибутом nv-fill-height до заполнения высоты контейнера.
     *
     *  Чтобы это работало необходимо выполнение следующих условий:
     *   1. Контейнер должен иметь фиксированную высоту.
     *   2. Непосредственные элементы контейнера должны находиться в потоке и не должны быть обтекаемыми.
     *   3. Пропорциональность растягивания нескольких авторазмерных элементов можно управлять значениями атрибута nv-fill-height (относительная высота в процентах)
     *
     * Примеры:
     *    <body nv-fill-container>
     *      <div>Header</div>
     *      <div nv-fill-height='10'>Content - 10%</div>
     *      <div nv-fill-height>Content - 25%</div>
     *      <div nv-fill-height>Content - 25%</div>
     *      <div nv-fill-height='40'>Content - 40%</div>
     *      <div>Footer</div>
     *    </body>
     */
    class NvFillContainer extends Directive {

        restrict = 'A';

        doResize(scope, element) {
            var fillHeight = element.height();
            $.each(scope.$$nvFillContainer_fixedElements, (index, child) => {
                fillHeight -= child.outerHeight(true);
            });
            var restHeight = fillHeight;
            $.each(scope.$$nvFillContainer_fillElements, (index, child) => {
                if (index < scope.$$nvFillContainer_fillElements.length - 1) {
                    var currentSize = (child[0].$$nvHeight * fillHeight) / 100;
                    child.outerHeight(currentSize);
                    restHeight -= currentSize;
                }
                else {
                    child.outerHeight(restHeight);
                }
            });
        }

        Link(scope, element: ng.IAugmentedJQuery, attrs, controller, transclude) {

            scope.$$nvFillContainer_fillElements = [];
            scope.$$nvFillContainer_fixedElements = [];
            var totalFillPercents = 0;
            var zeroFillPercentCount = 0;
            $.each(element.children(), (index, element) => {
                var child = $(element);
                if (child.css("display") !== 'none'
                    && element.nodeName !== "STYLE"
                    && element.nodeName !== "SCRIPT"
                    && child.css("position") !== 'absolute'
                    && child.css("position") !== 'fixed')
                {
                    var fillHeight = <any>child.attr("nv-fill-height");
                    if (fillHeight !== undefined && fillHeight !== false) {
                        var res = fillHeight === "" ? 0 : parseFloat(fillHeight);
                        element.$$nvHeight = isFinite(res) ? res : 0;
                        if (element.$$nvHeight)
                            zeroFillPercentCount++;
                        else
                            totalFillPercents += element.$$nvHeight;
                        scope.$$nvFillContainer_fillElements.push(child);
                    }
                    else if (element.offsetHeight > 0) {
                        scope.$$nvFillContainer_fixedElements.push(child);
                    }
                }
            });

            if (scope.$$nvFillContainer_fillElements.length > 0) {

                var resPercents = 100 - totalFillPercents;
                if (zeroFillPercentCount > 0 && resPercents > 0) {
                    for (var n = 0; n < scope.$$nvFillContainer_fillElements.length; n++) {
                        // для fill-height элементов с неустановленым значением - распределяем остаток поровну между елементами
                        var el = scope.$$nvFillContainer_fillElements[n][0];
                        if (el.$$nvHeight === 0)
                            el.$$nvHeight = resPercents / zeroFillPercentCount;
                    }
                }

                for (var i = 0; i < scope.$$nvFillContainer_fixedElements.length; i++) {
                    // ReSharper disable once WrongExpressionStatement
                    new ResizeSensor(scope.$$nvFillContainer_fixedElements[i], () => this.doResize(scope, element));
                }
                // ReSharper disable once WrongExpressionStatement
                new ResizeSensor(element, () => this.doResize(scope, element));

                this.doResize(scope, element);
            }
        }
    }
    LionSoftAngular.Module
        .directive("nvFillContainer", NvFillContainer.Factory())
    ;

}  