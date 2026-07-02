import { Router } from "express";

export function createPublicAuthRoutes(controller, publicAuthMiddleware) {
  const router = Router();

  router.get("/health", controller.health);

  router.post("/request-otp", controller.requestOtp);
  router.post("/verify-otp", controller.verifyOtp);

  router.post("/register/complete", controller.completeRegistration);

  router.post("/refresh", controller.refresh);
  router.post("/logout", controller.logout);

  router.get("/me", publicAuthMiddleware, controller.me);
  router.get("/users/search", publicAuthMiddleware, controller.searchUsers);

  router.patch("/me/first-name", publicAuthMiddleware, controller.updateFirstName);
  router.patch("/me/last-name", publicAuthMiddleware, controller.updateLastName);
  router.patch("/me/username", publicAuthMiddleware, controller.updateUsername);
  router.patch("/me/photo-url", publicAuthMiddleware, controller.updatePhotoUrl);
  router.patch("/me/address", publicAuthMiddleware, controller.updateAddress);

  router.post(
    "/change-phone/request-otp",
    publicAuthMiddleware,
    controller.requestPhoneChangeOtp
  );

  router.post(
    "/change-phone/verify",
    publicAuthMiddleware,
    controller.verifyPhoneChange
  );

  return router;
}
