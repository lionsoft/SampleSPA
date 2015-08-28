module App.Utils.ResizeListener {
    
    // http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/

    //#region - Init section -
    var attachEvent = document['attachEvent'];
    var isIe = navigator.userAgent.match(/Trident/);
    var requestFrame = (() => {
        var raf = window.requestAnimationFrame || window['mozRequestAnimationFrame'] || window['webkitRequestAnimationFrame'] ||
            (fn => window.setTimeout(fn, 20));
        return fn => raf(fn);
    })();

    var cancelFrame = (() => {
        var cancel = window.cancelAnimationFrame || window['mozCancelAnimationFrame'] || window['webkitCancelAnimationFrame'] ||
            window.clearTimeout;
        return id => cancel(id);
    })();

    function resizeListener(e) {                           
        var win = e.target || e.srcElement;
        if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
        win.__resizeRAF__ = requestFrame(() => {
            var trigger = win.__resizeTrigger__;
            trigger.__resizeListeners__.forEach(fn => fn.call(trigger, e));
        });
    }

    // ReSharper disable once Class
    function objectLoad(e) {
        this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
        this.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }
    //#endregion

    /**
     * Подписка на событие изменения размера любого HTML-элемента.
     * @param element HTML-элемент, изменение размера которого нас интересует
     * @param fn метод, вызываемый при изменении размера
     */
    export function AddResizeListener(element: HTMLElement, fn: (e: HTMLElement) => void) {
        if (!element['__resizeListeners__']) {
            element['__resizeListeners__'] = [];
            if (attachEvent) {
                element['__resizeTrigger__'] = element;
                element['attachEvent']('onresize', resizeListener);
            }
            else {
                if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
                var obj = element['__resizeTrigger__'] = document.createElement('object');
                obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                obj['__resizeElement__'] = element;
                obj.onload = objectLoad;
                obj.type = 'text/html';
                if (isIe) element.appendChild(obj);
                obj.data = 'about:blank';
                if (!isIe) element.appendChild(obj);
            }
        }
        element['__resizeListeners__'].push(fn);
    };

    /**
     * Отмена подписки на событие изменения размера любого HTML-элемента.
     * @param element HTML-элемент, на который была сделана подписка
     * @param fn отписываемый метод
     */
    export function RemoveResizeListener(element: HTMLElement, fn: (e: HTMLElement) => void) {
        element['__resizeListeners__'].splice(element['__resizeListeners__'].indexOf(fn), 1);
        if (!element['__resizeListeners__'].length) {
            if (attachEvent) element['detachEvent']('onresize', resizeListener);
            else {
                if (element['__resizeListeners__'].contentDocument) {
                    element['__resizeListeners__'].contentDocument.defaultView.removeEventListener('resize', resizeListener);
                    element['__resizeListeners__'] = !element.removeChild(element['__resizeTrigger__']);
                }
            }
        }
    }


    export function Attach(elements: HTMLElement[]| HTMLElement|JQuery|JQuery[]|angular.IAugmentedJQuery|angular.IAugmentedJQuery[]|any[], fn: (e: HTMLElement) => void): () => void {
        if ("[object Array]" === Object.prototype.toString.call(elements)
            || ('undefined' !== typeof window['jQuery'] && elements instanceof window['jQuery']) //jquery
            || ('undefined' !== typeof window['Elements'] && elements instanceof window['Elements']) //mootools
            ) {
            var detaches = [];
            var i = 0, j = elements['length'];
            for (; i < j; i++) {
                detaches.push(Attach(elements[i], fn));
            }
            return () => {
                var i = 0, j = detaches.length;
                for (; i < j; i++) {
                    detaches[i]();
                };
            }
        } else {
            var element = <HTMLElement>elements;
            AddResizeListener(element, fn);
            return () => RemoveResizeListener(element, fn);
        }
    }
} 