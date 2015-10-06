module App {

    /**
     * Наследуйте фильтры, которые обрабатываеют перечисления от этого класса.
     * 
     * В классе наследнике достаточно только указать массив значений перечисления и их ключи локализации в качестве описания.
     * 
     * В разметке фильтр используется преобразования значения перечисления в его локализованное описание:
     *    <span>{{enumValue | myEnumFilter}}</span>
     *
     * а также для получения списка элементов перечисления:
     *    
     *    <ul ng-repeat='enumValue in [] | myEnumFilter'>
     *        <li>{{enumValue | myEnumFilter}}</li>
     *    </ul>
     * 
     */
    export class EnumFilter extends Filter {

        Source : IKeyValue[];

        public Execute(value: number | number[], ...params): any | any[] {
            if (value === undefined) return "";
            if (angular.isArray(value)) {
                return this.Source.select(k => k.Key).toArray();
            } else {
                return this.Source.where(k => k.Key == <any>value).select(k => this.Translate(k.Value)).firstOrDefault();
            }
        }
    }
}