using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetChefOrdersQueryHandler : IRequestHandler<GetChefOrdersQuery, Result<IEnumerable<OrderDto>>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;
    private readonly IUserServiceClient _userServiceClient;

    public GetChefOrdersQueryHandler(
        IOrderRepository orderRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<IEnumerable<OrderDto>>> Handle(GetChefOrdersQuery request, CancellationToken cancellationToken)
    {
        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<IEnumerable<OrderDto>>.Failure("شناسه کاربر در توکن یافت نشد.");

        // --- دریافت اطلاعات آشپز جاری (برای نام خودش) ---
        AuthUserDto chefInfo = null;
        try
        {
            chefInfo = await _userServiceClient.GetUserInfoAsync(chefId, cancellationToken);
        }
        catch { /* خطا نادیده گرفته می‌شود */ }

        var chefName = chefInfo != null ? GetDisplayName(chefInfo) : "نامشخص";

        // --- دریافت سفارش‌های مربوط به این آشپز ---
        var orders = await _orderRepository.GetByChefIdAsync(chefId, cancellationToken);
        if (orders is null || !orders.Any())
            return Result<IEnumerable<OrderDto>>.Success(Enumerable.Empty<OrderDto>());

        // --- کش اطلاعات مشتریان ---
        var customerCache = new Dictionary<Guid, AuthUserDto>();

        foreach (var order in orders)
        {
            if (!customerCache.ContainsKey(order.CustomerId))
            {
                try
                {
                    var userInfo = await _userServiceClient.GetUserInfoAsync(order.CustomerId, cancellationToken);
                    customerCache[order.CustomerId] = userInfo;
                }
                catch
                {
                    customerCache[order.CustomerId] = null;
                }
            }
        }

        // --- نگاشت به DTO ---
        var orderDtos = orders.Select(order =>
        {
            var customerInfo = customerCache.GetValueOrDefault(order.CustomerId);
            var customerName = customerInfo != null ? GetDisplayName(customerInfo) : "نامشخص";
            var customerPhone = customerInfo?.Phone ?? "نامشخص";

            return new OrderDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                ChefId = order.ChefId,
                CustomerName = customerName,
                CustomerPhone = customerPhone,
                ChefName = chefName,          // ← مقداردهی با نام خود آشپز
                Status = order.Status,
                OrderedAt = order.CreatedAt,
                DeliveryFee = order.DeliveryFee,
                EstimatedDeliveryTime = order.EstimatedDeliveryTime,
                TotalPrice = order.TotalPrice,
                CreatedAt = order.CreatedAt,
                Items = order.Items.Select(item => new OrderItemDto
                {
                    FoodId = item.DishId,
                    FoodTitle = item.Dish?.Name ?? "نامشخص",
                    FoodImage = item.Dish?.ImageUrl ?? string.Empty,
                    Quantity = item.Quantity,
                    DishId = item.DishId,
                    DishName = item.Dish?.Name ?? "نامشخص",
                    UnitPrice = item.UnitPrice,
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