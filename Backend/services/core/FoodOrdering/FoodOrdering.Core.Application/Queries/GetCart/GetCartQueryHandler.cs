using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.Carts;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    private readonly ICartRepository _cartRepository;
    private readonly IUserContext _userContext;

    public GetCartQueryHandler(ICartRepository cartRepository, IUserContext userContext)
    {
        _cartRepository = cartRepository;
        _userContext = userContext;
    }

    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        // دریافت شناسه کاربر جاری
        if (!_userContext.TryGetCurrentUserId(out var userId))
            return Result<CartDto>.Failure("User ID not found in token.");

        // دریافت سبد خرید
        var cart = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);

        // اگر سبد خرید وجود نداشت، یک سبد خالی برگردان
        if (cart is null)
        {
            return Result<CartDto>.Success(new CartDto
            {
                Id = Guid.Empty,
                UserId = userId,
                Items = new List<CartItemDto>()
            });
        }

        // نگاشت دستی به DTO
        var cartDto = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(item => new CartItemDto
            {
                DishId = item.DishId,
                DishName = item.Dish?.Name ?? "نامشخص",
                Quantity = item.Quantity,
                UnitPrice = item.Dish?.Price ?? 0,
                ChefId = item.Dish?.ChefId ?? Guid.Empty,
            }).ToList()
        };

        return Result<CartDto>.Success(cartDto);
    }
}