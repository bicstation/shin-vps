import type {
  ConciergeInput,
  ConciergeOutput,
} from "../contracts";

import {
  resolveIntent,
} from "../../../lib/api/django/pc/intent";

import {
  fetchFinder,
} from "../../../lib/api/django/pc/finder";

export class ConciergeTransport {
  public async execute(
    input: ConciergeInput,
  ): Promise<ConciergeOutput> {

    try {

      /* ==========================================================
       * Intent Runtime
       * ========================================================== */

      const intentRuntime =
        await resolveIntent(
          input.message,
        );

      if (
        !intentRuntime.ready ||
        !intentRuntime.intent
      ) {
        return {
          success: false,
          message:
            "Intent Runtime could not resolve intent.",
        };
      }

      /* ==========================================================
       * Finder Runtime
       * ========================================================== */

      const finderRuntime =
        await fetchFinder({
          usage: [
            intentRuntime.intent,
          ],
        });

      console.log(
        "FINDER RUNTIME",
        JSON.stringify(
          finderRuntime,
          null,
          2
        )
      );
      

      /* ==========================================================
       * Response
       * ========================================================== */

      return {
        success: true,
        message: [
          "Finder Runtime Success",
          "",
          `intent: ${intentRuntime.intent}`,
          `confidence: ${intentRuntime.confidence}`,
          `ready: ${intentRuntime.ready}`,
          `results: ${finderRuntime.results.length}`,
          `next_shelves: ${
            finderRuntime.next_shelves?.join(", ")
              || "-"
          }`,
        ].join("\n"),
      };

    } catch (error) {

      console.error(
        "Concierge Runtime Error",
        error,
      );

      return {
        success: false,
        message:
          "Concierge Runtime Error",
      };
    }
  }
}