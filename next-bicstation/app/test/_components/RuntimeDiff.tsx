"use client";

type Props = {

  state?: any

  request?: any

  response?: any

}

export default function RuntimeDiff({

  state,

  request,

  response,

}: Props) {

  const stateUsage =

    state?.usage || ""

  const requestUsage =

    request?.usage || []

  const responseCount =

    Array.isArray(
      response?.results
    )
      ? response.results.length
      : 0

  const checks = [

    {

      label:
        "State Usage",

      value:
        stateUsage,

      success:
        !!stateUsage,

    },

    {

      label:
        "Request Usage",

      value:
        JSON.stringify(
          requestUsage
        ),

      success:
        requestUsage.length > 0,

    },

    {

      label:
        "Response Results",

      value:
        responseCount,

      success:
        responseCount > 0,

    },

  ]

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

        Runtime Diff

      </h2>

      <table

        style={{

          width:
            "100%",

          marginTop:
            "16px",

          borderCollapse:
            "collapse",

        }}

      >

        <thead>

          <tr>

            <th

              style={{

                textAlign:
                  "left",

                padding:
                  "12px",

                borderBottom:
                  "1px solid #334155",

              }}

            >

              Check

            </th>

            <th

              style={{

                textAlign:
                  "left",

                padding:
                  "12px",

                borderBottom:
                  "1px solid #334155",

              }}

            >

              Value

            </th>

            <th

              style={{

                textAlign:
                  "left",

                padding:
                  "12px",

                borderBottom:
                  "1px solid #334155",

              }}

            >

              Status

            </th>

          </tr>

        </thead>

        <tbody>

          {

            checks.map(

              (check) => (

                <tr

                  key={
                    check.label
                  }

                >

                  <td

                    style={{

                      padding:
                        "12px",

                      borderBottom:
                        "1px solid #1e293b",

                    }}

                  >

                    {

                      check.label

                    }

                  </td>

                  <td

                    style={{

                      padding:
                        "12px",

                      borderBottom:
                        "1px solid #1e293b",

                      fontFamily:
                        "monospace",

                    }}

                  >

                    {

                      String(
                        check.value
                      )

                    }

                  </td>

                  <td

                    style={{

                      padding:
                        "12px",

                      borderBottom:
                        "1px solid #1e293b",

                      color:

                        check.success

                          ? "#22c55e"

                          : "#ef4444",

                      fontWeight:
                        700,

                    }}

                  >

                    {

                      check.success

                        ? "PASS"

                        : "FAIL"

                    }

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

    </section>

  )

}