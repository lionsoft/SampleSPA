using System.Web.Optimization;

namespace Sam
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = false;

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include("~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/styles/css").Include(
                  "~/content/reset.css"
                , "~/content/ie10mobile.css"
                , "~/content/bootstrap.min.css"
                , "~/content/font-awesome.min.css"

                , "~/Content/css/select2.css"
                , "~/Content/select.css"

                , "~/content/toastr.css"
                , "~/Content/loading-bar.min.css"

                , "~/content/bootstrap-datetimepicker.css"

                , "~/content/customtheme.css"
                , "~/content/styles.css"
            ));



            bundles.Add(new StyleBundle("~/appstyles/css").IncludeDirectory(
                  "~/app/css", "*.css"
            ));


            bundles.Add(new ScriptBundle("~/bundles/vendor").Include(
                  "~/scripts/jquery-{version}.js"

                , "~/scripts/angular.js"
                , "~/scripts/angular-animate.js"
                , "~/scripts/angular-route.js"
                , "~/Scripts/angular-resource.js"
                , "~/scripts/angular-sanitize.js"
                , "~/Scripts/angular-translate.js"
                , "~/Scripts/angular-translate-loader-static-files.js"
                , "~/Scripts/angular-ui/ui-bootstrap.js"
                , "~/Scripts/angular-ui/ui-bootstrap-tpls.js"

                , "~/Scripts/select2.js"
                , "~/Scripts/angular-ui.js"
                , "~/Scripts/select.js"

                , "~/Scripts/smart-table.js"

                , "~/Scripts/linq.js"
                , "~/Scripts/linq.jquery.js"
                , "~/Scripts/linq.array.js"

                , "~/scripts/bootstrap.js"
                , "~/Scripts/respond.js"
                , "~/scripts/ui-bootstrap-tpls-{version}.js"


                , "~/Scripts/ResizeSensor/ResizeSensor.js"
                , "~/Scripts/ResizeSensor/ElementQueries.js"


                //, "~/scripts/moment.js"
                , "~/Scripts/moment-with-locales.js"

                , "~/scripts/spin.js"
                , "~/scripts/toastr.js"
                , "~/Scripts/loading-bar.js"
                , "~/Scripts/oclazyload.js"
                , "~/Scripts/angular-file-upload.min.js"
                , "~/Scripts/bootstrap-datetimepicker.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/LionSoftJs")
                .IncludeDirectory("~/app/common/LionSoftJs/js.net", "*.js")
                .Include(
                    "~/app/common/LionSoftJs/LionSoftJs-{version}.js"
                )
            );
            bundles.Add(new ScriptBundle("~/bundles/LionSoftAngular").Include(
                      "~/app/common/LionSoft.Angular/LionSoft.Angular-{version}.js"
                    , "~/app/common/LionSoft.Angular/fieldset.js"
                    , "~/app/common/LionSoft.Angular/ng-inverted.js"
                    , "~/app/common/LionSoft.Angular/ng-popup.js"
                    , "~/app/common/LionSoft.Angular/ng-tag.js"
                    , "~/app/common/LionSoft.Angular/ng-match.js"
                    , "~/app/common/LionSoft.Angular/nv-fill-container.js"
            ));
            bundles.Add(new ScriptBundle("~/bundles/app")
                .IncludeDirectory("~/app/consts", "*.js")
                .Include(
                      "~/app/l10n.js"
                    , "~/app/app.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap")
                .Include(
                    // !--Bootstrapping-- >
                      "~/app/config.js"
                    , "~/app/config.exceptionHandler.js"
                    , "~/app/config.l10n.js"
                    , "~/app/config.route.js"

                    // !--common Modules-- >
                    , "~/app/common/common.js"
                    , "~/app/common/commonConfig.js"
                    , "~/app/common/logger.js"
                    , "~/app/common/spinner.js"


                    // !--common.bootstrap Modules-- >
                    , "~/app/common/bootstrap/bootstrap.dialog.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/app/common")
                .Include(
                      "~/app/common/utils/Color.js"
                    , "~/app/common/utils/DateTime.js"
                    , "~/app/common/utils/Icon.js"
                    , "~/app/common/utils/Json.js"
                    , "~/app/common/utils/ng.js"
                    , "~/app/common/utils/ResizeListener.js"
                    , "~/app/common/utils/SmartTable.js"

                    , "~/app/common/Controller.js"
                    , "~/app/common/Filter.js"
                    , "~/app/common/EnumFilter.js"
                    , "~/app/common/Service.js"
                    , "~/app/common/Directive.js"
                    , "~/app/common/TemplatedDirective.js"
                )
                .IncludeDirectory("~/app/decorators", "*.js", false)
                .IncludeDirectory("~/app/filters", "*.js", false)
            );

            bundles.Add(new ScriptBundle("~/bundles/app/directives")
                .Include(
                      "~/app/directives/cc/cc-menu-item-rendered.js"
                    , "~/app/directives/cc/cc-sidebar.js"
                    , "~/app/directives/cc/cc-spinner.js"
                )
                .IncludeDirectory("~/app/directives", "*.js", true)
            );

            bundles.Add(new ScriptBundle("~/bundles/app/services")
                .Include(
                      "~/app/services/system/ODataFilterCreator.js"
                    , "~/app/services/system/OData.js"
                    , "~/app/services/system/AutenticationService.js"
                    , "~/app/services/system/CRUDService.js"
                    , "~/app/services/system/ApiServiceBase.js"
                )
                .IncludeDirectory("~/app/services", "*.js", false)
            );


            bundles.Add(new ScriptBundle("~/bundles/app/routes")
                .Include(
                      "~/app/routes.js"
                )
                .IncludeDirectory("~/app/routes", "*.js", true)
            );

            bundles.Add(new ScriptBundle("~/bundles/app/views")
                .Include(
                      "~/app/layout/shell.js"
                )
//                .IncludeDirectory("~/app/views", "*.js", true)
            );

        }
    }
}
