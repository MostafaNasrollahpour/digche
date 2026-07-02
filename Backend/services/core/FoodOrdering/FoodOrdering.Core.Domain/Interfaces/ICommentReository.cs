using FoodOrdering.Core.Domain.Entities;

namespace FoodOrdering.Core.Domain.Interfaces
{
    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(Guid id, CancellationToken cancellation = default);
        Task<IEnumerable<Comment>> GetByDishIdAsync(Guid dishId, CancellationToken cancellation = default);
        Task AddAsync(Comment comment, CancellationToken cancellation = default);
        Task UpdateAsync(Comment comment, CancellationToken cancellation = default);
        Task DeleteAsync(Guid id, CancellationToken cancellation = default);
        Task<int> SaveChangesAsync(CancellationToken cancellation = default);
        Task<double?> GetAverageRatingByChefIdAsync(Guid chefId, CancellationToken cancellation = default);
    }
}