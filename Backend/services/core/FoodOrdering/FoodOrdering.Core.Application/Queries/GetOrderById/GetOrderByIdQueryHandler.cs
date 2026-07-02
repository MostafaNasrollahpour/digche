using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;
    private readonly IUserServiceClient _userServiceClient;

    public GetOrderByIdQueryHandler(
        IOrderRepository orderRepository,
        IUserContext userContext,
        IUserServiceClient userServiceClient)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        if (!_userContext.IsAuthenticated())
            return Result<OrderDto>.Failure("User not authenticated.");

        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<OrderDto>.Failure("سفارش یافت نشد.");

        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<OrderDto>.Failure("User ID not found in token.");

        if (order.CustomerId != userId && order.ChefId != userId)
            return Result<OrderDto>.Failure("شما دسترسی به این سفارش را ندارید.");

        // --- دریافت اطلاعات مشتری ---
        AuthUserDto customerInfo = null;
        try
        {
            // اگر کاربر جاری خود مشتری است، از همان استفاده می‌کنیم
            var targetCustomerId = (order.CustomerId == userId) ? userId : order.CustomerId;
            customerInfo = await _userServiceClient.GetUserInfoAsync(targetCustomerId, cancellationToken);
        }
        catch { /* در صورت خطا، مقدار پیش‌فرض استفاده می‌شود */ }

        var customerName = customerInfo != null ? GetDisplayName(customerInfo) : "نامشخص";
        var customerPhone = customerInfo?.Phone ?? "نامشخص";

        // --- دریافت اطلاعات آشپز ---
        AuthUserDto chefInfo = null;
        try
        {
            chefInfo = await _userServiceClient.GetUserInfoAsync(order.ChefId, cancellationToken);
        }
        catch { /* در صورت خطا، مقدار پیش‌فرض استفاده می‌شود */ }

        var chefName = chefInfo != null ? GetDisplayName(chefInfo) : "نامشخص";

        // --- نگاشت به DTO ---
        var orderDto = new OrderDto
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

        return Result<OrderDto>.Success(orderDto);
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