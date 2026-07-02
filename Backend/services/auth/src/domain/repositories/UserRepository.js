export class UserRepository {
  async findByPhone(phone) {
    throw new Error("UserRepository.findByPhone is not implemented");
  }

  async findById(id) {
    throw new Error("UserRepository.findById is not implemented");
  }

  async findByUsername(username) {
    throw new Error("UserRepository.findByUsername is not implemented");
  }

  async searchByUsername() {
    throw new Error("UserRepository.searchByUsername is not implemented");
  }

  async updateProfileField(userId, field, value) {
    throw new Error("UserRepository.updateProfileField is not implemented");
  }

  async create(user) {
    throw new Error("UserRepository.create is not implemented");
  }

  async addRole(userId, role) {
    throw new Error("UserRepository.addRole is not implemented");
  }

  async completeProfile(userId, { firstName, lastName, username }) {
    throw new Error("UserRepository.completeProfile is not implemented");
  }

  async updatePhone(userId, newPhone) {
    throw new Error("UserRepository.updatePhone is not implemented");
  }

  async incrementTokenVersion(userId) {
    throw new Error("UserRepository.incrementTokenVersion is not implemented");
  }
}
