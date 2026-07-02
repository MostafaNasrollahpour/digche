using FoodOrdering.Core.Application.Queries.GetChefDashboardSummary;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/chef/dashboard")]
[Authorize(Roles = "chef")]
public class ChefDashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChefDashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _mediator.Send(new GetChefDashboardSummaryQuery());

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }
}