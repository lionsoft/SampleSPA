using System;
using System.Threading;

namespace Sam.Extensions.ErrorManager
{
    public class ErrorAnalizerParams
    {
        /// <summary>
        /// Handled and may be transformed exception text
        /// </summary>
        public string Text = "";
        /// <summary>
        /// Last exception with a meaningful message
        /// </summary>
        public Exception E;
        /// <summary>
        /// Source original exception. Do not clear that field in Clear() method - it helps avoid reraising an exception.
        /// </summary>
        public Exception OriginalException;
        /// <summary>
        /// Current application Id (sets on calling Init() method)
        /// </summary>
        public int AppId;
        /// <summary>
        /// Current application name
        /// </summary>
        public string AppName = "";
        /// <summary>
        /// Current logon user name
        /// </summary>
        public string UserName = "";
        /// <summary>
        /// Additional error analizer 
        /// </summary>
        public ParameterizedThreadStart ErrorAnalizer;


        public bool NeedHalt;

        /// <summary>
        /// The solution will replace exception information
        /// </summary>
        public string Solution = "";

        /// <summary>
        /// Additional exception information, whitch will be added to error text
        /// </summary>
        public string SupportInfo = "";

        public string HelpUrl = "";
        public int SolutionId;
        public int ErrorId;
        public string ExceptMsg = "";
        public string StackTrace = "";
        public string Host = "";


        public void Clear()
        {
            Solution = "";
            SupportInfo = "";
            HelpUrl = "";
            SolutionId = 0;
            ErrorId = 0;
            ExceptMsg = "";
            StackTrace = "";
            Host = "";
            E = null;
            Text = "";
        }

        public bool IsEmpty()
        {
            return Host == "" && SupportInfo == "";
        }

    }
}
