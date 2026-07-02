import { env } from "./config/env.js";

import { RequestPublicOtp } from "./application/use-cases/RequestPublicOtp.js";
import { VerifyPublicOtp } from "./application/use-cases/VerifyPublicOtp.js";
import { CompletePublicRegistration } from "./application/use-cases/CompletePublicRegistration.js";
import { RequestAdminOtp } from "./application/use-cases/RequestAdminOtp.js";
import { VerifyAdminOtp } from "./application/use-cases/VerifyAdminOtp.js";
import { RefreshPublicSession } from "./application/use-cases/RefreshPublicSession.js";
import { RefreshAdminSession } from "./application/use-cases/RefreshAdminSession.js";
import { LogoutSession } from "./application/use-cases/LogoutSession.js";
import { UpdatePublicProfileField } from "./application/use-cases/UpdatePublicProfileField.js";
import { UpdateAdminProfileField } from "./application/use-cases/UpdateAdminProfileField.js";
import { SearchPublicUsersByUsername } from "./application/use-cases/SearchPublicUsersByUsername.js";
import { AddAdminUser } from "./application/use-cases/AddAdminUser.js";
import { RequestAdminUserPhoneOtp } from "./application/use-cases/RequestAdminUserPhoneOtp.js";
import { VerifyAdminUserPhoneOtp } from "./application/use-cases/VerifyAdminUserPhoneOtp.js";
import { ListAdminUsers } from "./application/use-cases/ListAdminUsers.js";
import { DisableAdminUser } from "./application/use-cases/DisableAdminUser.js";
import { EnableAdminUser } from "./application/use-cases/EnableAdminUser.js";
import { RequestPublicPhoneChangeOtp } from "./application/use-cases/RequestPublicPhoneChangeOtp.js";
import { VerifyPublicPhoneChangeOtp } from "./application/use-cases/VerifyPublicPhoneChangeOtp.js";
import { ChangeAdminUserPhone } from "./application/use-cases/ChangeAdminUserPhone.js";
import { RequestAdminPhoneChangeOtp } from "./application/use-cases/RequestAdminPhoneChangeOtp.js";
import { VerifyAdminPhoneChangeOtp } from "./application/use-cases/VerifyAdminPhoneChangeOtp.js";
import { ResolveActorProfiles } from "./application/use-cases/ResolveActorProfiles.js";
import { GetInternalUserProfile } from "./application/use-cases/GetInternalUserProfile.js";
import { VerifyAccessToken } from "./application/use-cases/VerifyAccessToken.js";
import { ListChefs } from "./application/use-cases/ListChefs.js";
import { SuspendChef } from "./application/use-cases/SuspendChef.js";
import { ActivateChef } from "./application/use-cases/ActivateChef.js";

import { SequelizeUserRepository } from "./infrastructure/database/repositories/SequelizeUserRepository.js";
import { SequelizeChefAccountRepository } from "./infrastructure/database/repositories/SequelizeChefAccountRepository.js";
import { SequelizeAdminUserRepository } from "./infrastructure/database/repositories/SequelizeAdminUserRepository.js";
import { SequelizeOtpRepository } from "./infrastructure/database/repositories/SequelizeOtpRepository.js";
import { SequelizeRefreshTokenRepository } from "./infrastructure/database/repositories/SequelizeRefreshTokenRepository.js";
import { SequelizeRegistrationTokenRepository } from "./infrastructure/database/repositories/SequelizeRegistrationTokenRepository.js";

import { CryptoOtpCodeGenerator } from "./infrastructure/otp/CryptoOtpCodeGenerator.js";
import { BcryptOtpHasher } from "./infrastructure/otp/BcryptOtpHasher.js";
import { createOtpSender } from "./infrastructure/otp/createOtpSender.js";
import { CacheOtpRateLimiter } from "./infrastructure/otp/CacheOtpRateLimiter.js";

import { createCacheService } from "./infrastructure/cache/createCacheService.js";

import { JwtTokenService } from "./infrastructure/security/JwtTokenService.js";

import { PublicAuthController } from "./interfaces/http/controllers/PublicAuthController.js";
import { AdminAuthController } from "./interfaces/http/controllers/AdminAuthController.js";
import { AdminUserController } from "./interfaces/http/controllers/AdminUserController.js";
import { InternalAuthController } from "./interfaces/http/controllers/InternalAuthController.js";
import { ChefAdminController } from "./interfaces/http/controllers/ChefAdminController.js";

import { createPublicAuthMiddleware } from "./interfaces/http/middlewares/publicAuthMiddleware.js";
import { createAdminAuthMiddleware } from "./interfaces/http/middlewares/adminAuthMiddleware.js";
import { createInternalAuthMiddleware } from "./interfaces/http/middlewares/internalAuthMiddleware.js";

