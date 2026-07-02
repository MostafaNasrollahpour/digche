import { Op } from "sequelize";

import { User } from "../../../domain/entities/User.js";
import { UserModel } from "../models/UserModel.js";
import { UserRoleModel } from "../models/UserRoleModel.js";

export class SequelizeUserRepository {
  async findByPhone(phone) {
    const user = await UserModel.findOne({
      where: { phone },
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findById(id) {
    const user = await UserModel.findByPk(id, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByUsername(username) {
    const user = await UserModel.findOne({
      where: { username },
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async searchByUsername({ username, excludeUserId = null, limit = 8 }) {
    const where = {
      username: {
        [Op.iLike]: `%${username}%`
      },
      firstName: {
        [Op.and]: [
          { [Op.not]: null },
          { [Op.ne]: "" }
        ]
      },
      lastName: {
        [Op.and]: [
          { [Op.not]: null },
          { [Op.ne]: "" }
        ]
      }
    };

    if (excludeUserId) {
      where.id = {
        [Op.ne]: excludeUserId
      };
    }

    const users = await UserModel.findAll({
      where,
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ],
      order: [["username", "ASC"]],
      limit
    });

    return users.map((user) => this.toDomain(user));
  }

  async updateProfileField(userId, field, value) {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    user[field] = value;

    await user.save();

    return this.toDomain(user);
  }

  async create(user) {
    const createdUser = await UserModel.create({
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
      address: user.address,
      tokenVersion: user.tokenVersion
    });

    return new User({
      id: createdUser.id,
      phone: createdUser.phone,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      username: createdUser.username,
      photoUrl: createdUser.photoUrl,
      address: createdUser.address,
      tokenVersion: createdUser.tokenVersion,
      roles: [],
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt
    });
  }

  async addRole(userId, role) {
    await UserRoleModel.findOrCreate({
      where: {
        userId,
        role
      },
      defaults: {
        userId,
        role
      }
    });

    return true;
  }

  async completeProfile(userId, { firstName, lastName, username }) {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;

    await user.save();

    return this.toDomain(user);
  }

  async updatePhone(userId, newPhone) {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    user.phone = newPhone;

    await user.save();

    return this.toDomain(user);
  }

  async incrementTokenVersion(userId) {
    const user = await UserModel.findByPk(userId, {
      include: [
        {
          model: UserRoleModel,
          as: "roles"
        }
      ]
    });

    if (!user) {
      return null;
    }

    user.tokenVersion = Number(user.tokenVersion || 0) + 1;

    await user.save();

    return this.toDomain(user);
  }

  toDomain(userModel) {
    const roles = userModel.roles
      ? userModel.roles.map((userRole) => userRole.role)
      : [];

    return new User({
      id: userModel.id,
      phone: userModel.phone,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      username: userModel.username,
      photoUrl: userModel.photoUrl,
      address: userModel.address,
      tokenVersion: userModel.tokenVersion || 0,
      roles,
      createdAt: userModel.createdAt,
      updatedAt: userModel.updatedAt
    });
  }
}
