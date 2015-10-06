'use strict';
module App.Filters {

    class YesNoFilter extends EnumFilter
    {
        Source =
        [
            { Key: false, Value: 'No' },
            { Key: true, Value: 'Yes' },
        ];
    }

    app.filter("YesNo", YesNoFilter.Factory());
}