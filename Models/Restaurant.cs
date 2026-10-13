using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravelGuide.API.Models
{
    public class Restaurant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RestaurantId { get; set; }

        [Required]
        public int CityId { get; set; }

        [ForeignKey(nameof(CityId))]
        public City? City { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Cuisine { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 1000000)]
        public decimal AvgPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(3,1)")]
        [Range(0.0, 5.0)]
        public decimal Rating { get; set; }

        [MaxLength(100)]
        public string? Timings { get; set; }

        [MaxLength(500)]
        public string? Image { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
