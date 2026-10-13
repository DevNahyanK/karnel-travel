using System.Threading.Tasks;
using KarnelTravelGuide.API.DTOs.Auth;

namespace KarnelTravelGuide.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}
