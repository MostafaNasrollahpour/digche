using System;

namespace FoodOrdering.Core.Application.DTOs
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? Rating { get; set; }

        public string? UserName { get; set; }
        public string? ImageUrl { get; set; }
    }
}