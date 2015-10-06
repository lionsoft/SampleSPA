using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading;

namespace Sam.Extensions.ErrorManager
{
    [Localizable(false)]
    public static class ErrorLog
    {
        public static string InnerExceptionSeparator = Environment.NewLine + " " + Environment.NewLine; // Delimeter string between main and inner exceptions
        public static ErrorAnalizerParams Params = new ErrorAnalizerParams();
        public static string ExceptionSeparator = "\n----------------------------------------------------------------\n\n";

        public delegate void OnGetFullMessageDelegate(Exception e, ref string message);

        public static event OnGetFullMessageDelegate OnGetFullMessage = delegate { };

        public static string TrimExceptMsg(string msg)
        {
            return msg.Split(new[] { InnerExceptionSeparator }, StringSplitOptions.RemoveEmptyEntries)[0];
        }

        public static void HandleException(Exception exception)
        {
            if (exception == null || exception.IsAbort()) return;

            var ee = exception;
            while (ee != null)
            {
                if (ee == Params.OriginalException) return;
                ee = ee.InnerException;
            }

            var exceptMsg = AnalizeErrorMessage(exception);

            // If there was an AbortException as source exceptMsg is null
            if (exceptMsg != null)
            {
                //Messages.Error(exceptMsg);

                if (Params.NeedHalt)
                    Process.GetCurrentProcess().Kill();
            }

            Params.Clear();
        }


        public static void ApplicationThreadException(object sender, ThreadExceptionEventArgs e)
        {
            HandleException(e.Exception);
        }

        static void CurrentDomainUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            HandleException(e.ExceptionObject as Exception);
//            Process.GetCurrentProcess().Kill();
        }


        #region - AnalizeErrorMessage -

/*
        public static string InnerExceptionMessage(this Exception e)
        {
            var innerExceptMsg = "";
            if (e != null)
            {
                if (e is AggregateException)
                {
                    return (e as AggregateException).InnerExceptions.Aggregate("", (s, ex) => s == "" ? ex.AppendWithInnerMessages() : s + InnerExceptionSeparator + ex.AppendWithInnerMessages());
                }

                var innerException = e.InnerException;

                while (innerException != null)
                {
                    if (innerException.Message != "" && !innerExceptMsg.Contains(innerException.Message) && !e.Message.Contains(innerException.Message))
                        innerExceptMsg += InnerExceptionSeparator + innerException.Message;
                    innerException = innerException.InnerException;
                }

                if (e is FaultException<ExceptionDetail>)
                {
                    var detail = (e as FaultException<ExceptionDetail>).Detail;
                    while (detail != null)
                    {
                        if (detail.Message != "" && !innerExceptMsg.Contains(detail.Message) && !e.Message.Contains(detail.Message))
                            innerExceptMsg += InnerExceptionSeparator + detail.Message;
                        detail = detail.InnerException;
                    }
                }
            }
            return innerExceptMsg.Trim();
        }
*/

        public static string AnalizeErrorMessage(string msg)
        {
            return AnalizeErrorMessage(msg, null, "");
        }

        public static string AnalizeErrorMessage(Exception e)
        {
            return AnalizeErrorMessage("", e, "");
        }

        public static string AnalizeErrorMessage(string msg, Exception e)
        {
            return AnalizeErrorMessage(msg, e, "");
        }


        public static IEnumerable<Exception> EnumExceptions(this Exception e)
        {
            var aggEx = e as AggregateException;
            if (aggEx != null)
            {
                foreach (var subErr in aggEx.InnerExceptions.SelectMany(subErr => subErr.EnumExceptions()))
                {
                    yield return subErr;
                }
            }
            else
            {
                while (e != null)
                {
                    // Skipping outer TargetInvocationException errors
                    if (e.InnerException != null && e is TargetInvocationException)
                        e = e.InnerException;
                    // Skipping outer EntityCommandExecutionException errors
                    else if (e.InnerException != null && e.GetType().Name == "EntityCommandExecutionException")
                        e = e.InnerException;
                    else if (e.InnerException != null && e.Message.Contains("See the inner exception"))
                        e = e.InnerException;
                    // Skipping outer AggregateException errors
                    else if (e is AggregateException)
                    {
                        foreach (var subErr in e.EnumExceptions())
                        {
                            yield return subErr;
                        }
                    }
                    else
                    {
                        yield return e;
                        e = e.InnerException;
                    }
                }
            }
        }


        private static string GetErrorMessage(Exception e)
        {
            var res = e.Message;
            OnGetFullMessage(e, ref res);
            return res;
        }

        public static string AnalizeErrorMessage(string msg, Exception e, string addErrorInfo)
        {
            if (msg == "" && e == null)
                return "";

            Params.OriginalException = e;

            var errors = e.EnumExceptions().ToList();
            e = errors[0];

            if (e is AbortException)
                return e.Message;

            if (msg.IsEmpty(true))
            {
                Params.Text = GetErrorMessage(e);
            }
            else
            {
                Params.Text = msg;
            }

            Params.ExceptMsg = errors.Select(GetErrorMessage).Distinct().Skip(1).Combine(InnerExceptionSeparator);
            Params.E = e;
            Params.NeedHalt = false;
            Params.StackTrace = e.StackTrace;
            Params.Host = Dns.GetHostName();
            Params.UserName = Environment.UserDomainName + "\\" + Environment.UserName;
            
            try
            {
                if (Params.ErrorAnalizer != null)
                {
                    if (Debugger.IsAttached)
                        Params.ErrorAnalizer(Params);
                    else
                    {
                        var runThread = new Thread(Params.ErrorAnalizer);
                        runThread.SetApartmentState(ApartmentState.STA);
                        runThread.Start(Params);
                        runThread.Join(10000);
                        runThread.Abort();
                    }
                }
            }
            catch
            {
            }

            if (e is OperationCanceledException)
                return null;

            msg = Params.Text.Trim();

            if (Params.Solution.IsNotEmpty(true))
            {
                if (msg != Params.Solution)
                    msg = (msg == "" ? "" : msg + ExceptionSeparator) + Params.Solution;
            }
            else
            {
                if (msg != Params.ExceptMsg && Params.ExceptMsg.IsNotEmpty(true))
                    msg = (msg == "" ? "" : msg + ExceptionSeparator) + Params.ExceptMsg;

                if (Params.SupportInfo.IsNotEmpty(true))
                {
                    msg += InnerExceptionSeparator + Params.SupportInfo;
                }

            }

            if (Params.NeedHalt)
                msg += ExceptionSeparator + "Abnormal program termination.";
            Params.SupportInfo = addErrorInfo + (addErrorInfo != "" ? InnerExceptionSeparator : "" + Params.SupportInfo);
            return msg;
        }

        #endregion

        #region - InitParams -

        public static void InitParams(ParameterizedThreadStart errorAnalizer = null, int appId = 0, string appName = "", string userName = "")
        {
            Params.ErrorAnalizer = errorAnalizer;
            Params.AppId = appId;
            Params.AppName = appName;
            Params.UserName = userName;
        }

        #endregion

        #region - Init -

        public static void Init(ParameterizedThreadStart errorAnalizer = null, int appId = 0, string appName = "", string userName = "")
        {
            InitParams(errorAnalizer, appId, appName, userName);
            AppDomain.CurrentDomain.UnhandledException += CurrentDomainUnhandledException;
            EntityFrameworkErrorHandler.Init();
        }

        #endregion

    }
}

