using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using GrapeCity.Forguncy.Log;

namespace HZGH5Recorder.Server
{
    internal class HZGH5RecorderMiddleware
    {
        private readonly RequestDelegate _next;
        public HZGH5RecorderMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.Value == "/HZGH5RecorderMiddleware")
            {
                context.Response.ContentType = "text/plain;charset=UTF-8";
                await context.Response.WriteAsync("自定义中间件测试成功");
                return;
            }
            await _next(context);
        }
    }
}
