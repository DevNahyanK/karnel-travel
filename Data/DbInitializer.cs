using System;
using System.Collections.Generic;
using System.Linq;
using KarnelTravelGuide.API.Models;

namespace KarnelTravelGuide.API.Data
{
    public static class DbInitializer
    {
        public static void SeedData(ApplicationDbContext context)
        {
            // Ensure the database and tables are created
            context.Database.EnsureCreated();

            // 1. Seed Users if empty
            if (!context.Users.Any())
            {
                var adminUser = new User
                {
                    FullName = "System Administrator",
                    Email = "admin@karnel.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Phone = "+923001234567",
                    Role = "Admin",
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                var customerUser = new User
                {
                    FullName = "Test Customer",
                    Email = "customer@karnel.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
                    Phone = "+923009876543",
                    Role = "Customer",
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.AddRange(adminUser, customerUser);
                context.SaveChanges();
            }

            // 2. Seed Cities if empty
            if (!context.Cities.Any())
            {
                var defaultCities = new List<City>
                {
                    new City { Name = "Karachi", Region = "Sindh" },
                    new City { Name = "Lahore", Region = "Punjab" },
                    new City { Name = "Islamabad", Region = "Federal Capital" },
                    new City { Name = "Murree", Region = "Punjab / Galyat" },
                    new City { Name = "Hunza", Region = "Gilgit-Baltistan" }
                };

                context.Cities.AddRange(defaultCities);
                context.SaveChanges();
            }

            // Fetch cities from DB to ensure valid foreign keys
            var allCities = context.Cities.ToList();
            if (allCities.Count == 0) return;

            var karachi = allCities.FirstOrDefault(c => c.Name == "Karachi") ?? allCities[0];
            var lahore = allCities.FirstOrDefault(c => c.Name == "Lahore") ?? allCities[Math.Min(1, allCities.Count - 1)];
            var islamabad = allCities.FirstOrDefault(c => c.Name == "Islamabad") ?? allCities[Math.Min(2, allCities.Count - 1)];
            var murree = allCities.FirstOrDefault(c => c.Name == "Murree") ?? allCities[Math.Min(3, allCities.Count - 1)];
            var hunza = allCities.FirstOrDefault(c => c.Name == "Hunza") ?? allCities[Math.Min(4, allCities.Count - 1)];

            // 3. Seed Tourist Spots if empty
            if (!context.TouristSpots.Any())
            {
                var spots = new List<TouristSpot>
                {
                    new TouristSpot
                    {
                        CityId = karachi.CityId,
                        Name = "Clifton Beach & Sea View",
                        Type = "Beach",
                        Description = "Expansive Arabian Sea coastline renowned for camel rides, sunset strolls, and beachfront dining.",
                        BestSeason = "Winter (Nov - Feb)",
                        Image = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                        IsActive = true
                    },
                    new TouristSpot
                    {
                        CityId = lahore.CityId,
                        Name = "Badshahi Mosque & Lahore Fort",
                        Type = "Historical",
                        Description = "Grand Mughal-era architectural wonder featuring intricate fresco artwork and vast courtyards.",
                        BestSeason = "Autumn / Winter",
                        Image = "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272",
                        IsActive = true
                    },
                    new TouristSpot
                    {
                        CityId = islamabad.CityId,
                        Name = "Faisal Mosque & Margalla Hills",
                        Type = "Scenic / Cultural",
                        Description = "Iconic national mosque nestled at the base of Margalla Hills with scenic Daman-e-Koh vistas.",
                        BestSeason = "Spring / Autumn",
                        Image = "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0",
                        IsActive = true
                    },
                    new TouristSpot
                    {
                        CityId = murree.CityId,
                        Name = "Mall Road & Patriata Chairlift",
                        Type = "Hill Station",
                        Description = "Vibrant mountain ridge offering pine forest walks, cable car rides, and panoramic Himalayan valleys.",
                        BestSeason = "Summer (May - Aug) / Winter Snow",
                        Image = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
                        IsActive = true
                    },
                    new TouristSpot
                    {
                        CityId = hunza.CityId,
                        Name = "Attabad Lake & Baltit Fort",
                        Type = "Adventure / Nature",
                        Description = "Crystal turquoise alpine lake surrounded by towering Karakoram pinnacles and 700-year-old mountain fortresses.",
                        BestSeason = "Summer (May - Oct)",
                        Image = "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99",
                        IsActive = true
                    }
                };
                context.TouristSpots.AddRange(spots);
                context.SaveChanges();
            }

            // 4. Seed Hotels if empty
            if (!context.Hotels.Any())
            {
                var hotels = new List<Hotel>
                {
                    new Hotel
                    {
                        CityId = karachi.CityId,
                        Name = "Pearl Continental Hotel Karachi",
                        Address = "Club Road, Civil Lines, Karachi",
                        PricePerNight = 15000.00m,
                        StarRating = 5,
                        Amenities = "WiFi, Swimming Pool, Fitness Center, 5 Restaurants, Airport Shuttle",
                        RoomsAvailable = 50,
                        Image = "https://images.unsplash.com/photo-1566073771259-6a8506099945",
                        IsActive = true
                    },
                    new Hotel
                    {
                        CityId = lahore.CityId,
                        Name = "The Nishat Hotel Gulberg",
                        Address = "Gulberg III, Mian Mahmood Ali Kasoori Road, Lahore",
                        PricePerNight = 18000.00m,
                        StarRating = 5,
                        Amenities = "Free High-Speed WiFi, Luxury Spa, Indoor Pool, Executive Lounge",
                        RoomsAvailable = 40,
                        Image = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
                        IsActive = true
                    },
                    new Hotel
                    {
                        CityId = islamabad.CityId,
                        Name = "Islamabad Serena Hotel",
                        Address = "Khayaban-e-Suhrawardy, Sector G-5/1, Islamabad",
                        PricePerNight = 28000.00m,
                        StarRating = 5,
                        Amenities = "Heritage Architecture, Outdoor Pool, Tennis Court, Luxury Spa, Multiple Cuisines",
                        RoomsAvailable = 35,
                        Image = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
                        IsActive = true
                    },
                    new Hotel
                    {
                        CityId = murree.CityId,
                        Name = "Lockwood Hotel Murree",
                        Address = "Imtiaz Shaheed Road, Near Mall Road, Murree",
                        PricePerNight = 9500.00m,
                        StarRating = 4,
                        Amenities = "Heating, Mountain View Balcony, Continental Breakfast, Fireplace",
                        RoomsAvailable = 25,
                        Image = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
                        IsActive = true
                    },
                    new Hotel
                    {
                        CityId = hunza.CityId,
                        Name = "Hunza Serena Inn",
                        Address = "Karimabad, Hunza Valley, Gilgit-Baltistan",
                        PricePerNight = 22000.00m,
                        StarRating = 4,
                        Amenities = "Ultar Peak Views, Organic Garden Dining, Traditional Architecture, Guided Treks",
                        RoomsAvailable = 20,
                        Image = "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
                        IsActive = true
                    }
                };
                context.Hotels.AddRange(hotels);
                context.SaveChanges();
            }

            // 5. Seed Resorts if empty
            if (!context.Resorts.Any())
            {
                var resorts = new List<Resort>
                {
                    new Resort
                    {
                        CityId = karachi.CityId,
                        Name = "Dreamworld Resort & Water Park",
                        PricePerNight = 20000.00m,
                        Rating = 4.5m,
                        Amenities = "Artificial Beach, Water Slides, Golf Course, Chalets, Horse Riding",
                        Activities = "Water Sports, Archery, Bowling, Desert Dune Buggies",
                        RoomsAvailable = 30,
                        Image = "https://images.unsplash.com/photo-1540541338287-41700207dee6",
                        IsActive = true
                    },
                    new Resort
                    {
                        CityId = lahore.CityId,
                        Name = "Green Fields Country Club",
                        PricePerNight = 16500.00m,
                        Rating = 4.3m,
                        Amenities = "Lakeside Cottages, Organic Farm, Pool, Spa",
                        Activities = "Boating, Horseback Riding, Paintball, Fishing",
                        RoomsAvailable = 25,
                        Image = "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
                        IsActive = true
                    },
                    new Resort
                    {
                        CityId = islamabad.CityId,
                        Name = "Highland Resort Margalla",
                        PricePerNight = 24000.00m,
                        Rating = 4.7m,
                        Amenities = "Cloud-Level Suites, Rooftop BBQ, Panoramic Margalla View, Heating",
                        Activities = "Nature Trails, Bird Watching, Stargazing, Zip-lining",
                        RoomsAvailable = 20,
                        Image = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
                        IsActive = true
                    },
                    new Resort
                    {
                        CityId = murree.CityId,
                        Name = "Arcadian Riverside Resort",
                        PricePerNight = 14000.00m,
                        Rating = 4.2m,
                        Amenities = "Riverfront Chalets, Campfire Nights, Family Suites, Pine Garden",
                        Activities = "River Rafting, Forest Trekking, Trout Fishing",
                        RoomsAvailable = 15,
                        Image = "https://images.unsplash.com/photo-1613977257363-707ba9348227",
                        IsActive = true
                    },
                    new Resort
                    {
                        CityId = hunza.CityId,
                        Name = "Luxus Hunza Attabad Lake Resort",
                        PricePerNight = 32000.00m,
                        Rating = 4.9m,
                        Amenities = "Lakefront Floor-to-Ceiling Glass Villas, Private Decks, Gourmet Dining",
                        Activities = "Jet Skiing, Lake Cruises, Glacier Excursions, Stargazing",
                        RoomsAvailable = 18,
                        Image = "https://images.unsplash.com/photo-1618773928121-c32242e63f39",
                        IsActive = true
                    }
                };
                context.Resorts.AddRange(resorts);
                context.SaveChanges();
            }

            // 6. Seed Restaurants if empty
            if (!context.Restaurants.Any())
            {
                var restaurants = new List<Restaurant>
                {
                    new Restaurant
                    {
                        CityId = karachi.CityId,
                        Name = "Kolachi Seaside Restaurant",
                        Cuisine = "Barbecue & Seafood",
                        AvgPrice = 3500.00m,
                        Rating = 4.8m,
                        Timings = "7:00 PM - 1:00 AM",
                        Image = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
                        IsActive = true
                    },
                    new Restaurant
                    {
                        CityId = lahore.CityId,
                        Name = "Haveli Restaurant Old Lahore",
                        Cuisine = "Traditional Mughlai",
                        AvgPrice = 2800.00m,
                        Rating = 4.7m,
                        Timings = "1:00 PM - 12:00 AM",
                        Image = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                        IsActive = true
                    },
                    new Restaurant
                    {
                        CityId = islamabad.CityId,
                        Name = "The Monal Margalla",
                        Cuisine = "Pakistani & Continental",
                        AvgPrice = 4000.00m,
                        Rating = 4.8m,
                        Timings = "12:00 PM - 12:00 AM",
                        Image = "https://images.unsplash.com/photo-1552566626-52f8b828add9",
                        IsActive = true
                    },
                    new Restaurant
                    {
                        CityId = murree.CityId,
                        Name = "Red Onion Mall Road",
                        Cuisine = "Continental & Fast Food",
                        AvgPrice = 2000.00m,
                        Rating = 4.1m,
                        Timings = "11:00 AM - 11:00 PM",
                        Image = "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
                        IsActive = true
                    },
                    new Restaurant
                    {
                        CityId = hunza.CityId,
                        Name = "Yak Grill Passu",
                        Cuisine = "Local Wakhi & Grilled Meats",
                        AvgPrice = 2500.00m,
                        Rating = 4.6m,
                        Timings = "12:00 PM - 10:00 PM",
                        Image = "https://images.unsplash.com/photo-1544025162-d76694265947",
                        IsActive = true
                    }
                };
                context.Restaurants.AddRange(restaurants);
                context.SaveChanges();
            }

            // 7. Seed Transport Options if empty
            if (!context.TransportOptions.Any())
            {
                var transports = new List<TransportOption>
                {
                    new TransportOption
                    {
                        FromCityId = karachi.CityId,
                        ToCityId = lahore.CityId,
                        Mode = "Train",
                        Operator = "Green Line Express",
                        Price = 6500.00m,
                        Schedule = "Daily Departure at 10:00 PM",
                        SeatsAvailable = 45,
                        IsActive = true
                    },
                    new TransportOption
                    {
                        FromCityId = lahore.CityId,
                        ToCityId = islamabad.CityId,
                        Mode = "Bus",
                        Operator = "Daewoo Express Gold Class",
                        Price = 2200.00m,
                        Schedule = "Hourly from 6:00 AM to 11:00 PM",
                        SeatsAvailable = 35,
                        IsActive = true
                    },
                    new TransportOption
                    {
                        FromCityId = islamabad.CityId,
                        ToCityId = murree.CityId,
                        Mode = "Bus",
                        Operator = "Faisal Movers VIP",
                        Price = 850.00m,
                        Schedule = "Every 2 Hours from 7:00 AM to 8:00 PM",
                        SeatsAvailable = 30,
                        IsActive = true
                    },
                    new TransportOption
                    {
                        FromCityId = islamabad.CityId,
                        ToCityId = hunza.CityId,
                        Mode = "Flight",
                        Operator = "PIA Mountain Safari ATR",
                        Price = 18500.00m,
                        Schedule = "Mon, Wed, Fri at 8:00 AM",
                        SeatsAvailable = 20,
                        IsActive = true
                    },
                    new TransportOption
                    {
                        FromCityId = karachi.CityId,
                        ToCityId = islamabad.CityId,
                        Mode = "Flight",
                        Operator = "Airblue",
                        Price = 26000.00m,
                        Schedule = "Daily at 2:00 PM & 7:00 PM",
                        SeatsAvailable = 50,
                        IsActive = true
                    }
                };
                context.TransportOptions.AddRange(transports);
                context.SaveChanges();
            }
        }
    }
}
