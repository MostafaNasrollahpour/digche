namespace FoodOrdering.Core.Domain.Enums;

public enum OrderStatus
{
    Registered = 0,
    ChefApproved = 1,
    Preparing = 3,
    Shipped = 4,
    Delivered = 5,
    Cancelled = 6
}