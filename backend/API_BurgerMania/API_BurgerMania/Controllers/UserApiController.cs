// importing namespaces
using API_BurgerMania.Data;
using API_BurgerMania.Models;
using API_BurgerMania.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// current namespace
namespace API_BurgerMania.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserApiController : ControllerBase
    {
        private readonly BurgerManiaDbContext _context; // for db
        private readonly ITokenService _tokenService; // for token

        public UserApiController(BurgerManiaDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        // GET: api/UserApi
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/UserApi/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<User>> GetUserById(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(); // Return 404 if user not found
            }

            return Ok(user); // Return the user details
        }

        // POST: api/UserApi
        [HttpPost("register")]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // Check if a user with the same username or mobile number already exists
            var existingUser = await _context.Users
                .AnyAsync(u => u.UserName == user.UserName || u.MobileNumber == user.MobileNumber);

            if (existingUser)
            {
                return Conflict("User with the same username or mobile number already exists."); // Return conflict if user exists
            }

            user.UserId = Guid.NewGuid(); // Generate new GUID for UserId

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // POST: api/UserApi/login
        [HttpPost("login")]
        public async Task<ActionResult<User>> LoginUser(User user)
        {
            // Find the existing user by username and mobile number
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == user.UserName && u.MobileNumber == user.MobileNumber);

            // Check if the user exists
            if (existingUser == null)
            {
                return NotFound(); // User not found
            }

            // generating token
            var token = _tokenService.GenerateToken(user.MobileNumber);

            // Return the existing user details
            return Ok(new
            {
                UserId = existingUser.UserId,
                UserName = existingUser.UserName,
                MobileNumber = existingUser.MobileNumber,
                Role = existingUser.Role,
                token = token
            });
        }

        // DELETE: api/UserApi/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
