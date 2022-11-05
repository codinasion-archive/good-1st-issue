const { createNodeMiddleware, createProbot } = require("probot");

import App from "../../../lib/index";

module.exports = createNodeMiddleware(App, {
    probot: createProbot(),
    webhooksPath: "/api/github/webhooks",
});

export { }
