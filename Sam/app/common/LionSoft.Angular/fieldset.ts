module LionSoftAngular {

    /**
     * Обеспечивает корректную работу директивы ng-disabled для тега <fieldset>.
     * По умолчанию в IE элементы <input>, несмотря на то, что становятся серыми, позволяют получать фокус и вводить данные.
     * Примеры:
     *      <form>
     *          <fieldset ng-disabled="true">
     *              <input />
     *              <input />
     *          </fieldset>
     *      </form>
     */
    class Fieldset extends Directive {

        restrict = 'E';

        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction) {

            var disabledElement = (attrs['disableElementId']) ? document.getElementById(attrs['disableElementId']) : element[0];

            scope.$watch(attrs['ngDisabled'], isDisabled => {
                if (isDisabled)
                    this.disableAll(disabledElement);
                else
                    this.enableAll(disabledElement);
            });

            scope.$on('$destroy', () => this.enableAll(disabledElement));
        }

        /**
        * Disables everything in the given element.
        *
        * @param {HTMLElement} element
        */
        private disableAll(element) {
            angular.element(element).addClass('disable-all');
            element.style.color = 'gray';
            this.disableElements([element]);
            this.disableElements(element.getElementsByTagName('fieldset'));
            this.disableElements(element.getElementsByTagName('input'));
            this.disableElements(element.getElementsByTagName('button'));
            this.disableElements(element.getElementsByTagName('textarea'));
            element.addEventListener('click', this.preventDefault, true);
        }

        /**
        * Enables everything in the given element.
        *
        * @param {HTMLElement} element
        */
        private enableAll(element) {
            angular.element(element).removeClass('disable-all');
            element.style.color = 'inherit';
            this.enableElements([element]);
            this.enableElements(element.getElementsByTagName('fieldset'));
            this.enableElements(element.getElementsByTagName('input'));
            this.enableElements(element.getElementsByTagName('button'));
            this.enableElements(element.getElementsByTagName('textarea'));
            element.removeEventListener('click', this.preventDefault, true);
        }

        /**
        * Callback used to prevent user clicks.
        *
        * @param {Event} event
        * @returns {boolean}
        */
        private preventDefault(event) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        }

        /**
        * Disables given elements.
        *
        * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be disabled
        */
        private disableElements(elements) {
            var len = elements.length;
            for (var i = 0; i < len; i++) {
                if (elements[i].disabled === false) {
                    elements[i].disabled = true;
                    elements[i].disabledIf = true;
                }
            }
        }

        /**
         * Enables given elements.
         *
        * @param {Array.<HTMLElement>|NodeList} elements List of dom elements that must be enabled
        */
        private enableElements(elements) {
            var len = elements.length;
            for (var i = 0; i < len; i++) {
                if (elements[i].disabled === true && elements[i].disabledIf === true) {
                    elements[i].disabled = false;
                    elements[i].disabledIf = null;
                }
            }
        }
    }

    LionSoftAngular.Module.directive("fieldSet", Fieldset.Factory());
}  