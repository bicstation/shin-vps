// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/_components/FailureLocator.tsx

"use client";

type Props = {

  state?: any

  request?: any

  response?: any

}

export default function FailureLocator({

  state,

  request,

  response,

}: Props) {

  let status =
    "SUCCESS"

  let layer =
    "Runtime Healthy"

  let reason =
    "No failure detected"

  /* =========================================================
   * State Validation
   * ======================================================= */

  if (

    !state

  ) {

    status =
      "FAILURE"

    layer =
      "Runtime State"

    reason =
      "State not available"

  }

  else if (

    !state.usage

  ) {

    status =
      "FAILURE"

    layer =
      "RuntimeForm"

    reason =
      "Usage value not propagated to state"

  }

  /* =========================================================
   * Request Validation
   * ======================================================= */

  else if (

    !request

  ) {

    status =
      "FAILURE"

    layer =
      "Request Builder"

    reason =
      "Request object not generated"

  }

  else if (

    !request.usage
    ||
    request.usage.length === 0

  ) {

    status =
      "FAILURE"

    layer =
      "Request Builder"

    reason =
      "Usage lost during request generation"

  }

  /* =========================================================
   * Response Validation
   * ======================================================= */

  else if (

    !response

  ) {

    status =
      "FAILURE"

    layer =
      "Transport Layer"

    reason =
      "No response received"

  }

  else if (

    response.runtime_status ===
    "runtime-error"

  ) {

    status =
      "FAILURE"

    layer =
      "Backend Runtime"

    reason =
      "Runtime returned runtime-error"

  }

  /* =========================================================
   * Semantic Validation
   * ======================================================= */

  else if (

    Array.isArray(
      response.results
    )
    &&
    response.results.length === 0

  ) {

    status =
      "WARNING"

    layer =
      "Semantic Runtime"

    reason =
      "Request succeeded but returned zero results"

  }

  /* =========================================================
   * Healthy Runtime
   * ======================================================= */

  else {

    status =
      "SUCCESS"

    layer =
      "Runtime Healthy"

    reason =
      "State, Request and Response validated"

  }

  const color =

    status === "SUCCESS"

      ? "#22c55e"

      : status === "WARNING"

      ? "#f59e0b"

      : "#ef4444"

  return (

    <section

      style={{

        marginTop:
          "24px",

        padding:
          "24px",

        border:
          "1px solid #334155",

        borderRadius:
          "16px",

        background:
          "#0f172a",

      }}

    >

      <h2>

        Failure Locator

      </h2>

      <div

        style={{

          marginTop:
            "16px",

          padding:
            "16px",

          borderRadius:
            "12px",

          background:
            "#111827",

        }}

      >

        <p>

          <strong>

            Status:

          </strong>

          {" "}

          <span

            style={{
              color,
            }}

          >

            {status}

          </span>

        </p>

        <p>

          <strong>

            Layer:

          </strong>

          {" "}

          {layer}

        </p>

        <p>

          <strong>

            Reason:

          </strong>

          {" "}

          {reason}

        </p>

      </div>

    </section>

  )

}