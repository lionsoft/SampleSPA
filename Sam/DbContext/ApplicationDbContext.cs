using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Web.WebPages;
using Microsoft.AspNet.Identity.EntityFramework;
using Sam.Extensions;
using Sam.Models;

namespace Sam.DbContext
{
    public partial class ApplicationDbContext : IdentityDbContext<User>
    {
        /// <summary>
        /// Default connection string name.
        /// </summary>
        public static string NameOrConnectionString = "ApplicationDb";


        [Table("DbInfo")]
        public class DbInfo
        {
            /// <summary>
            /// Максимальная длина текстового поля в БД
            /// </summary>
            //public const int StringMaxLength = int.MaxValue;
            //public const int StringMaxLength = 4000;         // Ограничение для SQL CE
            //public const int StringMaxLength = 10485760;     // Ограничение PostgreSQL

            public const int MaxLength = -1; // Признак мемо поля

            public const string DbVersionParam = "DbVersion";

            [Key]
            public string Name { get; set; }

            [MaxLength(MaxLength)]
            public string Value { get; set; }
        }


        #region - Constructors -

        /// <summary>
        /// Initializes a new instance of the <see cref="Sam.DbContext.ApplicationDbContext"/> class.
        /// </summary>
        public ApplicationDbContext()
            : base(NameOrConnectionString, throwIfV1Schema: false)
        {
            Configuration.LazyLoadingEnabled = true;
            Configuration.ProxyCreationEnabled = true;
            Initialize();
        }
        
        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

        #endregion


        #region - Initialization -


        /// <summary>
        /// Gets a value indicating whether database was initialized.
        /// </summary>
        /// <value>
        ///   <c>true</c> if database was initialized; otherwise, <c>false</c>.
        /// </value>
        protected static bool WasInitialized;

        internal void Initialize()
        {
            if (WasInitialized) return;
            WasInitialized = true;
            if (ActualDbVersion > CurrentDbVersion)
            {
                // Обновление базы данных необходимо делать в другом подключении,
                // иначе добавленные объекты при первом обращении к БД возвращаются не из базы и не проксированные.
                // В частности это приводит к тому, что в первый раз вычислимые атрибуты этих объектов могут быть не заполнены,
                // а при LazyLoading = false могут быть возвращены объекты полностью.
                // 
                using (var db = Create())
                {
                    db.UpgradeDatabase(CurrentDbVersion, ActualDbVersion);
                    db.Attach(new DbInfo { Name = DbInfo.DbVersionParam, Value = ActualDbVersion.ToString() }, CurrentDbVersion == 0);
                    db.SaveChanges();
                }
            }
        }

        public bool LazyLoadingEnabled
        {
            get { return Configuration.LazyLoadingEnabled; }
            set { Configuration.LazyLoadingEnabled = value; }
        }

/*
        public DbContextHooks _hooks;
        public DbContextHooks Hooks
        {
            get
            {
                if (_hooks == null)
                {
                    var hooks = IoC.GetAllInstances(typeof(IHook)).OfType<IHook>().ToArray();
                    _hooks = new DbContextHooks(this, hooks);
                    _hooks.Add(new DateTimeUtcHook());
                }
                return _hooks;
            }
        }

        public override int SaveChanges()
        {
            return Hooks.SaveChanges(base.SaveChanges);
        }

        public override Task<int> SaveChangesAsync()
        {
            return SaveChangesAsync(CancellationToken.None);
        }
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            return Hooks != null
                ? Hooks.SaveChangesAsync(base.SaveChangesAsync, cancellationToken)
                : base.SaveChangesAsync(cancellationToken);
        }
*/

        #endregion

        #region - Database Version Checker -


        private static int? _currentDbVersion; // null - if current version hasn't got

        /// <summary>
        /// Database current version.<para></para>
        /// <c>0</c> - database has been just created.
        /// Will be updated automatically on changing <see cref="ActualDbVersion"/>.
        /// </summary>
        public int CurrentDbVersion
        {
            get
            {
                if (!_currentDbVersion.HasValue)
                {
                    _currentDbVersion = Infos.Where(x => x.Name == DbInfo.DbVersionParam).Select(x => x.Value).FirstOrDefault().AsInt();
                }
                return _currentDbVersion.Value;
            }
        }


        #endregion



        [Browsable(false)]
        public IDbSet<DbInfo> Infos { get; set; }
    }
}