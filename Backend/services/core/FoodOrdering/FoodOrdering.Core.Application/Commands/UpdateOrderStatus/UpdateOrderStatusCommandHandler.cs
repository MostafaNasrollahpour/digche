using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Domain.Enums;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result<bool>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUserContext _userContext;

    public UpdateOrderStatusCommandHandler(
        IOrderRepository orderRepository,
        IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _userContext = userContext;
    }

    public async Task<Result<bool>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        if (!string.Equals(_userContext.GetCurrentUserRole(), "chef", StringComparison.OrdinalIgnoreCase))
            return Result<bool>.Failure("Only chefs can update order status.");

        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<bool>.Failure("User ID not found in token.");

        var order = await _orderRepository.GetByIdWithItemsAsync(request.OrderId, cancellationToken);
        if (order is null)
            return Result<bool>.Failure("Order not found.");

        if (order.ChefId != chefId)
            return Result<bool>.Failure("You are not the chef for this order.");

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var targetStatus) ||
            !Enum.IsDefined(typeof(OrderStatus), targetStatus))
            return Result<bool>.Failure("Invalid order status.");

        if (targetStatus == OrderStatus.Shipped && !request.EstimatedDeliveryTime.HasValue)
            return Result<bool>.Failure("Estimated delivery time is required when shipping an order.");

        if (!order.ChangeStatus(targetStatus, request.EstimatedDeliveryTime))
            return Result<bool>.Failure("Order status cannot be changed to the requested status.");

        await _orderRepository.UpdateAsync(order, cancellationToken);

        return Result<bool>.Success(true);
    }
}