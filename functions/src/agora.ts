import * as functions from "firebase-functions";
import {RtcTokenBuilder, RtcRole} from "agora-access-token";

export const generateToken = functions
    .region("asia-northeast2")
    .https.onCall((data) => {
      const appID = functions.config().agora.id;
      const appCertificate = functions.config().agora.cert;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 7200; // 2時間
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const token = RtcTokenBuilder.buildTokenWithAccount(
          appID,
          appCertificate,
          data["channelName"],
          data["account"],
          role,
          privilegeExpiredTs
      );
      return token;
    });
