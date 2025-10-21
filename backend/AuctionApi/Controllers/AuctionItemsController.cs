using AuctionApi.Data;
using AuctionApi.DTOs;
using AuctionApi.Hubs;
using AuctionApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.IO;
using System.Linq;

namespace AuctionApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User,Admin")]
    public class AuctionItemsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AuctionItemsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime(),
            };
        }

        private static DateTime EnsureUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

        private static DateTime? EnsureUtc(DateTime? value)
        {
            return value.HasValue ? EnsureUtc(value.Value) : null;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetItems()
        {
            try
            {
                var items = await _context.AuctionItems
                    .Include(a => a.User)
                    .Include(a => a.Bids)
                        .ThenInclude(b => b.User)
                    .ToListAsync();

                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var result = items.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.StartingPrice,
                    a.CreatedAt,
                    ImageUrl = string.IsNullOrEmpty(a.ImageUrl) ? null : $"{baseUrl}{a.ImageUrl}",
                    BidStartTime = EnsureUtc(a.BidStartTime),
                    BidEndTime = EnsureUtc(a.BidEndTime),
                    a.CurrentHighestBid,
                    IsBiddingOpen = a.IsBiddingOpen,
                    TotalBids = a.Bids.Count,
                    User = new
                    {
                        a.User.Id,
                        a.User.Email
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetItems: {ex.Message}");
                return StatusCode(500, new { error = "Failed to load auction items." });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetItem(int id)
        {
            try
            {
                var item = await _context.AuctionItems
                    .Include(a => a.User)
                    .Include(a => a.Bids)
                        .ThenInclude(b => b.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (item == null) return NotFound(new { message = "Auction item not found." });

                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var highestBid = item.Bids
                    .OrderByDescending(b => b.Amount)
                    .FirstOrDefault();

                var result = new
                {
                    item.Id,
                    item.Name,
                    item.Description,
                    item.StartingPrice,
                    item.CreatedAt,
                    ImageUrl = string.IsNullOrEmpty(item.ImageUrl) ? null : $"{baseUrl}{item.ImageUrl}",
                    BidStartTime = EnsureUtc(item.BidStartTime),
                    BidEndTime = EnsureUtc(item.BidEndTime),
                    item.CurrentHighestBid,
                    IsBiddingOpen = item.IsBiddingOpen,
                    User = new
                    {
                        item.User.Id,
                        item.User.Email
                    },
                    Bids = item.Bids
                        .OrderByDescending(b => b.BidTime)
                        .Select(b => new
                        {
                            b.Id,
                            b.Amount,
                            BidTime = EnsureUtc(b.BidTime),
                            User = new
                            {
                                b.User.Id,
                                b.User.Email
                            }
                        }).ToList(),
                    WinningBid = highestBid == null
                        ? null
                        : new
                        {
                            highestBid.Id,
                            highestBid.Amount,
                            BidTime = EnsureUtc(highestBid.BidTime),
                            User = highestBid.User == null
                                ? null
                                : new
                                {
                                    highestBid.User.Id,
                                    highestBid.User.Email
                                }
                        }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetItem: {ex.Message}");
                return StatusCode(500, new { error = "Failed to load auction item." });
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateItem([FromForm] AuctionItemDto model)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (model.BidEndTime <= model.BidStartTime)
            {
                return BadRequest(new { error = "End time must be after the start time." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            string? imageUrl = null;

            if (model.ImageFile != null && model.ImageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + Path.GetExtension(model.ImageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImageFile.CopyToAsync(stream);
                }

                imageUrl = $"/images/{fileName}";
            }

            var item = new AuctionItem
            {
                Name = model.Name,
                Description = model.Description,
                StartingPrice = model.StartingPrice,
                UserId = userId,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.UtcNow,
                BidStartTime = NormalizeToUtc(model.BidStartTime),
                BidEndTime = NormalizeToUtc(model.BidEndTime)
            };

            _context.AuctionItems.Add(item);
            await _context.SaveChangesAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, new
            {
                item.Id,
                item.Name,
                item.Description,
                item.StartingPrice,
                item.CreatedAt,
                ImageUrl = string.IsNullOrEmpty(item.ImageUrl) ? null : $"{baseUrl}{item.ImageUrl}",
                BidStartTime = EnsureUtc(item.BidStartTime),
                BidEndTime = EnsureUtc(item.BidEndTime),
                UserId = item.UserId,
                User = new { item.User?.Id, item.User?.Email }
            });
        }

        [HttpPut("start-bid/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> StartBid(int id, [FromBody] StartBidModel model)
        {
            var item = await _context.AuctionItems.FindAsync(id);
            if (item == null) return NotFound("Auction item not found.");

            if (model.EndTime <= model.StartTime)
                return BadRequest("End time must be after start time.");

            item.BidStartTime = NormalizeToUtc(model.StartTime);
            item.BidEndTime = NormalizeToUtc(model.EndTime);

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveBid",
                $"🎉 Bidding started for '{item.Name}'! Ends at {item.BidEndTime:HH:mm:ss}");

            return Ok(new
            {
                message = "Bidding schedule updated successfully.",
                BidStartTime = EnsureUtc(item.BidStartTime),
                BidEndTime = EnsureUtc(item.BidEndTime),
                IsBiddingOpen = item.IsBiddingOpen
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.AuctionItems.FindAsync(id);
            if (item == null) return NotFound();

            if (!string.IsNullOrEmpty(item.ImageUrl))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", item.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    try
                    {
                        System.IO.File.Delete(imagePath);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to delete image: {ex.Message}");
                    }
                }
            }

            _context.AuctionItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("end-auction/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EndAuction(int id)
        {
            var item = await _context.AuctionItems
                .Include(a => a.Bids)
                    .ThenInclude(b => b.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (item == null) return NotFound("Auction item not found.");

            if (DateTime.UtcNow < (item.BidStartTime ?? DateTime.MinValue))
                return BadRequest("Auction hasn't started yet.");

            if (!item.IsBiddingOpen && item.BidEndTime < DateTime.UtcNow)
                return BadRequest("Auction already ended.");

            var highestBid = item.Bids
                .OrderByDescending(b => b.Amount)
                .FirstOrDefault();

            if (highestBid == null)
                return BadRequest("No bids were placed.");

            var winner = await _context.Users.FindAsync(highestBid.UserId);

            return Ok(new
            {
                message = "Auction ended successfully.",
                winner = new { winner!.Email, Amount = highestBid.Amount }
            });
        }

        public class StartBidModel
        {
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
        }
    }
}
