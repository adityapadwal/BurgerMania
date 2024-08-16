// importing namespaces
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using API_BurgerMania.Data;
using API_BurgerMania.Models;
using Microsoft.AspNetCore.Authorization;

// current namespace
namespace API_BurgerMania.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BurgerApiController : ControllerBase
    {
        private readonly BurgerManiaDbContext _context;

        public BurgerApiController(BurgerManiaDbContext context)
        {
            _context = context;
        }

        // GET: api/BurgerApi
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Burger>>> GetBurgers()
        {
            return await _context.Burgers.ToListAsync();
        }

        // POST: api/BurgerApi/{userId}
        [HttpPost("{userId}")]
        [Authorize()]
        public async Task<ActionResult<Burger>> PostBurgers(Guid userId, Burger burger)
        {
            // Generate a new GUID for the BurgerId
            burger.BurgerId = Guid.NewGuid();
            // Set the UserId for the burger
            burger.UserId = userId; 

            // check if burger already exixts
            if (BurgerExistsByName(burger.BurgerName))
            {
                return Conflict("A burger with the same name already exists.");
            }

            // add burger in db
            _context.Burgers.Add(burger);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the burger.");
            }

            return CreatedAtAction("GetBurgers", new { id = burger.BurgerId }, burger);
        }

        // DELETE: api/BurgerApi/{id}
        [HttpDelete("{id}")]
        [Authorize()]
        public async Task<IActionResult> DeleteBurger(Guid id)
        {
            var burger = await _context.Burgers.FindAsync(id);
            if (burger == null)
            {
                return NotFound();
            }

            _context.Burgers.Remove(burger);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/BurgerApi/{id}
        [HttpPut("{userId}/{burgerId}")]
        [Authorize()]
        public async Task<IActionResult> PutBurger(Guid userId, Guid burgerId, Burger burger)
        {
            // Check if the burger exists
            var existingBurger = await _context.Burgers.FindAsync(burgerId);
            if (existingBurger == null)
            {
                return NotFound();
            }

            // Check if the burger belongs to the user
            if (existingBurger.UserId != userId)
            {
                return Forbid();
            }

            // Update the burger properties
            existingBurger.BurgerName = burger.BurgerName;
            existingBurger.BurgerImageUrl = burger.BurgerImageUrl;
            existingBurger.BurgerCategories = burger.BurgerCategories;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle concurrency exception if needed
                throw;
            }

            return NoContent();
        }

        // helper functions
        private bool BurgerExistsByName(string burgerName)
        {
            return _context.Burgers.Any(b => b.BurgerName == burgerName);
        }
        private bool BurgerExists(Guid id)
        {
            return _context.Burgers.Any(e => e.BurgerId == id);
        }
    }
}
