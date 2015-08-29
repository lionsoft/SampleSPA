namespace Sam.DbContext
{
    public interface IEntityObjectId<TKey>
    {
        TKey Id { get; set; }
    }

    public interface IEntityObjectId : IEntityObjectId<string>
    {
    }
}