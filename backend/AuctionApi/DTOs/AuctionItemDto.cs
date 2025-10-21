using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AuctionApi.DTOs
{
    public class AuctionItemDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal StartingPrice { get; set; }

        [Required]
        public DateTime BidStartTime { get; set; }

        [Required]
        public DateTime BidEndTime { get; set; }

        public IFormFile? ImageFile { get; set; }
    }
}
