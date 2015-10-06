declare module st {

    interface IPaginationConfig {
        template: string,
        itemsByPage: number,
        displayedPages: number,
    }
    interface ISearchConfig {
        delay: number, // ms
        inputEvent: string,
    }
    interface ISelectConfig {
        mode: string,
        selectedClass: string,
    }
    interface ISortConfig {
        ascentClass: string,
        descentClass: string,
        skipNatural: boolean,
    }
    interface IPipeConfig {
        delay: number, //ms
    }

    interface IConfig {
        pagination: IPaginationConfig;
        search: ISearchConfig;
        select: ISelectConfig;
        sort: ISortConfig;
        pipe: IPipeConfig;    
    }

    interface ITableState {
        sort: {
            predicate: Function | string;
            reverse: boolean;
        };
        search: {
            predicateObject: { $?: string };
        };
        pagination: {
            /**
             * Starting item index
             */
            start: number;
            /**
             * Page size (count items on one page)
             */
            number: number;
            /**
             * Total count of the pages
             */
            numberOfPages?: number;
        }
    }

    interface IController {
        /**
         * sort the rows
         * @param {Function | String} predicate - function or string which will be used as predicate for the sorting
         * @param [reverse] - if you want to reverse the order
         */
        sortBy(predicate: Function | string, reverse: boolean);

        /**
         * search matching rows
         * @param {String} input - the input string
         * @param {String} [predicate] - the property name against you want to check the match, otherwise it will search on all properties
         */
        search(input: string, predicate: string);

        /**
        * this will chain the operations of sorting and filtering based on the current table state (sort options, filtering, ect)
        */
        pipe();

        /**
         * select a dataRow (it will add the attribute isSelected to the row object)
         * @param {Object} row - the row to select
         * @param {String} [mode] - "single" or "multiple" (multiple by default)
         */
        select(row: Object, mode: string);

        /**
         * take a slice of the current sorted/filtered collection (pagination)
         *
         * @param {Number} start - start index of the slice
         * @param {Number} number - the number of item in the slice
         */
        slice(start: number, number: number);

        /**
         * return the current state of the table
         * @returns {{sort: {}, search: {}, pagination: {start: number}}}
         */
        tableState(): ITableState;


        getFilteredCollection();

        /**
         * Use a different filter function than the angular FilterFilter
         * @param filterName the name under which the custom filter is registered
         */
        setFilterFunction(filterName: string);

        /**
         * Use a different function than the angular orderBy
         * @param sortFunctionName the name under which the custom order function is registered
         */
        setSortFunction(sortFunctionName: string);

        /**
         * Usually when the safe copy is updated the pipe function is called.
         * Calling this method will prevent it, which is something required when using a custom pipe function
         */
        preventPipeOnWatch();
    }
}