using System.IO;
using System.Threading.Tasks;
using GrapeCity.Forguncy.ServerApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HZGH5Recorder.Server
{
    public class HZGH5RecorderApi : ForguncyApi
    {
        [Post]
        public async Task UploadRecord([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return;
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", file.FileName);

            using (var steam = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(steam);
            }
        }
    }
}