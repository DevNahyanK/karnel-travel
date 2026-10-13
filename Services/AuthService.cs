using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using KarnelTravelGuide.API.Data;
using KarnelTravelGuide.API.DTOs.Auth;
using KarnelTravelGuide.API.Models;

namespace KarnelTravelGuide.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            // 1. Check if email is already taken
            var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (emailExists)
            {
                throw new InvalidOperationException("An account with this email address already exists.");
            }

            // 2. Hash password using BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // 3. Create new user entity with default role "Customer" and IsVerified = true
            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                Phone = dto.Phone.Trim(),
                Role = "Customer",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            // 4. Save user to database
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // 5. Generate JWT token
            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                UserId = user.UserId
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            // 1. Find user by email
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            // 2. Verify password hash using BCrypt
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // 3. Generate JWT token
            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                UserId = user.UserId
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? "KarnelTravelGuide_SuperSecret_Jwt_EncryptionKey_2026!#SecureAuth";
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "KarnelTravelGuideAPI";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "KarnelTravelGuideApp";
            var durationMinutes = double.TryParse(_configuration["Jwt:DurationInMinutes"], out var minutes) ? minutes : 60;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(durationMinutes),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
