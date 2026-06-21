"use client";

type Props = {

  response: any

}

export default function RuntimeResponse({

  response,

}: Props) {

  const hasResponse =

    response !== null
    &&
    response !== undefined

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

        Runtime Response

      </h2>

      <div

        style={{

          marginTop:
            "12px",

          marginBottom:
            "16px",

          color:

            hasResponse

              ? "#22c55e"

              : "#ef4444",

          fontWeight:
            700,

        }}

      >

        {

          hasResponse

            ? "RESPONSE RECEIVED"

            : "RESPONSE MISSING"

        }

      </div>

      <pre

        style={{

          padding:
            "16px",

          borderRadius:
            "12px",

          background:
            "#111827",

          color:
            "#e5e7eb",

          overflowX:
            "auto",

          fontSize:
            "12px",

          lineHeight:
            "1.6",

        }}

      >

        {

          JSON.stringify(

            response,

            null,

            2

          )

        }

      </pre>

    </section>

  )

}