using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetDishByIdQueryHandler : IRequestHandler<GetDishByIdQuery, Result<DishDto>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IUserServiceClient _userServiceClient;

    public GetDishByIdQueryHandler(IDishRepository dishRepository, IUserServiceClient userServiceClient)
    {
        _dishRepository = dishRepository;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<DishDto>> Handle(GetDishByIdQuery request, CancellationToken cancellationToken)
    {
        var dish = await _dishRepository.GetByIdAsync(request.Id, cancellationToken);
        if (dish is null)
            return Result<DishDto>.Failure("غذا یافت نشد.");

        // دریافت اطلاعات کاربر
        string? chefCity = null;
        string? chefName = null;
        string? userName = null;
        var userInfo = await _userServiceClient.GetUserInfoAsync(dish.ChefId, cancellationToken);
        if (userInfo != null)
        {
            chefCity = userInfo.Address;  // شهر
            chefName = userInfo.DisplayName;  // اسم نمایشی
            userName = userInfo.Username;
            if (string.IsNullOrWhiteSpace(chefName))
            {
                // اگر DisplayName خالی بود، از FirstName و LastName ترکیب کن
                chefName = $"{userInfo.FirstName} {userInfo.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(chefName))
                    chefName = userInfo.Username;  // باز هم اگر خالی بود، از Username استفاده کن
            }
        }

        // محاسبه میانگین امتیاز
        double? avgRating = null;
        if (dish.Comments.Any(c => c.Rating.HasValue))
            avgRating = dish.Comments.Where(c => c.Rating.HasValue).Average(c => c.Rating.Value);

        var dto = new DishDto
        {
            Id = dish.Id,
            ChefId = dish.ChefId,
            Title = dish.Name,
            Description = dish.Description,
            Price = dish.Price,
            Image = dish.ImageUrl,
            Ingredients = dish.Ingredients,
            IsAvailable = dish.IsAvailable,
            Remaining = dish.StockQuantity,
            Category = dish.Category,
            Rating = avgRating,
            Location = chefCity,
            Chef = chefName,
            UserName = userName
        };

        return Result<DishDto>.Success(dto);
    }
}