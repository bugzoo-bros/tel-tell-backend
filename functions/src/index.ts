import * as functions from "firebase-functions";

export const match = functions.region("asia-northeast2").firestore
    .document("ticket/{ticketId}")
    .onCreate((snapshot, context) => {
      functions.logger.info(snapshot.data.toString, {structuredData: true});
      functions.logger.info(context.eventId, {structuredData: true});
    });
