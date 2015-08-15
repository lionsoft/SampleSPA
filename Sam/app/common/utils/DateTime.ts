module App.Utils.DateTime {

    /**
     * Преобразует строковое представление Newton.Json и Asp.Net даты в Date.
     */
    export function ToDate(obj: string): Date {
        var res: Date = <any>obj;
        if (obj.length >= 19
            && obj[4] === "-"
            && obj[7] === "-"
            && obj[10] === "T"
            && obj[13] === ":"
            && obj[16] === ":"
            )
            try { res = new Date(obj); } catch (e) { } 
        // преобразование Asp.Net даты      
        else if (obj.indexOf("/Date(") === 0)
            try { res = new Date(parseInt(obj.substr(6))); } catch (e) { }
        return res;
    }
}
 