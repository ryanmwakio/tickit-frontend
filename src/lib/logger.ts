/**
 * Frontend Logger Service
 * Logs errors to file and console
 * Browser-safe: file operations only happen server-side
 */

const isServer = typeof window === 'undefined' && typeof process !== 'undefined';
const LOG_DIR = isServer ? process.cwd() + '/logs' : '';
const ERROR_LOG_PATH = LOG_DIR + '/error.log';
const COMBINED_LOG_PATH = LOG_DIR + '/combined.log';

// Lazy-load fs module only when needed (server-side)
function getFsModule() {
  if (!isServer) return null;
  try {
    // Use Function constructor to prevent webpack from bundling fs
    // eslint-disable-next-line no-new-func
    return new Function('return require("fs")')();
  } catch {
    return null;
  }
}

// Ensure logs directory exists (server-side only)
if (isServer) {
  try {
    const fs = getFsModule();
    if (fs && !fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    // Silently fail if fs is not available (e.g., in edge runtime)
  }
}

function formatMessage(level: string, message: any, context?: string, stack?: string): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  const stackStr = stack ? `\n${stack}` : '';
  
  let messageStr = message;
  if (typeof message === 'object') {
    try {
      messageStr = JSON.stringify(message, null, 2);
    } catch {
      messageStr = String(message);
    }
  }
  
  return `${timestamp} ${level} ${contextStr} ${messageStr}${stackStr}\n`;
}

function writeToFile(filePath: string, content: string): void {
  if (!isServer) {
    // Client-side: can't write to file, use console only
    return;
  }

  try {
    const fs = getFsModule();
    if (fs) {
      fs.appendFileSync(filePath, content, 'utf8');
    }
  } catch (error) {
    // Silently fail if fs is not available (e.g., in edge runtime)
  }
}

export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  log(message: any, ...args: any[]) {
    const formatted = formatMessage('LOG', message, this.context);
    writeToFile(COMBINED_LOG_PATH, formatted);
    console.log(message, ...args);
  }

  error(message: any, errorOrContext?: Error | string | object, contextOrArgs?: string | any, ...args: any[]) {
    // Handle different call signatures: error(message, error, context) or error(message, context)
    let errorStack: string | undefined;
    let logContext = this.context;
    
    // Determine if second param is error or context
    if (errorOrContext instanceof Error) {
      errorStack = errorOrContext.stack;
      logContext = typeof contextOrArgs === 'string' ? contextOrArgs : this.context;
    } else if (typeof errorOrContext === 'string') {
      // Could be error string or context
      if (contextOrArgs && typeof contextOrArgs === 'string') {
        // error(message, errorString, context)
        errorStack = errorOrContext;
        logContext = contextOrArgs;
      } else {
        // error(message, context)
        logContext = errorOrContext;
      }
    } else if (typeof errorOrContext === 'object' && errorOrContext !== null) {
      // error(message, errorObject, context)
      errorStack = JSON.stringify(errorOrContext, null, 2);
      logContext = typeof contextOrArgs === 'string' ? contextOrArgs : this.context;
    } else if (typeof errorOrContext === 'string' && !contextOrArgs) {
      // error(message, context) - single string param
      logContext = errorOrContext;
    }
    
    const formatted = formatMessage('ERROR', message, logContext, errorStack);
    writeToFile(ERROR_LOG_PATH, formatted);
    writeToFile(COMBINED_LOG_PATH, formatted);
    console.error(message, errorOrContext, ...(args.length > 0 ? args : []));
  }

  warn(message: any, ...args: any[]) {
    const formatted = formatMessage('WARN', message, this.context);
    writeToFile(COMBINED_LOG_PATH, formatted);
    console.warn(message, ...args);
  }

  debug(message: any, ...args: any[]) {
    const formatted = formatMessage('DEBUG', message, this.context);
    writeToFile(COMBINED_LOG_PATH, formatted);
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, ...args);
    }
  }
}

export const logger = new Logger('Frontend');

