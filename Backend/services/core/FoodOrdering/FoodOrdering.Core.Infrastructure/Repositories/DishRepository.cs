using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class DishRepository : IDishRepository
{
    private readonly CoreDbContext _context;

    public DishRepository(CoreDbContext context)
        => _context = context;

    public async Task<Dish?> GetByIdAsync(Guid id, CancellationToken cancellation = default)
        => await _context.Dishes
            .Include(d => d.Comments)  // <-- اضافه شد
            .FirstOrDefaultAsync(d => d.Id == id, cancellation);

    public async Task<IEnumerable<Dish>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default)
        => await _context.Dishes
            .Where(d => d.ChefId == chefId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellation);

    public async Task<IEnumerable<Dish>> GetAvailableDishesAsync(CancellationToken cancellation = default)
        => await _context.Dishes
            .Where(d => d.IsAvailable)
            .Include(d => d.Comments)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellation);

    public async Task AddAsync(Dish dish, CancellationToken cancellation = default)
    {
        await _context.Dishes.AddAsync(dish, cancellation);
        await _context.SaveChangesAsync(cancellation);
    }

    public async Task UpdateAsync(Dish dish, CancellationToken cancellation = default)
    {
        _context.Dishes.Update(dish);
        await _context.SaveChangesAsync(cancellation);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellation = default)
        => await _context.Dishes.AnyAsync(d => d.Id == id, cancellation);

    public async Task DeleteAsync(Dish dish, CancellationToken cancellation = default)
    {
        try
        {
            _context.Dishes.Remove(dish);
            await _context.SaveChangesAsync(cancellation);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("REFERENCE") == true)
        {
            // پرتاب یک استثنای خاص با پیام کاربرپسند
            throw new InvalidOperationException("این غذا در سفارشات یا سبد خرید کاربران استفاده شده و قابل حذف نیست.");
        }
    }

    public async Task<int> CountActiveByChefIdAsync(Guid chefId, CancellationToken cancellation = default)
        => await _context.Dishes
            .CountAsync(d => d.ChefId == chefId && d.IsAvailable, cancellation);

}