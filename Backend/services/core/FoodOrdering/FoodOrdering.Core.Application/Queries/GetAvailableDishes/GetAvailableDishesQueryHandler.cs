using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries;

public class GetAvailableDishesQueryHandler : IRequestHandler<GetAvailableDishesQuery, Result<IEnumerable<DishDto>>>
{
    private readonly IDishRepository _dishRepository;
    private readonly IUserServiceClient _userServiceClient;

    public GetAvailableDishesQueryHandler(IDishRepository dishRepository, IUserServiceClient userServiceClient)
    {
        _dishRepository = dishRepository;
        _userServiceClient = userServiceClient;
    }

    public async Task<Result<IEnumerable<DishDto>>> Handle(GetAvailableDishesQuery request, CancellationToken cancellationToken)
    {
        var dishes = await _dishRepository.GetAvailableDishesAsync(cancellationToken);
        if (dishes == null || !dishes.Any())
            return Result<IEnumerable<DishDto>>.Success(Enumerable.Empty<DishDto>());

        // گرفتن تمام اطلاعات کاربران به صورت موازی
        var chefIds = dishes.Select(d => d.ChefId).Distinct();
        var userTasks = chefIds.ToDictionary(
            id => id,
            id => _userServiceClient.GetUserInfoAsync(id, cancellationToken)
        );
        await Task.WhenAll(userTasks.Values);

        // ساخت DTO
        var dtos = dishes.Select(d =>
        {
            var userInfo = userTasks.TryGetValue(d.ChefId, out var task) ? task.Result : null;

            // استخراج نام و شهر
            string? chefCity = null;
            string? chefName = null;
            string? userName = null;
            if (userInfo != null)
            {
                chefCity = userInfo.Address;
                chefName = userInfo.DisplayName;
                userName = userInfo.Username;
                if (string.IsNullOrWhiteSpace(chefName))
                {
                    chefName = $"{userInfo.FirstName} {userInfo.LastName}".Trim();
                    if (string.IsNullOrWhiteSpace(chefName))
                        chefName = userInfo.Username;
                }
            }

            // محاسبه میانگین امتیاز
            double? avg = null;
            if (d.Comments.Any(c => c.Rating.HasValue))
                avg = d.Comments.Where(c => c.Rating.HasValue).Average(c => c.Rating.Value);

            return new DishDto
            {
                Id = d.Id,
                ChefId = d.ChefId,
                Title = d.Name,
                Description = d.Description,
                Price = d.Price,
                Image = d.ImageUrl,
                Ingredients = d.Ingredients,
                IsAvailable = d.IsAvailable,
                Remaining = d.StockQuantity,
                Category = d.Category,
                Rating = avg,
                Location = chefCity,
                Chef = chefName,
                UserName = userName
            };
        });

        return Result<IEnumerable<DishDto>>.Success(dtos);
    }
}