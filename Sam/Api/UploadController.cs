using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Sam.Api
{
    [Authorize, RoutePrefix("api/upload")]
    public class UploadController : ApiController
    {
        public static async Task<IEnumerable<string>> UploadFiles(HttpRequestMessage request, string uploadFolder)
        {
            if (!request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var root = System.Web.HttpContext.Current.Server.MapPath("~/" + uploadFolder.Replace(".", "/").Replace("\\", "/"));
            Directory.CreateDirectory(root);
            var provider = new MultipartMemoryStreamProvider();
            await request.Content.ReadAsMultipartAsync(provider);
            var fileNames = new List<string>();
            foreach (var file in provider.Contents)
            {
                var fileName = file.Headers.ContentDisposition.FileName.Trim('\"');
                fileNames.Add(fileName);
                using (var contentStream = await file.ReadAsStreamAsync())
                using (var fileStream = new FileStream(root + "//" + fileName, FileMode.Create))
                {
                    await contentStream.CopyToAsync(fileStream);
                }
            }
            return fileNames;
        }

        [HttpPost, Route("{uploadFolder}")]
        public async Task<IHttpActionResult> Upload(string uploadFolder)
        {
            return Ok(await UploadFiles(Request, uploadFolder));
        }
    }
}