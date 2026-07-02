using FoodOrdering.Core.Application.Common;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand(
    Guid OrderId,
    string Status,
    DateTime? EstimatedDeliveryTime) : IRequest<Result<bool>>;