using System;
using System.Data;
using System.Linq;

namespace Sam.Extensions.ErrorManager
{
    public static class EntityFrameworkErrorHandler
    {
        private static void OnGetFullMessage(Exception e, ref string message)
        {
            var dataException = e as DataException;
            if (dataException != null && dataException.InnerException != null)
                e = dataException.InnerException;
            var eve = e as System.Data.Entity.Validation.DbEntityValidationException;
            if (eve != null)
            {
                message = eve.EntityValidationErrors.Aggregate("", (res, err) =>
                {
                    var msg = err.ValidationErrors.Select(ve => ve.ErrorMessage).Combine("\r\n");
                    if (res != "")
                        res += "\r\n" + msg;
                    else
                        res = msg;
                    return res;
                });
            }
        }

        public static void Init()
        {
            ErrorLog.OnGetFullMessage -= OnGetFullMessage;
            ErrorLog.OnGetFullMessage += OnGetFullMessage;
        }
    }
}