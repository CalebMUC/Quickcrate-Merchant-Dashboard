using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace MerchantService.Shared.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ClaimsPrincipal _user;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _user = _httpContextAccessor.HttpContext?.User;
        }

        public string UserId => _user?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        public int MerchantId
        {
            get
            {
                var merchantIdClaim = _user?.FindFirstValue("MerchantId");
                return int.TryParse(merchantIdClaim, out var merchantId) ? merchantId : 0;
            }
        }

        public string Email => _user?.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        public string UserName => _user?.FindFirstValue(ClaimTypes.Name) ?? string.Empty;

        public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

        public IEnumerable<string> Roles => _user?.FindAll(ClaimTypes.Role)?.Select(c => c.Value) ?? Enumerable.Empty<string>();

        public ClaimsPrincipal User => _user;

        public bool IsInRole(string role)
        {
            return _user?.IsInRole(role) ?? false;
        }

        public string GetClaimValue(string claimType)
        {
            return _user?.FindFirstValue(claimType) ?? string.Empty;
        }

        public T GetClaimValue<T>(string claimType) where T : struct
        {
            var claimValue = GetClaimValue(claimType);
            
            if (string.IsNullOrEmpty(claimValue))
                return default(T);

            try
            {
                return (T)Convert.ChangeType(claimValue, typeof(T));
            }
            catch
            {
                return default(T);
            }
        }
    }
}