namespace FoodOrdering.Core.Application.DTOs;

public class DishDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Remaining { get; set; }  // <-- اضافه شد
    public Guid ChefId { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string? Ingredients { get; set; }
    public string? Description { get; set; }
    public bool IsAvailable { get; set; }
    public string? Category { get; set; }
    public double? Rating { get; set; }
    public string? Chef { get; set; }
    public string? Location { get; set; }
    public string? UserName { get; set; }
}