"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return (str) => ctx.globalOptions[str];
};
