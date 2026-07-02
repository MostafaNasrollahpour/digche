using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.GetChefDashboardSummary;

public class GetChefDashboardSummaryQueryHandler : IRequestHandler<GetChefDashboardSummaryQuery, Result<ChefDashboardSummaryDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IDishRepository _dishRepository;
    private readonly ICommentRepository _commentRepository;
    private readonly IUserContext _userContext;

    public GetChefDashboardSummaryQueryHandler(
        IOrderRepository orderRepository,
        IDishRepository dishRepository,
        ICommentRepository commentRepository,
        IUserContext userContext)
    {
        _orderRepository = orderRepository;
        _dishRepository = dishRepository;
        _commentRepository = commentRepository;
        _userContext = userContext;
    }

    public async Task<Result<ChefDashboardSummaryDto>> Handle(GetChefDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        if (!string.Equals(_userContext.GetCurrentUserRole(), "chef", StringComparison.OrdinalIgnoreCase))
            return Result<ChefDashboardSummaryDto>.Failure("Only chefs can view dashboard summary.");

        if (!_userContext.TryGetCurrentUserId(out var chefId))
            return Result<ChefDashboardSummaryDto>.Failure("User ID not found in token.");

        var now = DateTime.UtcNow;
        var todayStartUtc = now.Date;
        var tomorrowStartUtc = todayStartUtc.AddDays(1);
        var monthStartUtc = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonthStartUtc = monthStartUtc.AddMonths(1);

        var todayOrders = await _orderRepository.CountByChefIdCreatedBetweenAsync(
            chefId,
            todayStartUtc,
            tomorrowStartUtc,
            cancellationToken);

        var currentMonthIncome = await _orderRepository.SumNonCancelledTotalPriceByChefIdCreatedBetweenAsync(
            chefId,
            monthStartUtc,
            nextMonthStartUtc,
            cancellationToken);

        var activeDishes = await _dishRepository.CountActiveByChefIdAsync(chefId, cancellationToken);

        var customerRatingAverage = await _commentRepository.GetAverageRatingByChefIdAsync(
            chefId,
            cancellationToken);

        var dto = new ChefDashboardSummaryDto
        {
            TodayOrders = todayOrders,
            CurrentMonthIncome = currentMonthIncome,
            ActiveDishes = activeDishes,
            CustomerRatingAverage = customerRatingAverage
        };

        return Result<ChefDashboardSummaryDto>.Success(dto);
    }
}