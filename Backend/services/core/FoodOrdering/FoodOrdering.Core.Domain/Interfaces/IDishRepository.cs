using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Interfaces;


public interface IDishRepository
{
    Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellation = default);
    Task<IEnumerable<Dish>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default);
    Task<IEnumerable<Dish>> GetAvailableDishesAsync(CancellationToken cancellation = default); // جدید
    Task AddAsync(Dish dish, CancellationToken cancellation = default);
    Task UpdateAsync(Dish dish, CancellationToken cancellation = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellation = default);
    Task DeleteAsync(Dish dish, CancellationToken cancellation = default);
    Task<int> CountActiveByChefIdAsync(Guid chefId, CancellationToken cancellation = default);
}