// importing namespaces
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization; // Import this for JsonIgnore

// current namespace
namespace API_BurgerMania.Models
{
    [Table("Burgers")]
    public class Burger
    {
        [Key]
        [JsonPropertyName("burgerId")]
        public Guid BurgerId { get; set; } // Burger Id (PK)

        [Required]
        [MaxLength(25)]
        [JsonPropertyName("burgerName")]
        public string? BurgerName { get; set; } // burger name

        [Required]
        [JsonPropertyName("burgerImageUrl")]
        public string? BurgerImageUrl { get; set; } // burger image url

        public Guid UserId { get; set; } // foreign key for User

        // This property will store the JSON representation of the dictionary
        [JsonIgnore]
        public string? BurgerCategoriesJson { get; set; }
        // This property is not mapped to the database
        [NotMapped]
        public Dictionary<string, decimal> BurgerCategories
        {
            get => string.IsNullOrEmpty(BurgerCategoriesJson)
                ? new Dictionary<string, decimal>()
                : JsonSerializer.Deserialize<Dictionary<string, decimal>>(BurgerCategoriesJson) ?? new Dictionary<string, decimal>();
            set => BurgerCategoriesJson = JsonSerializer.Serialize(value);
        }
    }
}
