// importing namespaces
using API_BurgerMania.Data;
using API_BurgerMania.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// current namespace
namespace API_BurgerMania.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderApiController : ControllerBase
    {
        private readonly BurgerManiaDbContext _context;

        public OrderApiController(BurgerManiaDbContext context)
        {
            _context = context;
        }

        // GET: api/OrderApi/orders/{userId}
        [HttpGet("orders/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders(Guid userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems) // Include order items
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/OrderApi/all
        [HttpGet("all")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems) // Include order items
                .ToListAsync();

            return Ok(orders);
        }

        // POST: api/OrderApi/{userId}
        [HttpPost("{userId}")]
        [Authorize]
        public async Task<ActionResult<Order>> PostOrder(Guid userId)
        {
            // Fetch the current cart
            var cart = await _context.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest("Cart is empty. Please add items to the cart before ordering.");
            }

            // Create a new order
            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId, // Set the UserId for the order
                TotalQuantity = cart.CartItems.Sum(ci => ci.Quantity),
                TotalPrice = cart.CartItems.Sum(ci => ci.Quantity * ci.Price),
            };

            // Populate OrderItems from CartItems
            foreach (var cartItem in cart.CartItems)
            {
                order.OrderItems.Add(new OrderItem
                {
                    BurgerId = cartItem.BurgerId,
                    BurgerName = cartItem.BurgerName,
                    BurgerCategory = cartItem.BurgerCategory,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.Price
                });
            }

            var totalPrice = order.TotalPrice;
            if (totalPrice >= 1000)
            {
                order.Discount = 0.10m; // 10% discount
            }
            else if (totalPrice >= 500)
            {
                order.Discount = 0.05m; // 5% discount
            }
            else
            {
                order.Discount = 0m; // no discount
            }

            order.FinalPrice = totalPrice * (1 - order.Discount);

            // Add the order to the database
            _context.Orders.Add(order);

            // Clear the cart
            cart.CartItems.Clear();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the order: " + ex.Message);
            }

            return CreatedAtAction(nameof(GetOrders), new { userId = order.UserId }, order);
        }
    }
}