module App.Utils.SmartTable {
    
    export function EncodeFieldNames(src: string): string {
        return src.replace(/ /g, '').replace(/\,/g, '___$___').replace(/\./g, '___$_$___').replace(/\//g, '___$_$___').replace(/\*/g, '___$_$_$___').replace(/\:/g, '___$_$_$_$___');
    }

    export function DecodeFieldNames(src: string): string {
        return src.replace(/___\$___/g, ',').replace(/___\$_\$___/g, '.').replace(/___\$_\$_\$___/g, '*').replace(/___\$_\$_\$_\$___/g, ':');
    }

} 