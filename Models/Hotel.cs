using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravelGuide.API.Models
{
    public class Hotel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HotelId { get; set; }

        [Required]
        public int CityId { get; set; }

        [ForeignKey(nameof(CityId))]
        public City? City { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 1000000)]
        public decimal PricePerNight { get; set; }

        [Required]
        [Range(1, 5)]
        public int StarRating { get; set; }

        [MaxLength(500)]
        public string? Amenities { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int RoomsAvailable { get; set; }

        [MaxLength(500)]
        public string? Image { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
