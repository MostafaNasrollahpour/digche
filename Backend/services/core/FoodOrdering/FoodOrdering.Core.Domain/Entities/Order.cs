using FoodOrdering.Core.Domain.Enums;

namespace FoodOrdering.Core.Domain.Entities;

public class Order
{
    public Guid Id { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid ChefId { get; private set; }
    public string DeliveryAddress { get; private set; }
    public decimal DeliveryFee { get; private set; }
    public DateTime? EstimatedDeliveryTime { get; private set; }
    public OrderStatus Status { get; private set; }
    public decimal TotalPrice { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    // public ChefProfile? Chef { get; private set; }

    private Order() { }

    public Order(Guid customerId, Guid chefId, string deliveryAddress, decimal deliveryFee)
    {
        Id = Guid.NewGuid();
        CustomerId = customerId;
        ChefId = chefId;
        DeliveryAddress = deliveryAddress ?? string.Empty;
        DeliveryFee = deliveryFee < 0 ? 0 : deliveryFee;
        Status = OrderStatus.Registered;
        CreatedAt = DateTime.UtcNow;
        TotalPrice = 0;
    }

    public bool AddItem(Dish dish, int quantity)
    {
        if (dish == null || quantity <= 0)
            return false;

        if (Status != OrderStatus.Registered)
            return false;

        if (!dish.HasEnoughStock(quantity) || !dish.ReduceStock(quantity))
            return false;

        var item = new OrderItem(Id, dish.Id, quantity, dish.Price);
        _items.Add(item);
        RecalculateTotal();
        return true;
    }

    public bool RemoveItem(Dish dish, Guid dishId)
    {
        if (dish == null)
            return false;

        if (Status != OrderStatus.Registered)
            return false;

        var item = _items.FirstOrDefault(i => i.DishId == dishId);
        if (item == null)
            return false;

        if (!dish.IncreaseStock(item.Quantity))
            return false;

        _items.Remove(item);
        RecalculateTotal();
        return true;
    }

    public bool ClearItems(Dictionary<Guid, Dish> dishDictionary)
    {
        if (dishDictionary == null)
            return false;

        if (Status != OrderStatus.Registered)
            return false;

        foreach (var item in _items)
        {
            if (dishDictionary.TryGetValue(item.DishId, out var dish))
            {
                if (!dish.IncreaseStock(item.Quantity))
                    return false;
            }
            else
            {
                return false;
            }
        }

        _items.Clear();
        RecalculateTotal();
        return true;
    }

    // ===== تغییر StartPreparing (فقط از Paid مجاز است) =====
    public bool StartPreparing()
    {
        if (Status != OrderStatus.Registered)
            return false;

        Status = OrderStatus.Preparing;
        return true;
    }

    public bool Ship(DateTime estimatedDeliveryTime)
    {
        if (Status != OrderStatus.Preparing)
            return false;

        if (estimatedDeliveryTime <= DateTime.UtcNow)
            return false;

        Status = OrderStatus.Shipped;
        EstimatedDeliveryTime = estimatedDeliveryTime;
        return true;
    }

    public bool Deliver()
    {
        if (Status != OrderStatus.Shipped)
            return false;

        Status = OrderStatus.Delivered;
        return true;
    }

    public bool Cancel()
    {
        if (Status != OrderStatus.Registered && Status != OrderStatus.Preparing)
            return false;

        Status = OrderStatus.Cancelled;
        return true;
    }

    public bool ChangeStatus(OrderStatus targetStatus, DateTime? estimatedDeliveryTime = null)
    {
        if (Status == targetStatus)
            return true;

        if (Status == OrderStatus.Cancelled || Status == OrderStatus.Delivered)
            return false;

        if (targetStatus == OrderStatus.Cancelled)
            return Cancel();

        if (targetStatus == OrderStatus.Registered)
            return false;

        if (GetWorkflowRank(targetStatus) <= GetWorkflowRank(Status))
            return false;

        return targetStatus switch
        {
            OrderStatus.Preparing => StartPreparing(),
            OrderStatus.Shipped when estimatedDeliveryTime.HasValue => Ship(estimatedDeliveryTime.Value),
            OrderStatus.Delivered => Deliver(),
            _ => false
        };
    }

    private static int GetWorkflowRank(OrderStatus status) => status switch
    {
        OrderStatus.Registered => 0,
        OrderStatus.Preparing => 1,
        OrderStatus.Shipped => 2,
        OrderStatus.Delivered => 3,
        _ => -1
    };

    private void RecalculateTotal()
    {
        TotalPrice = _items.Sum(i => i.TotalPrice) + DeliveryFee;
    }

    public override string ToString() =>
        $"Order {Id} - Status: {Status} - Total: {TotalPrice:C}";
}