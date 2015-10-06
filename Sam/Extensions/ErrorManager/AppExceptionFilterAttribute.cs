using System;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;

namespace Sam.Extensions.ErrorManager
{
    /// <summary>
    /// Handle exceptions in WebApi controllers.
    /// Just mark ApiController with this attribute.
    /// </summary>
    public class AppExceptionFilterAttribute : ExceptionFilterAttribute
    {
        static AppExceptionFilterAttribute()
        {
            EntityFrameworkErrorHandler.Init();
        }
        public override void OnException(HttpActionExecutedContext context)
        {
            if (context.Exception is NotImplementedException)
            {
                context.Response = new HttpResponseMessage(HttpStatusCode.NotImplemented);
            }
            else
            {
                var msg = context.Exception.FullMessage();
                if (context.Exception.Message != msg)
                    context.Exception = new ApplicationException(msg, context.Exception);
            }
        }
    }
}