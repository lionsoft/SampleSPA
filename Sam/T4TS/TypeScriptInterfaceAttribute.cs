using System;

// Do not change the namespace of the TypeScriptEnumAttribute. It must be just T4TS.
// ReSharper disable once CheckNamespace
namespace T4TS
{
    [AttributeUsage(AttributeTargets.Class)]
    public class TypeScriptInterfaceAttribute : Attribute
    {
        public string Module { get; set; }

        public string Name { get; set; }

        public string NamePrefix { get; set; }
    }
}
