using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarnelTravelGuide.API.Data;
using KarnelTravelGuide.API.DTOs.Admin;

namespace KarnelTravelGuide.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all bookings across the system with user details.
        /// </summary>
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new
                {
                    b.BookingId,
                    b.ReferenceNo,
                    b.UserId,
                    UserName = b.User != null ? b.User.FullName : string.Empty,
                    UserEmail = b.User != null ? b.User.Email : string.Empty,
                    UserPhone = b.User != null ? b.User.Phone : string.Empty,
                    b.ItemType,
                    b.ItemId,
                    b.StartDate,
                    b.EndDate,
                    b.Quantity,
                    b.TotalPrice,
                    b.Status,
                    b.AdminRemark,
                    b.CreatedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        /// <summary>
        /// Updates the status of a booking to 'Confirmed' or 'Rejected', decrementing item inventory if confirmed.
        /// </summary>
        [HttpPut("bookings/{id:int}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedStatus = dto.Status.Trim();
            if (!string.Equals(normalizedStatus, "Confirmed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(normalizedStatus, "Rejected", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Status must be either 'Confirmed' or 'Rejected'." });
            }

            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = $"Booking with ID {id} was not found." });
            }

            // If changing to Confirmed, decrement availability
            if (string.Equals(normalizedStatus, "Confirmed", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(booking.Status, "Confirmed", StringComparison.OrdinalIgnoreCase))
            {
                var itemType = booking.ItemType.Trim().ToLowerInvariant();
                switch (itemType)
                {
                    case "hotel":
                        var hotel = await _context.Hotels.FindAsync(booking.ItemId);
                        if (hotel != null)
                        {
                            hotel.RoomsAvailable = Math.Max(0, hotel.RoomsAvailable - booking.Quantity);
                        }
                        break;

                    case "resort":
                        var resort = await _context.Resorts.FindAsync(booking.ItemId);
                        if (resort != null)
                        {
                            resort.RoomsAvailable = Math.Max(0, resort.RoomsAvailable - booking.Quantity);
                        }
                        break;

                    case "transport":
                    case "transportoption":
                        var transport = await _context.TransportOptions.FindAsync(booking.ItemId);
                        if (transport != null)
                        {
                            transport.SeatsAvailable = Math.Max(0, transport.SeatsAvailable - booking.Quantity);
                        }
                        break;
                }
            }

            booking.Status = normalizedStatus;
            if (!string.IsNullOrEmpty(dto.AdminRemark))
            {
                booking.AdminRemark = dto.AdminRemark;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Booking {id} status updated to '{normalizedStatus}'.", booking });
        }

        /// <summary>
        /// Toggles the IsActive status of a catalog item (soft delete / reactivate).
        /// </summary>
        [HttpPut("catalog/{type}/{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleActive(string type, int id)
        {
            var normalizedType = type.Trim().ToLowerInvariant();

            switch (normalizedType)
            {
                case "spots":
                case "touristspots":
                    var spot = await _context.TouristSpots.FindAsync(id);
                    if (spot == null) return NotFound(new { message = $"Tourist spot with ID {id} not found." });
                    spot.IsActive = !spot.IsActive;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"Tourist spot '{spot.Name}' active state set to {spot.IsActive}.", id = spot.SpotId, isActive = spot.IsActive });

                case "hotels":
                    var hotel = await _context.Hotels.FindAsync(id);
                    if (hotel == null) return NotFound(new { message = $"Hotel with ID {id} not found." });
                    hotel.IsActive = !hotel.IsActive;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"Hotel '{hotel.Name}' active state set to {hotel.IsActive}.", id = hotel.HotelId, isActive = hotel.IsActive });

                case "resorts":
                    var resort = await _context.Resorts.FindAsync(id);
                    if (resort == null) return NotFound(new { message = $"Resort with ID {id} not found." });
                    resort.IsActive = !resort.IsActive;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"Resort '{resort.Name}' active state set to {resort.IsActive}.", id = resort.ResortId, isActive = resort.IsActive });

                case "restaurants":
                    var restaurant = await _context.Restaurants.FindAsync(id);
                    if (restaurant == null) return NotFound(new { message = $"Restaurant with ID {id} not found." });
                    restaurant.IsActive = !restaurant.IsActive;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"Restaurant '{restaurant.Name}' active state set to {restaurant.IsActive}.", id = restaurant.RestaurantId, isActive = restaurant.IsActive });

                case "transports":
                case "transportoptions":
                    var transport = await _context.TransportOptions.FindAsync(id);
                    if (transport == null) return NotFound(new { message = $"Transport option with ID {id} not found." });
                    transport.IsActive = !transport.IsActive;
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"Transport option active state set to {transport.IsActive}.", id = transport.TransportId, isActive = transport.IsActive });

                default:
                    return BadRequest(new { message = $"Invalid category '{type}'. Supported categories: spots, hotels, resorts, restaurants, transports." });
            }
        }
    }
}
