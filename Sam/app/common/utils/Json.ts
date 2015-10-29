module App.Utils.Json {

    // Copied from angular-scenario.js
    // ReSharper disable InconsistentNaming
    export var APPLICATION_JSON = 'application/json';
    export var CONTENT_TYPE_APPLICATION_JSON = { 'Content-Type': APPLICATION_JSON + ';charset=utf-8' };
    export var JSON_START = /^\[|^\{(?!\{)/;
    export var JSON_ENDS = {
        '[': /]$/,
        '{': /}$/
    };
    export var JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/;
    // ReSharper restore InconsistentNaming


    /**
     * Json.Net может возвращать объекты или массывы объектов с перекрёстными или повторяющимися ссылками в
     * сокращённом варианте при котором повторяющищиеся объекты и ссылки на них передаются в виде идентификаторов.
     * Данный метод восстанавливает полных граф этих объектов.
     */
    export function ResolveReferences(source: any): any {
        var res;
        if (angular.isString(source)) {
            res = Utils.DateTime.ToDate(source);
        } else {
            var byid = {}, // all objects by id
                refs = []; // references to objects that could not be resolved

            res = (function recurse(obj, prop?: string|number, parent?: Object) {
                if (typeof obj !== 'object' || !obj) // a primitive value
                    return obj;

                if (obj !== null && Object.prototype.toString.call(obj) === '[object Array]') {
                    for (var i = 0; i < obj.length; i++)
                        // check also if the array element is not a primitive value
                        if (typeof obj[i] !== 'object' || !obj[i]) // a primitive value
                            continue;
                        else if ("$ref" in obj[i])
                            obj[i] = recurse(obj[i], i, obj);
                        else
                            obj[i] = recurse(obj[i], prop, obj);
                    return obj;
                }
                if ("$ref" in obj) { // a reference
                    var ref = obj.$ref;
                    if (ref in byid)
                        return byid[ref];
                    // else we have to make it lazy:
                    refs.push([parent, prop, ref]);
                    return undefined;
                } else {
                    var id = obj.$id;
                    if (id) {
                        delete obj.$id;
                        byid[id] = obj;
                    }

                    if ("$values" in obj) // an array
                        obj = obj.$values.map(recurse);
                    else { // a plain object
                        for (var p in obj) {
                            if (obj.hasOwnProperty(p))
                                obj[p] = recurse(obj[p], p, obj);
                        }
                    }
                }
/*
                } else if ("$id" in obj) {
                    var id = obj.$id;
                    delete obj.$id;

                    byid[id] = obj;

                    if ("$values" in obj) // an array
                        obj = obj.$values.map(recurse);
                    else { // a plain object
                        for (var p in obj) {
                            if (obj.hasOwnProperty(p))
                                obj[p] = recurse(obj[p], p, obj);
                        }
                    }
//                    byid[id] = obj;
                }
*/
                return obj;
            })(source); // run it!

            for (var i = 0; i < refs.length; i++) { // resolve previously unknown references
                var ref = refs[i];
                ref[0][ref[1]] = byid[refs[2]];
                // Notice that this throws if you put in a reference at top-level
            }
        }
        return res;
    }  


    /**
     * Проверяет, является ли строка корректной Json-строкой
     */
    export function IsJsonLike(str: string): boolean {
        var jsonStart = str.match(JSON_START);
        return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
    }


    
} 