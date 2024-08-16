// importing namespace
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

// current namespace
namespace API_BurgerMania.Models
{
    public class Cart
    {
        // user id
        [Key]
        public Guid CartId { get; set; }  // unique identifier for the cart

        public Guid UserId { get; set; } // foreign key for the user
        public List<CartItem> CartItems { get; set; } = new List<CartItem>(); // list of cartItems
    }

    // CartSchema data structure
    public class CartItem
    {
        // cart Id
        [Key]
        public Guid Id { get; set; }  // primary key for CartItem

        public Guid CartId { get; set; } // foreign key for Cart

        public Guid BurgerId { get; set; }  // foreign key for Burger

        public string? BurgerName { get; set; } // burger name

        public string? BurgerCategory { get; set; } // burger category

        public int Quantity { get; set; } // burger quantity

        public decimal Price { get; set; } // burger price
    }
}