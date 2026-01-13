"use strict";

module.exports = (defaultFuncs, api, ctx) => {
  return () => {
    return ctx.userID;
  };
};