using System;
using System.Linq.Expressions;
using System.Reflection;

namespace Sam.Extensions.Expressions
{
    /// <summary>
    /// Simplificates an expression:
    /// 1. Removes unnessesary Convert() operands (inserted by Roslyn, but not supported by EF).
    /// 2. Replaces constant subexpressions with its direct values.
    /// </summary>
    public class SimplifyExpression : ExpressionVisitor
    {
        /// <summary>
        /// Simplificates the <paramref name="sourceExpression"/>.
        /// </summary>
        /// <param name="sourceExpression">Source expression</param>
        public static Expression Execute(Expression sourceExpression)
        {
            return new SimplifyExpression().Visit(sourceExpression);
        }

        /// <summary>
        /// Creates and simplificates the <paramref name="predicateExpression"/>.
        /// Can be used when building EnituyFramework LINQ.
        /// <example>
        ///     var res = Db.Set{TEntity}().First(SimplifyExpression.Predicate{TEntity}(x => x.Id == id));
        /// </example>
        /// </summary>
        /// <typeparam name="T">Predicate source type.</typeparam>
        /// <param name="predicateExpression">Predicate expression</param>
        public static Expression<Func<T, bool>> Predicate<T>(Expression<Func<T, bool>> predicateExpression)
        {
            return predicateExpression.Simplify();
        }

        protected override Expression VisitUnary(UnaryExpression node)
        {
            // Replace explicit Convert to implicit one. (Except converion to Object).
            if (node.Type != typeof(object) && node.Type.IsAssignableFrom(node.Operand.Type))
                return Visit(node.Operand);
            return base.VisitUnary(node);
        }

        protected override Expression VisitMember(MemberExpression node)
        {
            // Replace Memeber Access to Constant value with direct Constant value.
            var constantExpression = node.Expression as ConstantExpression;
            if (constantExpression != null)
            {
                var constant = constantExpression.Value;
                var fi = node.Member as FieldInfo;
                if (fi != null) return Expression.Constant(fi.GetValue(constant));
                var pi = node.Member as PropertyInfo;
                if (pi != null) return Expression.Constant(pi.GetValue(constant));
            }
            return base.VisitMember(node);
        }
    }


    /// <summary>
    /// Extension for fluent operations with <see cref="SimplifyExpression"/> class.
    /// </summary>
    public static class SimplifyExpressionExtension
    {
        public static Expression Simplify(this Expression expression)
        {
            return SimplifyExpression.Execute(expression);
        }
        public static Expression<T> Simplify<T>(this Expression<T> expression)
        {
            return (Expression<T>)SimplifyExpression.Execute(expression);
        }
    }

}