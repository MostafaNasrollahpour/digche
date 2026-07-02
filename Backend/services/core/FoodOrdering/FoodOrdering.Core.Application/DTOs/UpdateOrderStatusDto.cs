namespace FoodOrdering.Core.Application.DTOs;

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
    public DateTime? EstimatedDeliveryTime { get; set; }
}