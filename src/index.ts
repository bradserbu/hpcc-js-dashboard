import "es6-promise/auto";  // polyfill Promise on IE
import "tslib";

import { Level, logger } from "@hpcc-js/comms";
import { Frame } from "./frame";

import "../style/index.css";

logger.level(Level.debug);

function main(): void {
  const frame = new Frame();
  frame.main();
}

window.onload = main;
