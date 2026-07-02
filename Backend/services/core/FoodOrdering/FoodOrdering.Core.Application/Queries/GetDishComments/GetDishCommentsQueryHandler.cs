using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;
using FoodOrdering.Core.Domain.Interfaces;
using MediatR;

namespace FoodOrdering.Core.Application.Queries.GetDishComments
{
    public class GetDishCommentsQueryHandler : IRequestHandler<GetDishCommentsQuery, Result<IEnumerable<CommentDto>>>
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IDishRepository _dishRepository;
        private readonly IUserServiceClient _userServiceClient;  // اضافه شد

        public GetDishCommentsQueryHandler(
            ICommentRepository commentRepository,
            IDishRepository dishRepository,
            IUserServiceClient userServiceClient)   // تزریق سرویس
        {
            _commentRepository = commentRepository;
            _dishRepository = dishRepository;
            _userServiceClient = userServiceClient;
        }

        public async Task<Result<IEnumerable<CommentDto>>> Handle(GetDishCommentsQuery request, CancellationToken cancellationToken)
        {
            // بررسی وجود غذا
            var dishExists = await _dishRepository.ExistsAsync(request.DishId, cancellationToken);
            if (!dishExists)
                return Result<IEnumerable<CommentDto>>.Failure("غذای مورد نظر یافت نشد.");

            var comments = await _commentRepository.GetByDishIdAsync(request.DishId, cancellationToken);
            if (comments == null || !comments.Any())
                return Result<IEnumerable<CommentDto>>.Success(Enumerable.Empty<CommentDto>());

            // استخراج userIdهای متمایز
            var userIds = comments.Select(c => c.UserId).Distinct();

            // دریافت اطلاعات تمام کاربران به صورت موازی
            var userTasks = userIds.ToDictionary(
                id => id,
                id => _userServiceClient.GetUserInfoAsync(id, cancellationToken)
            );
            await Task.WhenAll(userTasks.Values);

            // ساخت DTO
            var commentDtos = comments.Select(c =>
            {
                var userInfo = userTasks.TryGetValue(c.UserId, out var task) ? task.Result : null;

                string? userName = null;
                string? imageUrl = null;

                if (userInfo != null)
                {
                    // اولویت: DisplayName > FirstName + LastName > Username
                    userName = userInfo.DisplayName;
                    if (string.IsNullOrWhiteSpace(userName))
                    {
                        userName = $"{userInfo.FirstName} {userInfo.LastName}".Trim();
                        if (string.IsNullOrWhiteSpace(userName))
                            userName = userInfo.Username;
                    }

                    imageUrl = userInfo.PhotoUrl;  // ممکن است null باشد
                }

                return new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    Text = c.Text,
                    CreatedAt = c.CreatedAt,
                    Rating = c.Rating,
                    UserName = userName,
                    ImageUrl = imageUrl
                };
            });

            return Result<IEnumerable<CommentDto>>.Success(commentDtos);
        }
    }
}