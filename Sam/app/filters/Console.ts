'use strict';
module App.Filters {

    class ConsoleFilter extends Filter
    {
        Execute(value) {
            console.log(value);
            return "";
        }
    }

    app.filter("console", ConsoleFilter.Factory());
}