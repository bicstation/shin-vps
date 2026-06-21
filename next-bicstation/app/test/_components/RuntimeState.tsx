"use client";

type Props = {

  state: any

}

export default function RuntimeState({

  state,

}: Props) {

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

        Runtime State

      </h2>

      <pre

        style={{

          marginTop:
            "16px",

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

            state,

            null,

            2

          )

        }

      </pre>

    </section>

  )

}