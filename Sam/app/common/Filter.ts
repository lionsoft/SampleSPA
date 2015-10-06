module App {

    export class Filter extends LionSoftAngular.Filter {

        $filter: ng.IFilterService;

        protected static addFactoryInjections(injects: string[]) {
            LionSoftAngular.Filter.addFactoryInjections(injects);
            this.addInjection(injects, "$filter");
        }

        Translate(langKey: string): string {
            return this.$filter("translate")(langKey);
        }

    }
}