"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return (str) => ctx[str];
};
