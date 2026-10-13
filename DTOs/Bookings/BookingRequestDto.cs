using System;
using System.ComponentModel.DataAnnotations;

namespace KarnelTravelGuide.API.DTOs.Bookings
{
    public class BookingRequestDto
    {
        [Required(ErrorMessage = "ItemType is required (e.g., Hotel, Resort, Transport).")]
        [MaxLength(50)]
        public string ItemType { get; set; } = string.Empty;

        [Required(ErrorMessage = "ItemId is required.")]
        public int ItemId { get; set; }

        [Required(ErrorMessage = "StartDate is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "EndDate is required.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Quantity is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; } = 1;
    }
}
