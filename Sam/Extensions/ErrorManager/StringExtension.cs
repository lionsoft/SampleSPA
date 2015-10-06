using System;
using System.Collections;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace Sam.Extensions.ErrorManager
{
    [Localizable(true)]
    public static class StringExtension
    {
        public static string AsString(this object s)
        {
            if (s == null) return "";
            return s.ToString();
        }

        public static string Combine(this IEnumerable list, string separator)
        {
            if (list == null)
                return null;
            return list.OfType<object>().Aggregate((string)null, (res, s) => res.IsEmpty() ? s.AsString() : res + separator + s.AsString());
        }


        #region IsEmpty/IsNotEmpty

        /// <summary>
        /// Checks whether string is null or empty.
        /// </summary>
        /// <param name="s">Testing string</param>
        /// <param name="trimString">Makes trim() before testing</param>
        public static bool IsEmpty(this string s, bool trimString = false)
        {
            if (trimString && s != null) s = s.Trim();
            return string.IsNullOrEmpty(s);
        }

        /// <summary>
        /// Checks whether string is not null or empty.
        /// </summary>
        /// <param name="s">Testing string</param>
        /// <param name="trimString">Makes trim() before testing</param>
        public static bool IsNotEmpty(this string s, bool trimString = false)
        {
            if (trimString && s != null) s = s.Trim();
            return !string.IsNullOrEmpty(s);
        }

        #endregion

        #region LeftPart

        /// <summary>
        /// Returns left part of string defined length. If string length is less than parameter length - returns whole string.
        /// </summary>
        /// <param name="s">Source string</param>
        /// <param name="length">Length of the left part.</param>
        public static string LeftPart(this string s, int length)
        {
            if (length < 0 || s.IsEmpty()) return "";
            return length >= s.Length ? s : s.Substring(0, length);
        }

        #endregion

        #region RightPart

        /// <summary>
        /// Returns right part of string defined length. If string length is less than parameter length - returns whole string.
        /// </summary>
        /// <param name="s">Source string</param>
        /// <param name="length">Length of the right part.</param>
        public static string RightPart(this string s, int length)
        {
            if (length < 0) return "";
            return length >= s.Length ? s : s.Substring(s.Length - length, length);
        }

        #endregion

        #region SameText

        /// <summary>
        /// Compares two strings ignoring case according current culture.
        /// </summary>
        /// <param name="str1">First string - can be null</param>
        /// <param name="str2">Second string - can be null</param>
        public static bool SameText(this string str1, string str2)
        {
            return str1.AsString().Equals(str2.AsString(), StringComparison.CurrentCultureIgnoreCase);
        }

        #endregion

        /// <summary>
        /// Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
        /// </summary>
        /// <param name="format">A composite format string</param>
        /// <param name="args">An object array that contains zero or more objects to format</param>
        public static string Fmt([Localizable(true)] this string format, params object[] args)
        {
            if (args == null || args.Length == 0)
                return format.AsString();
            return String.Format(format.AsString(), args);
        }


        /// <summary>
        /// Duplicates specified string <paramref name="count"/> times.
        /// </summary>
        /// <param name="str">String to duplicate</param>
        /// <param name="count">Duplicate counter</param>
        public static string Duplicate(this string str, int count)
        {
            var sb = new StringBuilder();
            for (var i = 0; i < count; i++)
                sb.Append(str);
            return sb.ToString();
        }


        #region - Quote string -

        /// <summary>
        /// Quotes string with specified quote char
        /// </summary>
        public static string QuotedStr(this string s, char quote = '\'')
        {
            return quote + s.Replace(quote.ToString(), quote + quote.ToString()) + quote;
        }

        #endregion



        #region - Encription / Decription / Hashing -

        /// <summary>
        /// Encrypts string with DES
        /// </summary>
        /// <param name="str">Source string</param>
        /// <param name="salt">Secure salt value</param>
        /// <param name="ignoreError">If true - returns input string as result when error is raised</param>
        public static string Encrypt(this string str, string salt = null, bool ignoreError = false)
        {
            if (str.IsEmpty()) return "";
            try
            {
                byte[] dv = { 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF };
                var byKey = Encoding.UTF8.GetBytes(("E8" + (salt ?? "") + "904308").Substring(0, 8));
                var des = new DESCryptoServiceProvider();
                var inputArray = Encoding.UTF8.GetBytes(str);
                var ms = new MemoryStream();
                var cs = new CryptoStream(ms, des.CreateEncryptor(byKey, dv), CryptoStreamMode.Write);
                cs.Write(inputArray, 0, inputArray.Length);
                cs.FlushFinalBlock();
                return Convert.ToBase64String(ms.ToArray());
            }
            catch
            {
                if (ignoreError) return str;
                throw;
            }
        }

        /// <summary>
        /// Decripts string with DES
        /// </summary>
        /// <param name="str">Source string</param>
        /// <param name="salt">Secure salt value, deffered when encription has made</param>
        /// <param name="ignoreError">If true - returns input string as result when error is raised</param>
        public static string Decrypt(this string str, string salt = null, bool ignoreError = false)
        {
            if (str.IsEmpty()) return "";
            try
            {
                byte[] dv = { 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF };
                var bKey = Encoding.UTF8.GetBytes(("E8" + (salt ?? "") + "904308").Substring(0, 8));
                var des = new DESCryptoServiceProvider();
                var inputByteArray = Convert.FromBase64String(str);
                var ms = new MemoryStream();
                var cs = new CryptoStream(ms, des.CreateDecryptor(bKey, dv), CryptoStreamMode.Write);
                cs.Write(inputByteArray, 0, inputByteArray.Length);
                cs.FlushFinalBlock();
                var encoding = Encoding.UTF8;
                return encoding.GetString(ms.ToArray());
            }
            catch
            {
                if (ignoreError) return str;
                throw;
            }
        }

        #endregion


        #region ReplaceText

        /// <summary>
        /// Заменяет подстроку в строке без учета регистра (используются регекспы)
        /// </summary>
        public static string ReplaceText(this string s, string oldValue, string newValue)
        {
            if (s == null) return null;
            return Regex.Replace(s, Regex.Escape(oldValue), newValue, RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// Заменяет regexp-паттерны в строке на указанное значение c подстановкой вместо {0}/{1}/../{n} соответствующих значений групп.
        /// <para>Sample:</para>
        /// <code>
        ///     "\[(span|div)(.*)\]".ReplaceRegex("[a]") - заменит  [span 123] и [div xxx] на [a]
        ///     "\[(span|div)(.*)\]".ReplaceRegex("--{0}{1}--") - заменит  [span 123] и [div xxx] на --span 123-- и --div xxx-- соответственно
        /// </code>
        /// </summary>
        public static string ReplaceRegex(this string s, string pattern, string replacement, bool caseSensitive = false, RegexOptions options = RegexOptions.None)
        {
            if (s == null) return null;
            if (caseSensitive) options = options | RegexOptions.IgnoreCase;
            return Regex.Replace(s, pattern, m => replacement.Fmt(m.Groups.OfType<Group>().Select(g => (object)g.Value).ToArray()), options);
        }

        /// <summary>
        /// Заменяет regexp-паттерны в строке на значение, отдаваемое функцией.
        /// </summary>
        public static string ReplaceRegex(this string s, string pattern, MatchEvaluator evaluator, bool caseSensitive = false, RegexOptions options = RegexOptions.None)
        {
            if (s == null) return null;
            if (caseSensitive) options = options | RegexOptions.IgnoreCase;
            return Regex.Replace(s, pattern, evaluator, options);
        }


        /// <summary>
        /// Converts wildcard pattern to regex pattern
        /// </summary>
        /// <param name="pattern">Wild card pattern</param>
        /// <returns>Regex pattern</returns>
        public static string WildcardToRegex(this string pattern)
        {
            return "^" + Regex.Escape(pattern).Replace("\\*", ".*").Replace("\\?", ".") + "$";
        }

        /// <summary>
        /// Checks whether string is matched determines wildcard pattern. 
        /// </summary>
        /// <param name="input">Testing string</param>
        /// <param name="pattern">Wildcard pattern - can use * or ?</param>
        /// <param name="ignoreCase">Ignore case flag</param>
        public static bool IsMatch(this string input, string pattern, bool ignoreCase = false)
        {
            return Regex.IsMatch(input, pattern.WildcardToRegex(), ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None);
        }

        public static bool Like(this string input, string pattern)
        {
            return input.IsMatch(pattern.ReplaceChars("%_", "*?"));
        }



        #endregion

        public static string Nl2Br(this string s)
        {
            return s.Replace(@"\r\n", @"<br />").Replace(@"\n", @"<br />");
        }

/*
        public static string Md5(this string s)
        {
/*
            var provider = new MD5CryptoServiceProvider();
            var bytes = Encoding.UTF8.GetBytes(s);
            var builder = new StringBuilder();

            bytes = provider.ComputeHash(bytes);

            foreach (byte b in bytes)
                builder.Append(b.ToString(@"x2").ToLower());

            return builder.ToString();
#1#
            return s.ToMD5();
        }
*/

        public static string ToBase64(this string s)
        {
            if (s.IsEmpty())
                return null;
            var toEncodeAsBytes = Encoding.UTF8.GetBytes(s);
            return Convert.ToBase64String(toEncodeAsBytes);
        }

        public static string FromBase64(this string s)
        {
            if (s.IsEmpty())
                return null;
            var fromEncodeAsBytes = Convert.FromBase64String(s);
            return Encoding.UTF8.GetString(fromEncodeAsBytes);
        }

        public static string AddText(this string str, string addStr, string separator)
        {
            if (str.IsEmpty()) return addStr;
            return str + separator + addStr;
        }

        #region ConvertEncoding

        public static string ConvertEncoding(this string str, string sourceEncoding, string destEncoding)
        {
            return ConvertEncoding(str, Encoding.GetEncoding(sourceEncoding), Encoding.GetEncoding(destEncoding));
        }
        public static string ConvertEncoding(this string str, Encoding sourceEncoding, Encoding destEncoding)
        {
            return str.IsEmpty() ? str : destEncoding.GetString(sourceEncoding.GetBytes(str));
        }

        #endregion

        public static string SetCharAt(this string str, int index, char @char)
        {
            if (str.IsEmpty() || str.Length <= index)
                return str;
            return str.Substring(0, index) + @char + str.Substring(index + 1, str.Length - index - 1);
        }

        /// <summary>
        /// Replace chars in the string str. oldChars - set of chars to be replaced with appropriate char in newChars.
        /// <para>
        /// <example>
        /// str = "3a2q31", oldChars = '123', newChars = 'abc', result = "cabqca"
        /// </example>
        /// </para>
        /// </summary>
        public static string ReplaceChars(this string str, string oldChars, string newChars)
        {
            oldChars = oldChars.Substring(0, newChars.Length);
            var ch = str.ToCharArray();
            for (var i = 0; i < ch.Length; i++)
            {
                var idx = oldChars.IndexOf(ch[i]);
                if (idx >= 0)
                    ch[i] = newChars[idx];
            }
            return new string(ch);
        }


        public static string CutTail(this string s, string tail)
        {
            if (s.RightPart(tail.Length).SameText(tail))
                s = s.Substring(0, s.Length - tail.Length);
            return s;
        }


        public static string ToXml(this byte[] src)
        {
            if (src == null) return String.Empty;
            var res = Encoding.Unicode.GetString(src);
            if (!res.IsEmpty(true))
            {
                if (res.LeftPart(6) != "<?xml ") res = Encoding.UTF32.GetString(src);
                if (res.LeftPart(6) != "<?xml ") res = Encoding.UTF8.GetString(src);
                if (res.LeftPart(6) != "<?xml ") res = Encoding.GetEncoding(1251).GetString(src);
            }
            return res;
        }

        public static string TrimToNull(this string s, string nullValue = null)
        {
            return s.IsEmpty(true) ? nullValue : s;
        }

        public static string FormatXml(this string xml)
        {
            try
            {
                return XDocument.Parse(xml).ToString();
            }
            catch
            {
                return xml;
            }
        }

        public static string[] SplitCamelCase(this string input)
        {
            return Regex.Replace(input, "([A-Z])", "-$1", RegexOptions.Compiled).Trim().Split('-');
        }


        public static string ToCamelCase(this string input)
        {
            var words = input.Split(' ');
            var sb = new StringBuilder();
            foreach (var s in words)
            {
                var firstLetter = s.Substring(0, 1);
                var rest = s.Substring(1, s.Length - 1);
                sb.Append(firstLetter.ToLower() + rest);
                sb.Append(" ");
            }
            return sb.ToString().Substring(0, sb.ToString().Length - 1);
        }
        public static string ToTitleCase(this string input)
        {
            var words = input.Split(' ');
            var sb = new StringBuilder();
            foreach (var s in words)
            {
                var firstLetter = s.Substring(0, 1);
                var rest = s.Substring(1, s.Length - 1);
                sb.Append(firstLetter.ToUpper() + rest);
                sb.Append(" ");
            }
            return sb.ToString().Substring(0, sb.ToString().Length - 1);
        }

        public static string PadCenter(this string input, int totalWidth, char paddingChar = ' ')
        {
            var len = totalWidth - (totalWidth - input.Length) / 2;
            return input.PadRight(len, paddingChar).PadLeft(totalWidth, paddingChar);
        }
    }
}