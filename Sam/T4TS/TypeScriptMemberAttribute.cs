using System;

// Do not change the namespace of the TypeScriptEnumAttribute. It must be just T4TS.
// ReSharper disable once CheckNamespace
namespace T4TS
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
    public class TypeScriptMemberAttribute : Attribute
    {
        public string Name { get; set; }

        public bool Optional { get; set; }

        public string Type { get; set; }

        public bool CamelCase { get; set; }

        public bool Ignore { get; set; }
    }
}