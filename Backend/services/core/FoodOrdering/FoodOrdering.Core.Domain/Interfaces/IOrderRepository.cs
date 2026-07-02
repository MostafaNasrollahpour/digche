using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellation = default);
    Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellation = default);
    Task<IEnumerable<Order>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default);
    Task AddAsync(Order order, CancellationToken cancellation = default);
    Task UpdateAsync(Order order, CancellationToken cancellation = default);
    Task<int> CountByChefIdCreatedBetweenAsync(
        Guid chefId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellation = default);

    Task<decimal> SumNonCancelledTotalPriceByChefIdCreatedBetweenAsync(
        Guid chefId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellation = default);
}