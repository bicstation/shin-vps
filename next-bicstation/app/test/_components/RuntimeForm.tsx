"use client";

type Props = {

runtimeType: string

usage: string

maxPrice: string

onUsageChange: (
value: string
) => void

onMaxPriceChange: (
value: string
) => void

onExecute: () => void

loading?: boolean

}

export default function RuntimeForm({

runtimeType,

usage,

maxPrice,

onUsageChange,

onMaxPriceChange,

onExecute,

loading = false,

}: Props) {

const isFinder =


runtimeType === "finder"


const requiresInput =


runtimeType === "finder"
||
runtimeType === "concierge"


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

  <h2

    style={{

      color:
        "#ffffff",

      marginBottom:
        "20px",

    }}

  >

    Runtime Request

  </h2>

  {

    requiresInput && (

      <>

        <div>

          <label

            style={{

              display:
                "block",

              color:
                "#94a3b8",

              marginBottom:
                "8px",

            }}

          >

            Usage

          </label>

          <input

            value={
              usage
            }

            onChange={(e) =>

              onUsageChange(
                e.target.value
              )

            }

            placeholder={

              runtimeType === "finder"

                ? "usage-ai"

                : "相談内容"

            }

            style={{

              width:
                "100%",

              maxWidth:
                "520px",

              padding:
                "12px 16px",

              border:
                "1px solid #334155",

              borderRadius:
                "10px",

              background:
                "#020617",

              color:
                "#ffffff",

              fontSize:
                "14px",

              outline:
                "none",

            }}

          />

        </div>

        {

          isFinder && (

            <div

              style={{

                marginTop:
                  "16px",

              }}

            >

              <label

                style={{

                  display:
                    "block",

                  color:
                    "#94a3b8",

                  marginBottom:
                    "8px",

                }}

              >

                Max Price

              </label>

              <input

                type="number"

                value={
                  maxPrice
                }

                onChange={(e) =>

                  onMaxPriceChange(
                    e.target.value
                  )

                }

                placeholder="300000"

                style={{

                  width:
                    "100%",

                  maxWidth:
                    "520px",

                  padding:
                    "12px 16px",

                  border:
                    "1px solid #334155",

                  borderRadius:
                    "10px",

                  background:
                    "#020617",

                  color:
                    "#ffffff",

                  fontSize:
                    "14px",

                  outline:
                    "none",

                }}

              />

            </div>

          )

        }

      </>

    )

  }

  <div

    style={{

      marginTop:
        "20px",

    }}

  >

    <button

      onClick={
        onExecute
      }

      disabled={
        loading
      }

      style={{

        padding:
          "12px 24px",

        border:
          "none",

        borderRadius:
          "12px",

        background:
          "linear-gradient(135deg,#0ea5e9,#38bdf8)",

        color:
          "#ffffff",

        fontWeight:
          700,

        cursor:
          "pointer",

        boxShadow:
          "0 8px 24px rgba(14,165,233,.25)",

      }}

    >

      {

        loading

          ? "Running..."

          : "Execute"

      }

    </button>

  </div>

</section>


)

}
