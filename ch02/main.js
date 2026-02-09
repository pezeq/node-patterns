// import * as a from "./a.js";
// import * as b from "./b.js";
// console.log("a ->", a);
// console.log("b ->", b);

import { logger } from "./logger.js";
import "./colorizeLogger.js";

logger.info("Hello, World!");
logger.warn("Free disk space is running low");
logger.error("Failed to connect to database");
logger.debug("main() is starting");