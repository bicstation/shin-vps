// /app/concierge/lib/debug/logger.ts

/* =========================================
🔥 Log Level
========================================= */

export type LogLevel =

  | 'info'
  | 'success'
  | 'warn'
  | 'error'
  | 'debug'

/* =========================================
🔥 Logger Options
========================================= */

type LoggerOptions = {

  enabled?: boolean

  timestamp?: boolean
}

/* =========================================
🔥 Config
========================================= */

const config: LoggerOptions = {

  enabled:
    process.env
      .NODE_ENV
    !== 'production',

  timestamp:
    true,
}

/* =========================================
🔥 Time
========================================= */

function
getTimestamp() {

  return new Date()
    .toISOString()
}

/* =========================================
🔥 Prefix
========================================= */

function
buildPrefix(
  level: LogLevel
) {

  switch (level) {

    case 'info':
      return '🔥 INFO'

    case 'success':
      return '✅ SUCCESS'

    case 'warn':
      return '⚠️ WARN'

    case 'error':
      return '❌ ERROR'

    case 'debug':
      return '🧠 DEBUG'

    default:
      return '🔥 LOG'
  }
}

/* =========================================
🔥 Core Logger
========================================= */

function
writeLog({
  level,
  message,
  payload,
}: {
  level: LogLevel

  message: string

  payload?: any
}) {

  if (
    !config.enabled
  ) {

    return
  }

  const prefix =
    buildPrefix(level)

  const timestamp =

    config.timestamp

      ? `[${getTimestamp()}]`
      : ''

  // ======================================
  // Console Output
  // ======================================

  if (
    payload !== undefined
  ) {

    console.log(

      `${prefix} ${timestamp} ${message}`,

      payload

    )

    return
  }

  console.log(
    `${prefix} ${timestamp} ${message}`
  )
}

/* =========================================
🔥 Public Logger
========================================= */

export const logger = {

  info(
    message: string,
    payload?: any
  ) {

    writeLog({

      level:
        'info',

      message,

      payload,

    })
  },

  success(
    message: string,
    payload?: any
  ) {

    writeLog({

      level:
        'success',

      message,

      payload,

    })
  },

  warn(
    message: string,
    payload?: any
  ) {

    writeLog({

      level:
        'warn',

      message,

      payload,

    })
  },

  error(
    message: string,
    payload?: any
  ) {

    writeLog({

      level:
        'error',

      message,

      payload,

    })
  },

  debug(
    message: string,
    payload?: any
  ) {

    writeLog({

      level:
        'debug',

      message,

      payload,

    })
  },
}

/* =========================================
🔥 Default Export
========================================= */

export default logger