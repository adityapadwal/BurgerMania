// importing namespace
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using API_BurgerMania.Data;
using API_BurgerMania.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Channels;
using Microsoft.AspNetCore.Authorization;

// current namespace
namespace API_BurgerMania.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartApiController : ControllerBase
    {
        private readonly BurgerManiaDbContext _context;

        public CartApiController(BurgerManiaDbContext context)
        {
            _context = context;
        }

        // GET: api/CartApi/{userId}
        [HttpGet("{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCarts(Guid userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.UserId == userId)
                .SelectMany(c => c.CartItems)
                .ToListAsync();

            return Ok(cartItems);
        }

        // POST: api/CartApi/{userId}
        [HttpPost("{userId}")]
        [Authorize]
        public async Task<ActionResult<Cart>> PostCartItem(Guid userId, CartItem cartItem)
        {
            var cart = await _context.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    CartId = Guid.NewGuid(),
                    UserId = userId,
                    CartItems = new List<CartItem> { cartItem }
                };
                cartItem.CartId = cart.CartId; // Set the CartId in CartItem
                _context.Carts.Add(cart);
            }
            else
            {
                cartItem.CartId = cart.CartId; // Set the CartId in CartItem
                var existingItem = cart.CartItems.FirstOrDefault(ci => ci.BurgerId == cartItem.BurgerId && ci.BurgerCategory == cartItem.BurgerCategory);
                if (existingItem != null)
                {
                    existingItem.Quantity += cartItem.Quantity;
                }
                else
                {
                    cart.CartItems.Add(cartItem);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(cart);
        }

        // DELETE: api/CartApi/{userId}/{burgerId}/{burgerCategory}
        [HttpDelete("{userId}/{burgerId}/{burgerCategory}")]
        [Authorize]
        public async Task<IActionResult> DeleteCartItem(Guid userId, Guid burgerId, string burgerCategory)
        {
            var cart = await _context.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                return NotFound();
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.BurgerId == burgerId && ci.BurgerCategory == burgerCategory);
            if (cartItem == null)
            {
                return NotFound();
            }

            cart.CartItems.Remove(cartItem);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
