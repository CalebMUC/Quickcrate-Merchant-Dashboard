using System.Security.Claims;

namespace MerchantService.Shared.Services
{
    public interface ICurrentUserService
    {
        string UserId { get; }
        int MerchantId { get; }
        string Email { get; }
        string UserName { get; }
        bool IsAuthenticated { get; }
        IEnumerable<string> Roles { get; }
        ClaimsPrincipal User { get; }
        
        bool IsInRole(string role);
        string GetClaimValue(string claimType);
        T GetClaimValue<T>(string claimType) where T : struct;
    }
}