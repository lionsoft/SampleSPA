using System;

namespace Sam.Extensions.ErrorManager
{
    public class AbortException : ApplicationException
    {
        public AbortException()
        {
            
        }

        public AbortException(string message) : base(message)
        {
            
        }
    };
}