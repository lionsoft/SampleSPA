using System;

namespace Sam.Extensions.EntityFramework.EFHooks
{
    public class OrderAttribute : Attribute
    {
        public int Position { get; private set; }
        public OrderAttribute(int position) { Position = position; }
    }
}
