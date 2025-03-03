using System;
using System.Collections.Generic;
using GrapeCity.Forguncy.ServerApi;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace HZGH5Recorder.Server
{
    public class HZGH5RecorderMiddlewareInjector : MiddlewareInjector
    {
        public override List<ServiceItem> ConfigureServices(List<ServiceItem> serviceItems, IServiceCollection services)
        {
            serviceItems.Insert(0, new ServiceItem()
            {
                Id = "7be953e5-5639-43d2-81cf-50312366ce86",
                ConfigureServiceAction = () =>
                {
                    // 这里可以注册中间件需要的服务，相当于 Asp.net 中的 public void ConfigureServices(IServiceCollection services) 方法
                    //services.AddXXXService();
                },
                Description = "我的自定义中间件服务"
            });
            return base.ConfigureServices(serviceItems, services);
        }
        public override List<MiddlewareItem> Configure(List<MiddlewareItem> middlewareItems, IApplicationBuilder app)
        {
            middlewareItems.Insert(0, new MiddlewareItem()
            {
                Id = "7be953e5-5639-43d2-81cf-50312366ce86",
                ConfigureMiddleWareAction = () =>
                {
                    app.UseMiddleware<HZGH5RecorderMiddleware>();
                },
                Description = "我的自定义中间件"
            });
            return base.Configure(middlewareItems, app);
        }
    }
}
