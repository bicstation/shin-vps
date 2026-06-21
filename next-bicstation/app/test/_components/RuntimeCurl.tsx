"use client";

type Props = {

  curl?: string

}

export default function RuntimeCurl({

  curl,

}: Props) {

  const hasCurl =

    !!curl

  async function copyCurl() {

    if (!curl) {

      return

    }

    try {

      await navigator.clipboard.writeText(
        curl
      )

    } catch (error) {

      console.error(
        error
      )

    }

  }

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

        Runtime Curl

      </h2>

      <div

        style={{

          marginTop:
            "12px",

          marginBottom:
            "16px",

          color:

            hasCurl

              ? "#22c55e"

              : "#ef4444",

          fontWeight:
            700,

        }}

      >

        {

          hasCurl

            ? "CURL GENERATED"

            : "CURL UNAVAILABLE"

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

          whiteSpace:
            "pre-wrap",

        }}

      >

        {

          curl
          ||
          "No curl command generated."

        }

      </pre>

      {

        hasCurl && (

          <button

            onClick={
              copyCurl
            }

            style={{

              marginTop:
                "16px",

              padding:
                "10px 16px",

              border:
                "none",

              borderRadius:
                "10px",

              background:
                "#0ea5e9",

              color:
                "#ffffff",

              cursor:
                "pointer",

              fontWeight:
                700,

            }}

          >

            Copy Curl

          </button>

        )

      }

    </section>

  )

}