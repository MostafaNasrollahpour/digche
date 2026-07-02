using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly CoreDbContext _context;

        public CommentRepository(CoreDbContext context)
        {
            _context = context;
        }

        public async Task<Comment?> GetByIdAsync(Guid id, CancellationToken cancellation = default)
            => await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == id, cancellation);

        public async Task<IEnumerable<Comment>> GetByDishIdAsync(Guid dishId, CancellationToken cancellation = default)
            => await _context.Comments
                .Where(c => c.DishId == dishId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(cancellation);

        public async Task AddAsync(Comment comment, CancellationToken cancellation = default)
            => await _context.Comments.AddAsync(comment, cancellation);

        public Task UpdateAsync(Comment comment, CancellationToken cancellation = default)
        {
            _context.Comments.Update(comment);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(Guid id, CancellationToken cancellation = default)
        {
            // یافتن موجودیت قبل از حذف (برای جلوگیری از خطای دسترسی به سازنده خصوصی)
            var comment = await _context.Comments.FindAsync(new object[] { id }, cancellation);
            if (comment != null)
            {
                _context.Comments.Remove(comment);
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellation = default)
        {
            return await _context.SaveChangesAsync(cancellation);
        }

        public async Task<double?> GetAverageRatingByChefIdAsync(Guid chefId, CancellationToken cancellation = default)
        {
            var ratings = _context.Comments
                .Where(c => c.Rating.HasValue && c.Dish != null && c.Dish.ChefId == chefId)
                .Select(c => c.Rating!.Value);

            if (!await ratings.AnyAsync(cancellation))
                return null;

            return await ratings.AverageAsync(cancellation);
        }
    }
}