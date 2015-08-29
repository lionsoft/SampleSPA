using System;
using System.Linq;
using System.Runtime.InteropServices;

namespace Sam.Extensions
{
    public static class SequentialGuid
    {
        [DllImport("rpcrt4.dll", SetLastError = true)]
        public static extern int UuidCreateSequential(out Guid guid);


        public static Guid NewGuid()
        {
            Guid guid;
            var result = UuidCreateSequential(out guid);
            if (result != 0) throw new Exception("Error generating sequential GUID");
            var bytes = guid.ToByteArray();
            var indexes = new [] { 3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 14, 15 };
            return new Guid(indexes.Select(i => bytes[i]).ToArray());
        }
    }
}
