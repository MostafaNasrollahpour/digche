using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/test")]
public class TestAuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public TestAuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("token")]
    public IActionResult GetTestToken([FromQuery] string role = "chef")
    {
        // 1. دریافت تنظیمات JWT
        var secret = _configuration["Jwt:Secret"];
        if (string.IsNullOrEmpty(secret))
            return BadRequest(new { error = "JWT Secret is not configured." });

        var issuer = _configuration["Jwt:Issuer"] ?? "FoodOrdering.Auth";
        var audience = _configuration["Jwt:Audience"] ?? "FoodOrdering.Core";

        // 2. بررسی طول کلید (حداقل 32 بایت)
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        if (keyBytes.Length < 32)
            return BadRequest(new { error = "JWT Secret must be at least 32 bytes (256 bits)." });

        // 3. اطلاعات کاربر (مصنوعی)
        // var userId = Guid.NewGuid();
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // یک Guid ثابت که در دیتابیس موجود است
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim("selectedRole", role),
            new Claim("phoneNumber", "09121234567")
        };

        // 4. ساخت توکن
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = issuer,
            Audience = audience,
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(keyBytes),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwtToken = tokenHandler.WriteToken(token);

        return Ok(new
        {
            accessToken = jwtToken,
            userId = userId,
            role = role,
            issuer = issuer,
            audience = audience,
            expiresAt = tokenDescriptor.Expires,
            message = "⚠️ This token is for TESTING only. Use in development environment."
        });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "FoodOrdering Core API",
            environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Development"
        });
    }
}
