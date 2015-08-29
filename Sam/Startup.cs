using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using Microsoft.Ajax.Utilities;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Sam.Startup))]

namespace Sam
{
    public partial class Startup
    {
        /// <summary>
        /// Gets a value indicating whether this instance in debug mode.
        /// </summary>
        /// <value>
        /// <c>true</c> if this instance in debug mode; otherwise, <c>false</c>.
        /// </value>
        public static bool IsDebugMode
        {
            get
            {
                var isDebug = ConfigurationManager.AppSettings.Get("IsDebugMode").ToLower();
                if (isDebug.IsNullOrWhiteSpace())
                #if DEBUG
                    return true;
                #else
                    return false;
                #endif
                return isDebug == "true" || isDebug == "1";
            }
        }

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
