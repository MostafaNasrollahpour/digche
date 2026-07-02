namespace FoodOrdering.Core.Application.DTOs;

public class ChefDashboardSummaryDto
{
    public int TodayOrders { get; set; }
    public decimal CurrentMonthIncome { get; set; }
    public int ActiveDishes { get; set; }
    public double? CustomerRatingAverage { get; set; }
}