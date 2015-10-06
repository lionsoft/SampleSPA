using System;
using System.Linq;

namespace Sam.Extensions.ErrorManager
{
    public static class ExceptionExtension
    {
        public static bool IsAbort(this Exception e)
        {
            if (e == null) return false;
            if (e is AggregateException)
            {
                return (e as AggregateException).InnerExceptions.All(ex => ex.IsAbort());
            }
            else
            {
                return e is OperationCanceledException || e is AbortException;
            }
        }

        /// <summary>
        /// Returns all messages of the exception include all nested detail exceptions
        /// </summary>
        public static string FullMessage(this Exception e)
        {
            return ErrorLog.AnalizeErrorMessage(e);
        }


    }
}
