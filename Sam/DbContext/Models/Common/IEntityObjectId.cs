using System;
using T4TS;

namespace Sam.DbContext
{
    public interface IEntityObjectId<TKey>
    {
        TKey Id { get; set; }
    }   
    public interface IEntityObjectId : IEntityObjectId<string>
    {
        DateTime CreatedDate { get; set; }
        string CreatedById { get; set; }
        User CreatedBy { get; set; }


        DateTime ModifiedDate { get; set; }
        string ModifiedById { get; set; }
        User ModifiedBy { get; set; }
    }

}