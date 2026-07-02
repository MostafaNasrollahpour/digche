import { AppError } from "../errors/AppError.js";

export class SearchPublicUsersByUsername {
  constructor({ userRepository, defaultLimit = 8, maxLimit = 20 }) {
    this.userRepository = userRepository;
    this.defaultLimit = defaultLimit;
    this.maxLimit = maxLimit;
  }

  async execute({ username, requesterUserId, limit = null }) {
    const normalizedUsername = this.normalizeUsername(username);
    const normalizedLimit = this.normalizeLimit(limit);

    const users = await this.userRepository.searchByUsername({
      username: normalizedUsername,
      excludeUserId: requesterUserId,
      limit: normalizedLimit
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: this.displayNameFor(user),
        phone: user.phone,
        photoUrl: user.photoUrl,
        roles: user.roles
      }))
    };
  }

  normalizeUsername(value) {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue.length < 2) {
      throw new AppError(
        "Username search term must be at least 2 characters",
        400,
        "USERNAME_SEARCH_TOO_SHORT"
      );
    }

    if (normalizedValue.length > 50) {
      throw new AppError(
        "Username search term must be at most 50 characters",
        400,
        "USERNAME_SEARCH_TOO_LONG"
      );
    }

    return normalizedValue;
  }

  normalizeLimit(limit) {
    if (limit === null || limit === undefined || limit === "") {
      return this.defaultLimit;
    }

    const normalizedLimit = Number(limit);

    if (!Number.isInteger(normalizedLimit) || normalizedLimit < 1) {
      throw new AppError("Invalid search limit", 400, "INVALID_SEARCH_LIMIT");
    }

    return Math.min(normalizedLimit, this.maxLimit);
  }

  displayNameFor(user) {
    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || user.username || user.phone || null;
  }
}
