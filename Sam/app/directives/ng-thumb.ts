module App {

    /**
    * The ng-thumb directive
    * @author: nerv
    * @version: 0.1.2, 2014-01-09
    */
    class NgThumb extends Directive {
        restrict = 'A';

        template = '<canvas />';

        isSupportFile(): boolean {
            return !!(this.$window['FileReader'] && this.$window['CanvasRenderingContext2D']);
        }

        isFile(item): boolean {
            return angular.isObject(item) && item instanceof this.$window['File'];
        }

        isImage(file): boolean {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|png'.indexOf(type) !== -1;
        }

        isUrl(file) {
            return typeof file === "string";
        }

        isSupportedImage(file) {
            return this.isSupportFile() && (this.isUrl(file) || this.isFile(file) && this.isImage(file));
        }


        onLoadImage(img, params, el) {
            var left = 0;
            var top = 0;
            var width = img.width;
            var height = img.height;
            if (params.stretch) {
                width = params.width || img.width / img.height * params.height;
                height = params.height || img.height / img.width * params.width;
            } else {
                params.width = params.width || width;
                params.height = params.height || height;

                if (width <= params.width && height <= params.height) {
                    left = (params.width - width) / 2;
                    top = (params.height - height) / 2;
                }
                else if (width > params.width && height <= params.height) {
                    width = params.width;
                    height = img.height / img.width * params.width;
                    top = (params.height - height) / 2;
                }
                else if (width <= params.width && height > params.height) {
                    height = params.height;
                    width = img.width / img.height * params.height;
                    left = (params.width - width) / 2;
                } else {
                    if (img.width > img.height) {
                        width = params.width;
                        height = img.height / img.width * params.width;
                        top = (params.height - height) / 2;
                    } else {
                        height = params.height;
                        width = img.width / img.height * params.height;
                        left = (params.width - width) / 2;
                    }
                }
            }

            var canvas = el.find('canvas');
            canvas.attr({ width: width + left, height: height + top });
            canvas[0].getContext('2d').drawImage(img, left, top, width, height);
        }


        Link(scope, element, attributes) {
            var params = scope.$eval(attributes.ngThumb);
            if (this.isSupportedImage(params.file)) {
                var img = new Image();
                img.onload = ev => this.onLoadImage(ev.target, params, element);

                if (this.isUrl(params.file)) {
                    img.src = params.file;
                } else {
                    var reader = new FileReader();
                    reader.onload = (event) => img.src = event.target['result'];
                    reader.readAsDataURL(params.file);
                }
            }
        }
    }

    app.directive('ngThumb', NgThumb.Factory());
}
