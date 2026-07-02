export class PublicAuthController {
  constructor({
    requestPublicOtp,
    verifyPublicOtp,
    completePublicRegistration,
    refreshPublicSession,
    logoutSession,
    updatePublicProfileField,
    searchPublicUsersByUsername,
    requestPublicPhoneChangeOtp,
    verifyPublicPhoneChangeOtp
  }) {
    this.requestPublicOtp = requestPublicOtp;
    this.verifyPublicOtp = verifyPublicOtp;
    this.completePublicRegistration = completePublicRegistration;
    this.refreshPublicSession = refreshPublicSession;
    this.logoutSession = logoutSession;
    this.updatePublicProfileField = updatePublicProfileField;
    this.searchPublicUsersByUsername = searchPublicUsersByUsername;
    this.requestPublicPhoneChangeOtp = requestPublicPhoneChangeOtp;
    this.verifyPublicPhoneChangeOtp = verifyPublicPhoneChangeOtp;
  }

  health = (req, res) => {
    res.json({
      service: "auth-service",
      scope: "public-auth",
      status: "ok"
    });
  };

  requestOtp = async (req, res, next) => {
    try {
      const result = await this.requestPublicOtp.execute({
        phone: req.body.phone,
        role: req.body.role,
        flow: req.body.flow
      });

      res.json({
        message: "OTP sent successfully",
        phone: result.phone,
        role: result.role,
        flow: result.flow,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req, res, next) => {
    try {
      const result = await this.verifyPublicOtp.execute({
        phone: req.body.phone,
        code: req.body.code,
        role: req.body.role,
        flow: req.body.flow
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  completeRegistration = async (req, res, next) => {
    try {
      const result = await this.completePublicRegistration.execute({
        registrationToken: req.body.registrationToken,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.refreshPublicSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.logoutSession.execute({
        refreshToken: req.body.refreshToken
      });

      res.json({
        message: "Logged out successfully",
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      res.json({
        user: {
          id: req.auth.userId,
          phone: req.auth.phone,
          firstName: req.auth.firstName,
          lastName: req.auth.lastName,
          username: req.auth.username,
          photoUrl: req.auth.photoUrl,
          address: req.auth.address,
          roles: req.auth.roles,
          selectedRole: req.auth.selectedRole,
          ...(req.auth.chef ? { chef: req.auth.chef } : {})
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateFirstName = async (req, res, next) => {
    try {
      const result = await this.updatePublicProfileField.execute({
        userId: req.auth.userId,
        selectedRole: req.auth.selectedRole,
        field: "firstName",
        value: req.body.firstName
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateLastName = async (req, res, next) => {
    try {
      const result = await this.updatePublicProfileField.execute({
        userId: req.auth.userId,
        selectedRole: req.auth.selectedRole,
        field: "lastName",
        value: req.body.lastName
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUsername = async (req, res, next) => {
    try {
      const result = await this.updatePublicProfileField.execute({
        userId: req.auth.userId,
        selectedRole: req.auth.selectedRole,
        field: "username",
        value: req.body.username
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req, res, next) => {
    try {
      const result = await this.searchPublicUsersByUsername.execute({
        username: req.query.username || req.query.q,
        requesterUserId: req.auth.userId,
        limit: req.query.limit
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePhotoUrl = async (req, res, next) => {
    try {
      const result = await this.updatePublicProfileField.execute({
        userId: req.auth.userId,
        selectedRole: req.auth.selectedRole,
        field: "photoUrl",
        value: req.body.photoUrl ?? req.body.photo_url
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateAddress = async (req, res, next) => {
    try {
      const result = await this.updatePublicProfileField.execute({
        userId: req.auth.userId,
        selectedRole: req.auth.selectedRole,
        field: "address",
        value: req.body.address
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  requestPhoneChangeOtp = async (req, res, next) => {
    try {
      const result = await this.requestPublicPhoneChangeOtp.execute({
        userId: req.auth.userId,
        currentPhone: req.auth.phone,
        newPhone: req.body.newPhone
      });

      res.json({
        message: "OTP sent successfully",
        newPhone: result.newPhone,
        expiresAt: result.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPhoneChange = async (req, res, next) => {
    try {
      const result = await this.verifyPublicPhoneChangeOtp.execute({
        userId: req.auth.userId,
        currentSelectedRole: req.auth.selectedRole,
        newPhone: req.body.newPhone,
        code: req.body.code
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
