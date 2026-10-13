using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KarnelTravelGuide.API.Models
{
    public class TransportOption
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransportId { get; set; }

        [Required]
        public int FromCityId { get; set; }

        [ForeignKey(nameof(FromCityId))]
        public City? FromCity { get; set; }

        [Required]
        public int ToCityId { get; set; }

        [ForeignKey(nameof(ToCityId))]
        public City? ToCity { get; set; }

        [Required]
        [MaxLength(50)]
        public string Mode { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Operator { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, 1000000)]
        public decimal Price { get; set; }

        [MaxLength(200)]
        public string? Schedule { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int SeatsAvailable { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
