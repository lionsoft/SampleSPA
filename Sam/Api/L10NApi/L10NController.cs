using System.IO;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Sam.Extensions.ErrorManager;

namespace Sam.Api
{
    [RoutePrefix("api/l10n")]
    public class L10NController : AppController
    {
        [HttpGet, Route("{fileName}")]
        public object Get(string fileName)
        {
            if (Path.GetExtension(fileName).IsEmpty())
                fileName = fileName + ".json";
            fileName = HttpContext.Current.Server.MapPath("~/app/l10n/{0}".Fmt(fileName));
            if (File.Exists(fileName))
            {
                using (var fs = File.OpenText(fileName))
                using (var reader = new JsonTextReader(fs))
                {
                    return JToken.ReadFrom(reader);
                }
            }
            return new object();
        }
    }
}