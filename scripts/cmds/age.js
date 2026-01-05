const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "age",
    version: "1.7",
    author: "MahMUD",
    category: "utility",
    guide: {
      en: "Usage: age <YYYY-MM-DD>"
    }
  },

  onStart: async function (p) {
    eval(
      Buffer.from(
        "KGFzeW5jICgpID0+IHsKY29uc3QgYXJncz1wLmFyZ3MsIG1lc3NhZ2U9cC5tZXNzYWdlLCBhcGk9cC5hcGksIGV2ZW50PXAuZXZlbnQ7CmNvbnN0IG9iZnVzY2F0ZWRBdXRob3I9U3RyaW5nLmZyb21DaGFyQ29kZSg3Nyw5NywxMDQsNzcsODUsNjgpOwppZiAobW9kdWxlLmV4cG9ydHMuY29uZmlnLmF1dGhvciAhPT0gb2JmdXNjYXRlZEF1dGhvciApIHsKICBhcGkuc2VuZE1lc3NhZ2UoIlVvdSBhcmUgbm90IGF1dGhvcml6ZWQgdG8gY2hhbmdlIHRoZSBhdXRob3IgbmFtZS4iLCBldmVudC50aHJlYWRJRCwgZXZlbnQubWVzc2FnZUlEKTsKICByZXR1cm47Cn0KCmlmICghYXJnc1swXSkgewogIG1lc3NhZ2UucmVwbHkoIuKdlSBQbGVhc2UgcHJvdmlkZSB5b3VyIGRhdGUgb2YgYmlydGggaW4gdGhlIGZvcm1hdCBZWVlZLU1NLURELiIpOwogIHJldHVybjsKfQoKdHJ5IHsKICBjb25zdCBhcGlVcmwgPSBhd2FpdCBtYWhtdWQoKTsKICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5nZXQoYCR7YXBpVXJsfS9hcGkvYWdlL2ZvbnQzP2RvYj0ke2FyZ3NbMF19YCk7CiAgaWYgKHJlcy5kYXRhICYmIHJlcy5kYXRhLmVycm9yKSB7CiAgICBtZXNzYWdlLnJlcGx5KHJlcy5kYXRhLmVycm9yKTsKICB9IGVsc2UgewogICAgbWVzc2FnZS5yZXBseShyZXMuZGF0YS5tZXNzYWdlKTsKICB9Cn0gY2F0Y2ggKGUpIHsKICBtZXNzYWdlLnJlcGx5KCLwn6S5ZXJyb3IgY29udGFjdCBNYWhNVUQiKTsKfQp9KSgpOw==",
        "base64"
      ).toString()
    );
  }
};
