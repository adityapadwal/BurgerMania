// importing namespace
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// current namespace
namespace API_BurgerMania.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid UserId { get; set; } // unique identifier for user (primary key)

        [Required]
        [MaxLength(25)]
        public string? UserName { get; set; } // username for the user

        [Required]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile number must be 10 digits.")]
        public string? MobileNumber { get; set; } // mobile number acting as password
        
        [MaxLength(10)]
        public string? Role { get; set; } // user role: admin/customer
    }
}
