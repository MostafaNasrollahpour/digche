namespace FoodOrdering.Core.Application.DTOs;

public class CartItemDto
{
    public Guid DishId { get; set; }
    public Guid ChefId { get; set; }
    public string DishName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}