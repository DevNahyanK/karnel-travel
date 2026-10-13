using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarnelTravelGuide.API.Data;
using KarnelTravelGuide.API.DTOs.Bookings;
using KarnelTravelGuide.API.Models;

namespace KarnelTravelGuide.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates a new booking in Pending status linked to the authenticated user.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identification in token." });
            }

            if (dto.EndDate < dto.StartDate)
            {
                return BadRequest(new { message = "EndDate cannot be earlier than StartDate." });
            }

            decimal totalPrice = 0;
            var normalizedItemType = dto.ItemType.Trim().ToLowerInvariant();

            // Validate item availability and calculate total price
            switch (normalizedItemType)
            {
                case "hotel":
                    var hotel = await _context.Hotels.FindAsync(dto.ItemId);
                    if (hotel == null || !hotel.IsActive)
                    {
                        return NotFound(new { message = $"Hotel with ID {dto.ItemId} does not exist or is inactive." });
                    }
                    if (dto.Quantity > hotel.RoomsAvailable)
                    {
                        return BadRequest(new { message = $"Requested quantity ({dto.Quantity}) exceeds available rooms ({hotel.RoomsAvailable})." });
                    }
                    var hotelNights = Math.Max(1, (int)(dto.EndDate.Date - dto.StartDate.Date).TotalDays);
                    totalPrice = hotel.PricePerNight * dto.Quantity * hotelNights;
                    break;

                case "resort":
                    var resort = await _context.Resorts.FindAsync(dto.ItemId);
                    if (resort == null || !resort.IsActive)
                    {
                        return NotFound(new { message = $"Resort with ID {dto.ItemId} does not exist or is inactive." });
                    }
                    if (dto.Quantity > resort.RoomsAvailable)
                    {
                        return BadRequest(new { message = $"Requested quantity ({dto.Quantity}) exceeds available rooms ({resort.RoomsAvailable})." });
                    }
                    var resortNights = Math.Max(1, (int)(dto.EndDate.Date - dto.StartDate.Date).TotalDays);
                    totalPrice = resort.PricePerNight * dto.Quantity * resortNights;
                    break;

                case "transport":
                case "transportoption":
                    var transport = await _context.TransportOptions.FindAsync(dto.ItemId);
                    if (transport == null || !transport.IsActive)
                    {
                        return NotFound(new { message = $"Transport option with ID {dto.ItemId} does not exist or is inactive." });
                    }
                    if (dto.Quantity > transport.SeatsAvailable)
                    {
                        return BadRequest(new { message = $"Requested quantity ({dto.Quantity}) exceeds available seats ({transport.SeatsAvailable})." });
                    }
                    totalPrice = transport.Price * dto.Quantity;
                    break;

                default:
                    return BadRequest(new { message = $"Unsupported booking item type '{dto.ItemType}'. Supported types: Hotel, Resort, Transport." });
            }

            // Generate unique reference number
            var referenceNo = $"BKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";

            var booking = new Booking
            {
                ReferenceNo = referenceNo,
                UserId = userId,
                ItemType = dto.ItemType,
                ItemId = dto.ItemId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Quantity = dto.Quantity,
                TotalPrice = totalPrice,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();

            return Ok(booking);
        }

        /// <summary>
        /// Retrieves all bookings for the currently authenticated user.
        /// </summary>
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identification in token." });
            }

            var bookings = await _context.Bookings
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        /// <summary>
        /// Cancels a pending booking belonging to the authenticated user.
        /// </summary>
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identification in token." });
            }

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == id && b.UserId == userId);
            if (booking == null)
            {
                return NotFound(new { message = $"Booking with ID {id} was not found." });
            }

            if (!string.Equals(booking.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = $"Only 'Pending' bookings can be cancelled. Current status is '{booking.Status}'." });
            }

            booking.Status = "Cancelled";
            booking.AdminRemark = "Cancelled by user.";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking has been successfully cancelled.", booking });
        }
    }
}
