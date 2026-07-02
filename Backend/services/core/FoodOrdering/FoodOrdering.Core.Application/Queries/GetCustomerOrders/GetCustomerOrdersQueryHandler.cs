using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, Result<IEnumerable<OrderDto>>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;
    private readonly IUserServiceClient _userServiceClient;

    public GetCustomerOrdersQueryHandler(
        IOrderRepository orderRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<IEnumerable<OrderDto>>> Handle(GetCustomerOrdersQuery request, CancellationToken cancellationToken)
    {
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<IEnumerable<OrderDto>>.Failure("شناسه کاربر در توکن یافت نشد.");

        // --- دریافت اطلاعات مشتری جاری ---
        AuthUserDto customerInfo = null;
        try
        {
            customerInfo = await _userServiceClient.GetUserInfoAsync(customerId, cancellationToken);
        }
        catch { /* خطا نادیده گرفته می‌شود */ }

        var customerName = customerInfo != null ? GetDisplayName(customerInfo) : "نامشخص";
        var customerPhone = customerInfo?.Phone ?? "نامشخص";

        // --- دریافت سفارش‌ها ---
        var orders = await _orderRepository.GetByCustomerIdAsync(customerId, cancellationToken);
        if (orders is null || !orders.Any())
            return Result<IEnumerable<OrderDto>>.Success(Enumerable.Empty<OrderDto>());

        // --- کش اطلاعات آشپزها (برای جلوگیری از درخواست‌های تکراری) ---
        var userCache = new Dictionary<Guid, AuthUserDto>
        {
            [customerId] = customerInfo   // اطلاعات مشتری جاری را هم کش می‌کنیم (البته بعداً استفاده نمی‌شود)
        };

        foreach (var order in orders)
        {
            if (!userCache.ContainsKey(order.ChefId))
            {
                try
                {
                    var chefInfo = await _userServiceClient.GetUserInfoAsync(order.ChefId, cancellationToken);
                    userCache[order.ChefId] = chefInfo;
                }
                catch
                {
                    userCache[order.ChefId] = null;
                }
            }
        }

        // --- نگاشت به DTO ---
        var orderDtos = orders.Select(order =>
        {
            var chefInfo = userCache.GetValueOrDefault(order.ChefId);
            var chefName = chefInfo != null ? GetDisplayName(chefInfo) : "نامشخص";

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                ChefId = order.ChefId,
                CustomerName = customerName,
                CustomerPhone = customerPhone,
                ChefName = chefName,          // ← مقداردهی شد
                Status = order.Status,
                OrderedAt = order.CreatedAt,
                Items = order.Items.Select(item => new OrderItemDto
                {
                    FoodId = item.DishId,
                    FoodTitle = item.Dish?.Name ?? "نامشخص",
                    FoodImage = item.Dish?.ImageUrl ?? string.Empty,
                    Quantity = item.Quantity,
                    Price = item.UnitPrice,
                    Unit = "تومان"
                }).ToList()
            };
        });

        return Result<IEnumerable<OrderDto>>.Success(orderDtos);
    }

    private static string GetDisplayName(AuthUserDto user)
    {
        if (!string.IsNullOrWhiteSpace(user.FirstName) && !string.IsNullOrWhiteSpace(user.LastName))
            return $"{user.FirstName} {user.LastName}";
        if (!string.IsNullOrWhiteSpace(user.DisplayName))
            return user.DisplayName;
        if (!string.IsNullOrWhiteSpace(user.Username))
            return user.Username;
        return "کاربر";
    }
}