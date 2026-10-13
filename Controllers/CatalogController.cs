using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KarnelTravelGuide.API.Data;
using KarnelTravelGuide.API.Models;

namespace KarnelTravelGuide.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CatalogController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all destination cities.
        /// </summary>
        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            var cities = await _context.Cities.OrderBy(c => c.Name).ToListAsync();
            return Ok(cities);
        }

        /// <summary>
        /// Retrieves active catalog items by category (spots, hotels, resorts, restaurants, transports),
        /// supporting both singular and plural forms, case-insensitively.
        /// </summary>
        [HttpGet("{type}")]
        public async Task<IActionResult> GetByType(string type)
        {
            var normalizedType = type?.Trim().ToLowerInvariant() ?? string.Empty;

            switch (normalizedType)
            {
                case "spots":
                case "spot":
                case "touristspots":
                case "touristspot":
                    var spots = await _context.TouristSpots
                        .Include(s => s.City)
                        .Where(s => s.IsActive)
                        .ToListAsync();
                    return Ok(spots);

                case "hotels":
                case "hotel":
                    var hotels = await _context.Hotels
                        .Include(h => h.City)
                        .Where(h => h.IsActive)
                        .ToListAsync();
                    return Ok(hotels);

                case "resorts":
                case "resort":
                    var resorts = await _context.Resorts
                        .Include(r => r.City)
                        .Where(r => r.IsActive)
                        .ToListAsync();
                    return Ok(resorts);

                case "restaurants":
                case "restaurant":
                    var restaurants = await _context.Restaurants
                        .Include(res => res.City)
                        .Where(res => res.IsActive)
                        .ToListAsync();
                    return Ok(restaurants);

                case "transports":
                case "transport":
                case "transportoptions":
                case "transportoption":
                    var transports = await _context.TransportOptions
                        .Include(t => t.FromCity)
                        .Include(t => t.ToCity)
                        .Where(t => t.IsActive)
                        .ToListAsync();
                    return Ok(transports);

                default:
                    return BadRequest(new { message = $"Invalid category '{type}'. Supported categories: spots, hotels, resorts, restaurants, transports." });
            }
        }

        /// <summary>
        /// Retrieves a single catalog item by ID with related City info,
        /// supporting both singular and plural forms, case-insensitively.
        /// </summary>
        [HttpGet("{type}/{id:int}")]
        public async Task<IActionResult> GetById(string type, int id)
        {
            var normalizedType = type?.Trim().ToLowerInvariant() ?? string.Empty;

            switch (normalizedType)
            {
                case "spots":
                case "spot":
                case "touristspots":
                case "touristspot":
                    var spot = await _context.TouristSpots
                        .Include(s => s.City)
                        .FirstOrDefaultAsync(s => s.SpotId == id);
                    if (spot == null) return NotFound(new { message = $"Tourist spot with ID {id} was not found." });
                    return Ok(spot);

                case "hotels":
                case "hotel":
                    var hotel = await _context.Hotels
                        .Include(h => h.City)
                        .FirstOrDefaultAsync(h => h.HotelId == id);
                    if (hotel == null) return NotFound(new { message = $"Hotel with ID {id} was not found." });
                    return Ok(hotel);

                case "resorts":
                case "resort":
                    var resort = await _context.Resorts
                        .Include(r => r.City)
                        .FirstOrDefaultAsync(r => r.ResortId == id);
                    if (resort == null) return NotFound(new { message = $"Resort with ID {id} was not found." });
                    return Ok(resort);

                case "restaurants":
                case "restaurant":
                    var restaurant = await _context.Restaurants
                        .Include(res => res.City)
                        .FirstOrDefaultAsync(res => res.RestaurantId == id);
                    if (restaurant == null) return NotFound(new { message = $"Restaurant with ID {id} was not found." });
                    return Ok(restaurant);

                case "transports":
                case "transport":
                case "transportoptions":
                case "transportoption":
                    var transport = await _context.TransportOptions
                        .Include(t => t.FromCity)
                        .Include(t => t.ToCity)
                        .FirstOrDefaultAsync(t => t.TransportId == id);
                    if (transport == null) return NotFound(new { message = $"Transport option with ID {id} was not found." });
                    return Ok(transport);

                default:
                    return BadRequest(new { message = $"Invalid category '{type}'. Supported categories: spots, hotels, resorts, restaurants, transports." });
            }
        }

        /// <summary>
        /// Unified query endpoint accepting optional query params: cityId, type, minPrice, maxPrice, minRating, keyword.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] int? cityId,
            [FromQuery] string? type,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] decimal? minRating,
            [FromQuery] string? keyword)
        {
            var normalizedType = type?.Trim().ToLowerInvariant();
            var kw = keyword?.Trim().ToLowerInvariant();

            var result = new Dictionary<string, object>();

            // 1. Tourist Spots
            if (string.IsNullOrEmpty(normalizedType) ||
                normalizedType == "spots" || normalizedType == "spot" ||
                normalizedType == "touristspots" || normalizedType == "touristspot")
            {
                var query = _context.TouristSpots.Include(s => s.City).Where(s => s.IsActive).AsQueryable();
                if (cityId.HasValue) query = query.Where(s => s.CityId == cityId.Value);
                if (!string.IsNullOrEmpty(kw))
                {
                    query = query.Where(s => s.Name.ToLower().Contains(kw) ||
                                             s.Description.ToLower().Contains(kw) ||
                                             s.Type.ToLower().Contains(kw));
                }
                result["spots"] = await query.ToListAsync();
            }

            // 2. Hotels
            if (string.IsNullOrEmpty(normalizedType) ||
                normalizedType == "hotels" || normalizedType == "hotel")
            {
                var query = _context.Hotels.Include(h => h.City).Where(h => h.IsActive).AsQueryable();
                if (cityId.HasValue) query = query.Where(h => h.CityId == cityId.Value);
                if (minPrice.HasValue) query = query.Where(h => h.PricePerNight >= minPrice.Value);
                if (maxPrice.HasValue) query = query.Where(h => h.PricePerNight <= maxPrice.Value);
                if (minRating.HasValue) query = query.Where(h => h.StarRating >= (int)minRating.Value);
                if (!string.IsNullOrEmpty(kw))
                {
                    query = query.Where(h => h.Name.ToLower().Contains(kw) ||
                                             h.Address.ToLower().Contains(kw) ||
                                             (h.Amenities != null && h.Amenities.ToLower().Contains(kw)));
                }
                result["hotels"] = await query.ToListAsync();
            }

            // 3. Resorts
            if (string.IsNullOrEmpty(normalizedType) ||
                normalizedType == "resorts" || normalizedType == "resort")
            {
                var query = _context.Resorts.Include(r => r.City).Where(r => r.IsActive).AsQueryable();
                if (cityId.HasValue) query = query.Where(r => r.CityId == cityId.Value);
                if (minPrice.HasValue) query = query.Where(r => r.PricePerNight >= minPrice.Value);
                if (maxPrice.HasValue) query = query.Where(r => r.PricePerNight <= maxPrice.Value);
                if (minRating.HasValue) query = query.Where(r => r.Rating >= minRating.Value);
                if (!string.IsNullOrEmpty(kw))
                {
                    query = query.Where(r => r.Name.ToLower().Contains(kw) ||
                                             (r.Amenities != null && r.Amenities.ToLower().Contains(kw)) ||
                                             (r.Activities != null && r.Activities.ToLower().Contains(kw)));
                }
                result["resorts"] = await query.ToListAsync();
            }

            // 4. Restaurants
            if (string.IsNullOrEmpty(normalizedType) ||
                normalizedType == "restaurants" || normalizedType == "restaurant")
            {
                var query = _context.Restaurants.Include(res => res.City).Where(res => res.IsActive).AsQueryable();
                if (cityId.HasValue) query = query.Where(res => res.CityId == cityId.Value);
                if (minPrice.HasValue) query = query.Where(res => res.AvgPrice >= minPrice.Value);
                if (maxPrice.HasValue) query = query.Where(res => res.AvgPrice <= maxPrice.Value);
                if (minRating.HasValue) query = query.Where(res => res.Rating >= minRating.Value);
                if (!string.IsNullOrEmpty(kw))
                {
                    query = query.Where(res => res.Name.ToLower().Contains(kw) ||
                                               (res.Cuisine != null && res.Cuisine.ToLower().Contains(kw)));
                }
                result["restaurants"] = await query.ToListAsync();
            }

            // 5. Transports
            if (string.IsNullOrEmpty(normalizedType) ||
                normalizedType == "transports" || normalizedType == "transport" ||
                normalizedType == "transportoptions" || normalizedType == "transportoption")
            {
                var query = _context.TransportOptions.Include(t => t.FromCity).Include(t => t.ToCity).Where(t => t.IsActive).AsQueryable();
                if (cityId.HasValue) query = query.Where(t => t.FromCityId == cityId.Value || t.ToCityId == cityId.Value);
                if (minPrice.HasValue) query = query.Where(t => t.Price >= minPrice.Value);
                if (maxPrice.HasValue) query = query.Where(t => t.Price <= maxPrice.Value);
                if (!string.IsNullOrEmpty(kw))
                {
                    query = query.Where(t => t.Mode.ToLower().Contains(kw) ||
                                             (t.Operator != null && t.Operator.ToLower().Contains(kw)));
                }
                result["transports"] = await query.ToListAsync();
            }

            return Ok(result);
        }
    }
}
