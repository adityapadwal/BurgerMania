// importing namespaces
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// current namespace
namespace API_BurgerMania.Models
{
    [Table("Orders")]
    public class Order
    {
        [Key]
        public Guid OrderId { get; set; } // unique identifier for the order (PK)

        public Guid UserId { get; set; } // foreign key for User

        public int TotalQuantity { get; set; } // total quantity of products

        public decimal TotalPrice { get; set; } // total price of products

        public decimal Discount { get; set; } // discount percntage

        public decimal FinalPrice { get; set; } // final price after discount

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Timestamp for order creation

        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>(); // products that were ordered
    }

    [Table("OrderItems")]
    public class OrderItem
    {
        [Key]
        public int Id { get; set; } // primary key for OrderItem

        public Guid OrderId { get; set; } // foreign key for Order

        public Guid BurgerId { get; set; } // foreign key for Burger

        public string? BurgerName { get; set; } // burger name

        public string? BurgerCategory { get; set; } // burger category

        public int Quantity { get; set; } // burger quantity

        public decimal Price { get; set; } // burger price
    }
}