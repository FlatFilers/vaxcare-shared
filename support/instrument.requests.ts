// @ts-nocheck

import { Debugger } from "@flatfile/utils-debugger"
import stripAnsi from "strip-ansi"


/**
 * Instruments HTTP requests to log them to the console.
 * This is useful for debugging
 */
export function instrumentRequests() {
  global.__instrumented = global.__instrumented === undefined ? false : global.__instrumented

  if (global.__instrumented) {
    return
  } else {
    global.__instrumented = true
  }

  if (!!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.CI === "true") {
    const olog = console.log
    console.log = (farg, ...args) => olog(typeof farg === "string" ? stripAnsi(farg) : farg, ...args)
  }

  function requestLogger(httpModule) {
    const original = httpModule.request
    if (!httpModule.__instrumented) {
      httpModule.__instrumented = true
      httpModule.request = function (options, callback) {
        if ((options.href || options.host).includes("pndsn") || (options.href || options.host).endsWith("/ack")) {
          return original(options, callback)
        }
        const startTime = new Date()
        const request = original.apply(this, [options, callback])
        request.on("response", (response) => {
          response.on("end", () => {
            Debugger.logHttpRequest({
              error: response.statusCode >= 400,
              method: options.method,
              url: options.href || options.proto + "://" + options.host + options.path,
              startTime,
              headers: response.headers,
              statusCode: response.statusCode,
            })
          })
        })
        return request
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  requestLogger(require("http"))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  requestLogger(require("https"))

  // Instrumenting fetch
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const startTime = new Date()
    let method = "GET"
    let url = ""
    let headers = {}

    if (typeof input === "string") {
      url = input
      method = init?.method || "GET"
      headers = init?.headers || {}
    } else if (typeof input === "object") {
      url = input.url || ""
      method = input.method || "GET"
      headers = input.headers || {}
    }
    try {
      const response = await originalFetch(input, init)
      const logDetails = {
        error: !response.ok,
        method,
        url,
        startTime,
        headers,
        statusCode: response.status,
      }

      Debugger.logHttpRequest(logDetails)

      return response
    } catch (error) {
      Debugger.logHttpRequest({
        error: true,
        method,
        url,
        startTime,
        headers: {},
        statusCode: 0,
      })
      throw error
    }
  }
}
