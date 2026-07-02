using FoodOrdering.Core.Domain.Enums;

namespace FoodOrdering.Core.Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ChefId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime OrderedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}