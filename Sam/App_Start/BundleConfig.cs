using System.Web.Optimization;

namespace Sam
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include("~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                  "~/content/ie10mobile.css"
                , "~/content/bootstrap.min.css"
                , "~/content/font-awesome.min.css"
                , "~/content/toastr.css"
                , "~/content/customtheme.css"
                , "~/content/styles.css"
            ));

            bundles.Add(new StyleBundle("~/app/css").IncludeDirectory(
                  "~/app/css", "*.css"
            ));





            bundles.Add(new ScriptBundle("~/bundles/vendor").Include(
                  "~/scripts/jquery-{version}.js"
                , "~/scripts/angular.js"
                , "~/scripts/angular-animate.js"
                , "~/scripts/angular-route.js"
                , "~/scripts/angular-sanitize.js"
                , "~/scripts/bootstrap.js"
                , "~/scripts/toastr.js"
                , "~/scripts/moment.js"
                , "~/scripts/ui-bootstrap-tpls-{version}.js"
                , "~/scripts/spin.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                // !--Bootstrapping-- >
                  "~/app/app.js"
                , "~/app/config.js"
                , "~/app/config.exceptionHandler.js"
                , "~/app/config.route.js"

                // !--common Modules-- >
                , "~/app/common/common.js"
                , "~/app/common/commonConfig.js"
                , "~/app/common/logger.js"
                , "~/app/common/spinner.js"

                // !--common.bootstrap Modules-- >
                , "~/app/common/bootstrap/bootstrap.dialog.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app/common").Include(

            ));

            bundles.Add(new ScriptBundle("~/bundles/app/views").Include(
                  "~/app/admin/admin.js"
                , "~/app/dashboard/dashboard.js"
                , "~/app/layout/shell.js"
                , "~/app/layout/sidebar.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app/directives").Include(
                  "~/app/directives/cc-img-person.js"
                , "~/app/directives/cc-menu-item-rendered.js"
                , "~/app/directives/cc-scroll-to-top.js"
                , "~/app/directives/cc-sidebar.js"
                , "~/app/directives/cc-spinner.js"
                , "~/app/directives/cc-widget-close.js"
                , "~/app/directives/cc-widget-header.js"
                , "~/app/directives/cc-widget-minimize.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app/services").Include(
                  "~/app/services/datacontext.js"
            ));
        }
    }
}
