using FoodOrdering.Core.Domain.Entities;
using FoodOrdering.Core.Domain.Interfaces;
using FoodOrdering.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using FoodOrdering.Core.Domain.Enums;

namespace FoodOrdering.Core.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly CoreDbContext _context;

    public OrderRepository(CoreDbContext context) => _context = context;

    public async Task<Order?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellation = default)
        => await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Dish)
            .FirstOrDefaultAsync(o => o.Id == id, cancellation);

    public async Task<IEnumerable<Order>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellation = default)
        => await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Dish)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellation);

    
    public async Task<IEnumerable<Order>> GetByChefIdAsync(Guid chefId, CancellationToken cancellation = default)
        => await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Dish)
            .Where(o => o.ChefId == chefId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellation);

    public async Task AddAsync(Order order, CancellationToken cancellation = default)
        => await _context.Orders.AddAsync(order, cancellation);

    public async Task UpdateAsync(Order order, CancellationToken cancellation = default)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync(cancellation);
    }

    public async Task<int> CountByChefIdCreatedBetweenAsync(
        Guid chefId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellation = default)
        => await _context.Orders
            .CountAsync(o =>
                o.ChefId == chefId &&
                o.CreatedAt >= startUtc &&
                o.CreatedAt < endUtc,
                cancellation);

    public async Task<decimal> SumNonCancelledTotalPriceByChefIdCreatedBetweenAsync(
        Guid chefId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellation = default)
        => await _context.Orders
            .Where(o =>
                o.ChefId == chefId &&
                o.CreatedAt >= startUtc &&
                o.CreatedAt < endUtc &&
                o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalPrice, cancellation) ?? 0;


}