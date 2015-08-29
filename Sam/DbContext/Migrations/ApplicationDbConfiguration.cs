using System.Data.Entity;

[assembly: WebActivator.PreApplicationStartMethod(typeof(Sam.DbContext.ApplicationDbConfiguration), "Init")]

namespace Sam.DbContext
{
    /// <summary>
    /// 
    /// </summary>
    public class ApplicationDbConfiguration : DbConfiguration
    {
        /// <summary>
        /// Initializes the specified name or connection string.
        /// </summary>
        public static void Init()
        {
            SetConfiguration(new ApplicationDbConfiguration());

            Database.SetInitializer(new ApplicationDbInitializer());
//            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<ApplicationDbContext>());
//            Database.SetInitializer(new NullDatabaseInitializer<ApplicationDbContext>());
        }
    }
}
