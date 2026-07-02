using FoodOrdering.Core.Domain.Enums;

namespace FoodOrdering.Core.Application.DTOs;


public class OrderItemDto
{
    public Guid FoodId { get; set; }
    public string FoodTitle { get; set; } = string.Empty;
    public string FoodImage { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; } // قیمت واحد
    public string Unit { get; set; } = string.Empty;
}