using API_BurgerMania.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace API_BurgerMania.Services
{
    public class TokenService : ITokenService
    {
        // prop
        private readonly JwtSettings _jwtSettings;

        // constructor
        public TokenService(JwtSettings jwtSettings)
        {
            _jwtSettings = jwtSettings;
        }

        // method for generating JWT token
        public string GenerateToken(string mobileNumber)
        {
            // claims: user-specific information is added to the token
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, mobileNumber),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            // secret key
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            // combines secret key and algorithm to sign the token
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // creating token
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds
            );

            // returning token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
