using System.ComponentModel.DataAnnotations;

namespace KarnelTravelGuide.API.DTOs.Admin
{
    public class UpdateBookingStatusDto
    {
        [Required(ErrorMessage = "Status is required (Confirmed or Rejected).")]
        public string Status { get; set; } = string.Empty;

        public string? AdminRemark { get; set; }
    }
}
