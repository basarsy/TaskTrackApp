using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MainService.Models;
using Microsoft.IdentityModel.Tokens;

namespace MainService.Services;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;
    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    public string GenerateToken(UserModel user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("SecretKey")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, "MainService"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.RoleType.ToString())
        };

        var token = new JwtSecurityToken(
            jwtSettings.GetValue<string>("Issuer"),
            jwtSettings.GetValue<string>("Audience"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings.GetValue<string>("ExpiryMinutes"))),
            signingCredentials: credentials);
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}