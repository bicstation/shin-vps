// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/_components/RuntimeConsole.tsx

"use client";

import { useState } from "react";

import RuntimeSelector from "./RuntimeSelector";
import RuntimeForm from "./RuntimeForm";

import RuntimeState from "./RuntimeState";
import RuntimeRequest from "./RuntimeRequest";
import RuntimeEndpoint from "./RuntimeEndpoint";
import RuntimeCurl from "./RuntimeCurl";
import RuntimeStatus from "./RuntimeStatus";
import RuntimeResponse from "./RuntimeResponse";
import RuntimeDiff from "./RuntimeDiff";
import FailureLocator from "./FailureLocator";

import { executeFinder } from "../_runtime/finder";
import { executeSemantic } from "../_runtime/semantic";
import { executeNavigation } from "../_runtime/navigation";
import { executeConcierge } from "../_runtime/concierge";
import { executeProductDetail } from "../_runtime/product-detail";

export default function RuntimeConsole() {

  const [
    runtimeType,
    setRuntimeType,
  ] = useState("finder");

  const [
    usage,
    setUsage,
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function execute() {

    setLoading(true);

    try {

      let data;

      switch (runtimeType) {

        case "finder":
          console.log(
            "TEST FINDER",
            {
              usage,
              maxPrice,
            }
          );
          data = await executeFinder(
            usage,
            maxPrice
              ? Number(maxPrice)
              : undefined
          );
          break;

        case "semantic":
          data =
            await executeSemantic();
          break;

        case "navigation":
          data =
            await executeNavigation();
          break;

        case "concierge":

          data =
            await executeConcierge(
              usage
            );
          break;
        
        case "product-detail":

          data =
            await executeProductDetail(
              usage
            );
          break;

        default:

          data = null;

      }

      setResult(data);

    }

    catch (error) {

      console.error(
        error
      );

    }

    finally {

      setLoading(false);

    }

  }

  return (

    <main

      style={{

        maxWidth:
          "1400px",

        margin:
          "0 auto",

        padding:
          "32px",

        color:
          "#ffffff",

      }}

    >

      <h1>

        Runtime Reality Workbench

      </h1>

      <RuntimeSelector

        value={
          runtimeType
        }

        onChange={
          setRuntimeType
        }

      />

      <RuntimeForm

        runtimeType={
          runtimeType
        }

        usage={
          usage
        }

        maxPrice={
          maxPrice
        }

        onUsageChange={
          setUsage
        }

        onMaxPriceChange={
          setMaxPrice
        }

        onExecute={
          execute
        }

        loading={
          loading
        }

      />

      {

        result && (

          <>

            <RuntimeState

              state={{

                usage,
                maxPrice,

              }}

            />

            <RuntimeRequest

              request={
                result.request
              }

            />

            <RuntimeEndpoint

              endpoint={
                result.endpoint
              }

              method={
                result.method
              }

            />

            <RuntimeCurl

              curl={
                result.curl
              }

            />

            <RuntimeStatus

              runtimeType={
                runtimeType
              }

              status={

                result.runtimeStatus
                ||
                "success"

              }

              executionTime={

                result.executionTime

              }

            />

            <RuntimeResponse

              response={
                result.runtime
              }

            />

            <RuntimeDiff

              state={{

                usage,
                maxPrice,

              }}

              request={
                result.request
              }

              response={
                result.runtime
              }

            />

            <FailureLocator

              state={{

                usage,
                maxPrice,

              }}

              request={
                result.request
              }

              response={
                result.runtime
              }

            />

          </>

        )

      }

    </main>

  );

}