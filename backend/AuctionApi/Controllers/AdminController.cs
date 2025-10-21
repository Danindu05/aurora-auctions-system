using AuctionApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AuctionApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        private static DateTime? EnsureUtc(DateTime? value)
        {
            if (!value.HasValue) return null;

            return value.Value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.Value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
            };
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var now = DateTime.UtcNow;

            var auctions = await _context.AuctionItems
                .Include(a => a.Bids)
                .ToListAsync();

            var activeAuctions = auctions.Count(a =>
                a.BidStartTime.HasValue &&
                a.BidEndTime.HasValue &&
                a.BidStartTime.Value <= now &&
                a.BidEndTime.Value >= now);

            var registeredUsers = await _context.Users.CountAsync();

            var totalSales = auctions
                .Where(a => a.BidEndTime.HasValue && a.BidEndTime.Value < now && a.Bids.Any())
                .Select(a => a.Bids.Max(b => b.Amount))
                .Sum();

            var vipClients = auctions
                .SelectMany(a => a.Bids)
                .GroupBy(b => b.UserId)
                .Count(group => group.Sum(b => b.Amount) >= 10000);

            return Ok(new
            {
                activeAuctions,
                registeredUsers,
                totalSales,
                vipClients
            });
        }

        [HttpGet("auctions")]
        public async Task<IActionResult> GetAuctions()
        {
            var now = DateTime.UtcNow;

            var auctions = await _context.AuctionItems
                .Include(a => a.Bids)
                .Where(a => !a.BidEndTime.HasValue || a.BidEndTime.Value >= now)
                .OrderBy(a => a.BidEndTime)
                .ToListAsync();

            var result = auctions.Select(a => new
            {
                a.Id,
                name = a.Name,
                endsAt = EnsureUtc(a.BidEndTime),
                currentHighestBid = a.Bids.Any() ? a.Bids.Max(b => b.Amount) : a.StartingPrice,
                totalBids = a.Bids.Count
            });

            return Ok(result);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.Email)
                .Select(u => new
                {
                    u.Id,
                    name = u.Email,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}
