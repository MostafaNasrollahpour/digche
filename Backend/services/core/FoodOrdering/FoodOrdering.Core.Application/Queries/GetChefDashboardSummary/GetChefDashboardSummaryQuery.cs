using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.GetChefDashboardSummary;

public record GetChefDashboardSummaryQuery : IRequest<Result<ChefDashboardSummaryDto>>;