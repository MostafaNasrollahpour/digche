using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FoodOrdering.Core.Application.Commands.CreateOrder;
using FoodOrdering.Core.Application.Commands.ApproveOrder;   // اضافه
using FoodOrdering.Core.Application.Commands.PayOrder;        // اضافه

namespace FoodOrdering.Core.API.Controllers;

[ApiController]
[Route("api/core/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var command = new CreateOrderCommand(dto);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        var order = result.Data!;
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var query = new GetOrderByIdQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { message = result.ErrorMessage });

        return Ok(result);
    }

    [HttpGet("customer")]
    public async Task<IActionResult> GetMyOrders()
    {
        var query = new GetCustomerOrdersQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    [HttpGet("chef")]
    [Authorize(Roles = "chef")]
    public async Task<IActionResult> GetChefOrders()
    {
        var query = new GetChefOrdersQuery();
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result);
    }

    // ===== اکشن جدید برای تأیید سفارش توسط آشپز =====
    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "chef")]
    public async Task<IActionResult> ApproveOrder(Guid id)
    {
        var command = new ApproveOrderCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Order approved successfully." });
    }

    // ===== اکشن جدید برای پرداخت توسط مشتری =====
    [HttpPost("{id:guid}/pay")]
    public async Task<IActionResult> PayOrder(Guid id)
    {
        var command = new PayOrderCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(new { message = "Payment successful. Money transferred to chef." });
    }
}