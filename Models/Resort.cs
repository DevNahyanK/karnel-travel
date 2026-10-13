using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravelGuide.API.Models
{
    public class Resort
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResortId { get; set; }

        [Required]
        public int CityId { get; set; }

        [ForeignKey(nameof(CityId))]
        public City? City { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 1000000)]
        public decimal PricePerNight { get; set; }

        [Required]
        [Column(TypeName = "decimal(3,1)")]
        [Range(0.0, 5.0)]
        public decimal Rating { get; set; }

        [MaxLength(500)]
        public string? Amenities { get; set; }

        [MaxLength(500)]
        public string? Activities { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int RoomsAvailable { get; set; }

        [MaxLength(500)]
        public string? Image { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
