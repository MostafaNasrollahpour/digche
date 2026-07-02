using System;
using System.Security.Claims;
using FoodOrdering.Core.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FoodOrdering.Core.Infrastructure.Services;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool TryGetCurrentUserId(out Guid userId)
    {
        userId = Guid.Empty;

        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null || !user.Identity?.IsAuthenticated == true)
            return false;

        var userIdClaim =
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            user.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return false;

        return Guid.TryParse(userIdClaim, out userId);
    }

    public Guid GetCurrentUserId()
    {
        if (!TryGetCurrentUserId(out var userId))
            throw new UnauthorizedAccessException("User ID not found in token.");
        return userId;
    }

    public string? GetCurrentUserRole()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return
            user?.FindFirst(ClaimTypes.Role)?.Value ??
            user?.FindFirst("selectedRole")?.Value ??
            user?.FindFirst("role")?.Value;
    }

    public bool IsAuthenticated()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.Identity?.IsAuthenticated ?? false;
    }
}
