using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace KarnelTravelGuide.API.Models
{
    public class City
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CityId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Region { get; set; } = string.Empty;

        // Navigation properties - ignored during serialization to prevent circular references
        [JsonIgnore]
        public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();

        [JsonIgnore]
        public ICollection<TouristSpot> TouristSpots { get; set; } = new List<TouristSpot>();

        [JsonIgnore]
        public ICollection<Resort> Resorts { get; set; } = new List<Resort>();

        [JsonIgnore]
        public ICollection<Restaurant> Restaurants { get; set; } = new List<Restaurant>();

        [JsonIgnore]
        [InverseProperty(nameof(TransportOption.FromCity))]
        public ICollection<TransportOption> OutgoingTransports { get; set; } = new List<TransportOption>();

        [JsonIgnore]
        [InverseProperty(nameof(TransportOption.ToCity))]
        public ICollection<TransportOption> IncomingTransports { get; set; } = new List<TransportOption>();
    }
}
