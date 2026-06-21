// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/_components/RuntimeEndpoint.tsx

"use client";

type Props = {

  endpoint?: string

  method?: string

}

export default function RuntimeEndpoint({

  endpoint,

  method = "POST",

}: Props) {

  const hasEndpoint =

    !!endpoint

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

        Runtime Endpoint

      </h2>

      <div

        style={{

          marginTop:
            "12px",

          marginBottom:
            "16px",

          color:

            hasEndpoint

              ? "#22c55e"

              : "#ef4444",

          fontWeight:
            700,

        }}

      >

        {

          hasEndpoint

            ? "ENDPOINT RESOLVED"

            : "ENDPOINT MISSING"

        }

      </div>

      <div

        style={{

          padding:
            "16px",

          borderRadius:
            "12px",

          background:
            "#111827",

          color:
            "#e5e7eb",

          fontFamily:
            "monospace",

          overflowX:
            "auto",

        }}

      >

        <div>

          <strong>

            Method:

          </strong>

          {" "}

          {method}

        </div>

        <div

          style={{

            marginTop:
              "12px",

          }}

        >

          <strong>

            Endpoint:

          </strong>

          {" "}

          {endpoint || "N/A"}

        </div>

      </div>

    </section>

  )

}