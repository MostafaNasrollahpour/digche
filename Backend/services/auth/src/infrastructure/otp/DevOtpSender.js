import { OtpSender } from "../../application/services/OtpSender.js";
import { logger } from "../logging/logger.js";

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  black: "\x1b[30m",
  yellowBg: "\x1b[43m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

export class DevOtpSender extends OtpSender {
  async send({ phone, code, purpose }) {
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        { phone, purpose },
        "DevOtpSender was called in production. OTP code was not logged."
      );

      return true;
    }

    console.log(`
${colors.yellowBg}${colors.black}${colors.bold}==================== DIGCHE DEV OTP ====================${colors.reset}
${colors.green}${colors.bold}OTP CODE:${colors.reset} ${colors.red}${colors.bold}${code}${colors.reset}
${colors.cyan}PHONE:${colors.reset} ${phone}
${colors.cyan}PURPOSE:${colors.reset} ${purpose}
${colors.yellowBg}${colors.black}${colors.bold}========================================================${colors.reset}
`);

    logger.info({ phone, purpose }, "DEV OTP code generated");

    return true;
  }
}