export function createContainer() {
  const userRepository = new SequelizeUserRepository();
  const chefAccountRepository = new SequelizeChefAccountRepository();
  const adminUserRepository = new SequelizeAdminUserRepository();
  const otpRepository = new SequelizeOtpRepository();
  const refreshTokenRepository = new SequelizeRefreshTokenRepository();
  const registrationTokenRepository = new SequelizeRegistrationTokenRepository();

  const cacheService = createCacheService({ env });

  const otpRateLimiter = new CacheOtpRateLimiter({
    cacheService
  });

  const otpCodeGenerator = new CryptoOtpCodeGenerator();
  const otpHasher = new BcryptOtpHasher();
  const otpSender = createOtpSender({ env });

  const tokenService = new JwtTokenService({
    secret: env.jwt.secret,
    accessTokenExpiresIn: env.jwt.accessTokenExpiresIn,
    registrationTokenExpiresIn: env.jwt.registrationTokenExpiresIn
  });

  const publicAuthMiddleware = createPublicAuthMiddleware({
    tokenService,
    userRepository,
    chefAccountRepository
  });

  const adminAuthMiddleware = createAdminAuthMiddleware({
    tokenService,
    adminUserRepository
  });

  const internalAuthMiddleware = createInternalAuthMiddleware({
    internalApiKey: env.internalApiKey
  });

  const requestPublicOtp = new RequestPublicOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour,
    otpCooldownSeconds: env.otp.cooldownSeconds
  });

  const verifyPublicOtp = new VerifyPublicOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays,
    registrationTokenExpiresMinutes: env.jwt.registrationTokenExpiresMinutes
  });

  const completePublicRegistration = new CompletePublicRegistration({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    registrationTokenRepository,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const requestPublicPhoneChangeOtp = new RequestPublicPhoneChangeOtp({
    userRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour,
    otpCooldownSeconds: env.otp.cooldownSeconds
  });

  const verifyPublicPhoneChangeOtp = new VerifyPublicPhoneChangeOtp({
    userRepository,
    chefAccountRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const requestAdminOtp = new RequestAdminOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour,
    otpCooldownSeconds: env.otp.cooldownSeconds
  });

  const verifyAdminOtp = new VerifyAdminOtp({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const requestAdminPhoneChangeOtp = new RequestAdminPhoneChangeOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour,
    otpCooldownSeconds: env.otp.cooldownSeconds
  });

  const verifyAdminPhoneChangeOtp = new VerifyAdminPhoneChangeOtp({
    adminUserRepository,
    otpRepository,
    refreshTokenRepository,
    otpHasher,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const refreshPublicSession = new RefreshPublicSession({
    userRepository,
    chefAccountRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const refreshAdminSession = new RefreshAdminSession({
    adminUserRepository,
    refreshTokenRepository,
    tokenService,
    refreshTokenExpiresDays: env.jwt.refreshTokenExpiresDays
  });

  const logoutSession = new LogoutSession({
    refreshTokenRepository,
    tokenService
  });

  const updatePublicProfileField = new UpdatePublicProfileField({
    userRepository,
    chefAccountRepository,
    tokenService,
    allowedPhotoUrlOrigins: env.profile.allowedPhotoUrlOrigins
  });

  const updateAdminProfileField = new UpdateAdminProfileField({
    adminUserRepository,
    tokenService,
    allowedPhotoUrlOrigins: env.profile.allowedPhotoUrlOrigins
  });

  const searchPublicUsersByUsername = new SearchPublicUsersByUsername({
    userRepository
  });

  const addAdminUser = new AddAdminUser({
    adminUserRepository
  });

  const requestAdminUserPhoneOtp = new RequestAdminUserPhoneOtp({
    adminUserRepository,
    otpRepository,
    otpCodeGenerator,
    otpHasher,
    otpSender,
    otpRateLimiter,
    otpExpiresMinutes: env.otp.expiresMinutes,
    otpRateLimitPerHour: env.otp.rateLimitPerHour,
    otpCooldownSeconds: env.otp.cooldownSeconds
  });

  const verifyAdminUserPhoneOtp = new VerifyAdminUserPhoneOtp({
    adminUserRepository,
    otpRepository,
    otpHasher
  });

  const listAdminUsers = new ListAdminUsers({
    adminUserRepository
  });

  const disableAdminUser = new DisableAdminUser({
    adminUserRepository,
    refreshTokenRepository
  });

  const enableAdminUser = new EnableAdminUser({
    adminUserRepository
  });

  const changeAdminUserPhone = new ChangeAdminUserPhone({
    adminUserRepository,
    refreshTokenRepository
  });

  const resolveActorProfiles = new ResolveActorProfiles({
    userRepository,
    adminUserRepository
  });

  const getInternalUserProfile = new GetInternalUserProfile({
    userRepository,
    chefAccountRepository
  });

  const verifyAccessToken = new VerifyAccessToken({
    tokenService,
    userRepository,
    adminUserRepository,
    chefAccountRepository
  });

  const listChefs = new ListChefs({
    chefAccountRepository
  });

  const suspendChef = new SuspendChef({
    chefAccountRepository,
    refreshTokenRepository,
    userRepository
  });

  const activateChef = new ActivateChef({
    chefAccountRepository
  });

  const publicAuthController = new PublicAuthController({
    requestPublicOtp,
    verifyPublicOtp,
    completePublicRegistration,
    refreshPublicSession,
    logoutSession,
    updatePublicProfileField,
    searchPublicUsersByUsername,
    requestPublicPhoneChangeOtp,
    verifyPublicPhoneChangeOtp
  });

  const adminAuthController = new AdminAuthController({
    requestAdminOtp,
    verifyAdminOtp,
    refreshAdminSession,
    logoutSession,
    updateAdminProfileField,
    requestAdminPhoneChangeOtp,
    verifyAdminPhoneChangeOtp
  });

  const adminUserController = new AdminUserController({
    addAdminUser,
    listAdminUsers,
    disableAdminUser,
    enableAdminUser,
    changeAdminUserPhone,
    requestAdminUserPhoneOtp,
    verifyAdminUserPhoneOtp
  });

  const internalAuthController = new InternalAuthController({
    resolveActorProfiles,
    getInternalUserProfile,
    verifyAccessToken
  });

  const chefAdminController = new ChefAdminController({
    listChefs,
    suspendChef,
    activateChef
  });

  return {
    publicAuthController,
    adminAuthController,
    adminUserController,
    chefAdminController,
    internalAuthController,
    publicAuthMiddleware,
    adminAuthMiddleware,
    internalAuthMiddleware,
    cacheService
  };
}
