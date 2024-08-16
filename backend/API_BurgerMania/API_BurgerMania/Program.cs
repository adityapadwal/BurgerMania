// importing namespaces
using Microsoft.EntityFrameworkCore;
using API_BurgerMania.Data;
using API_BurgerMania.Options;
using API_BurgerMania.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

// current namespace
namespace API_BurgerMania
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder => builder.AllowAnyOrigin()
                                      .AllowAnyMethod()
                                      .AllowAnyHeader());
            });

            // Add services to the container.
            builder.Services.AddDbContext<BurgerManiaDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("cs")));

            // XML
            builder.Services.AddControllers(
                options => options.RespectBrowserAcceptHeader = true
                ).AddXmlDataContractSerializerFormatters();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // JWT
            JwtSettings jwtSettings = new JwtSettings();
            builder.Configuration.Bind("JwtSettings", jwtSettings); // binding

            builder.Services.AddSingleton(jwtSettings);
            builder.Services.AddScoped<ITokenService, TokenService>();

            // specifying that JWT bearer authentication will be used
            builder.Services.AddAuthentication((options) =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer((options) =>
            {
                // configure the jwt bearer options, including validation parameters
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true, 
                    ValidateAudience = true, 
                    ValidateLifetime = true, 
                    ValidateIssuerSigningKey = true, 
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                };
            });

            // authorization
            builder.Services.AddAuthorization();

            builder.Services.AddSwaggerGen((options) =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a JWT token...",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme()
                        {
                            Reference = new OpenApiReference()
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new String[]
                        {

                        }
                    }
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Configure the HTTP request pipeline.
            app.UseRouting();

            app.UseCors("AllowAllOrigins");

            app.UseHttpsRedirection();

            app.UseAuthentication(); // enables authentication for incoming requests
            app.UseAuthorization(); // ensures that users have the necessary permissions to access resources

            app.MapControllers();

            app.Run();
        }
    }
}
