using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IDishRepository _dishRepository;
    private readonly IUserContext _userContext;

    public CreateOrderCommandHandler(
        ICartRepository cartRepository,
        IOrderRepository orderRepository,
        IDishRepository dishRepository,
        IUserContext userContext)
    {
        _cartRepository = cartRepository;
        _orderRepository = orderRepository;
        _dishRepository = dishRepository;
        _userContext = userContext;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        if (!_userContext.TryGetCurrentUserId(out var customerId))
            return Result<OrderDto>.Failure("User ID not found in token.");

        var dto = request.Dto;

        if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
            return Result<OrderDto>.Failure("آدرس تحویل نمی‌تواند خالی باشد.");

        if (dto.DeliveryAddress.Length < 10)
            return Result<OrderDto>.Failure("آدرس تحویل باید حداقل ۱۰ کاراکتر باشد.");

        var cart = await _cartRepository.GetByUserIdWithItemsAsync(customerId, cancellationToken);
        if (cart is null || !cart.Items.Any())
            return Result<OrderDto>.Failure("سبد خرید خالی است.");

        var cartDishes = new Dictionary<Guid, Dish>();

        foreach (var cartItem in cart.Items)
        {
            var dish = await _dishRepository.GetByIdAsync(cartItem.DishId, cancellationToken);
            if (dish is null)
                return Result<OrderDto>.Failure($"غذایی با شناسه {cartItem.DishId} یافت نشد.");

            if (!dish.IsAvailable || !dish.HasEnoughStock(cartItem.Quantity))
                return Result<OrderDto>.Failure($"غذای '{dish.Name}' موجود نیست یا موجودی کافی نیست.");

            cartDishes[cartItem.DishId] = dish;
        }

        var chefIds = cartDishes.Values.Select(d => d.ChefId).Distinct().ToList();
        if (chefIds.Count != 1)
            return Result<OrderDto>.Failure("همه آیتم‌های سفارش باید متعلق به یک آشپز باشند.");

        var deliveryFee = 100;

        var order = new Order(
            customerId,
            chefIds[0],
            dto.DeliveryAddress,
            deliveryFee
        );

        foreach (var cartItem in cart.Items)
        {
            var dish = cartDishes[cartItem.DishId];

            if (!order.AddItem(dish, cartItem.Quantity))
                return Result<OrderDto>.Failure($"خطا در افزودن آیتم '{dish.Name}' به سفارش.");
        }

        await _orderRepository.AddAsync(order, cancellationToken);

        cart.Clear();
        await _cartRepository.UpdateAsync(cart, cancellationToken);

        var orderDto = new OrderDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            ChefId = order.ChefId,
            DeliveryAddress = order.DeliveryAddress,
            DeliveryFee = order.DeliveryFee,
            EstimatedDeliveryTime = order.EstimatedDeliveryTime,
            Status = order.Status,
            TotalPrice = order.TotalPrice,
            CreatedAt = order.CreatedAt,
            OrderedAt = order.CreatedAt,
            Items = order.Items.Select(item =>
            {
                var dish = cartDishes.GetValueOrDefault(item.DishId);

                return new OrderItemDto
                {
                    DishId = item.DishId,
                    DishName = dish?.Name ?? "نامشخص",
                    FoodId = item.DishId,
                    FoodTitle = dish?.Name ?? "نامشخص",
                    FoodImage = dish?.ImageUrl ?? string.Empty,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Price = item.UnitPrice,
                    Unit = "تومان"
                };
            }).ToList()
        };

        return Result<OrderDto>.Success(orderDto);
    }
}