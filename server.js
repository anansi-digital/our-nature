// @ts-check
const fs = require('fs');
const path = require('path');
const express = require('express');
const nocache = require('nocache');

// TODO: Make it so we don't have to call `.default` at the end of this
const hydrogenMiddleware = require('@shopify/hydrogen/middleware').default;

const resolve = (p) => path.resolve(__dirname, p);

async function createServer() {
  const indexProd = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');

  const app = express();

  app.use(require('compression')());

  // We temporarily disable caching in production. This is currently in place until
  // more fine-grained caching rules are added to this demo.
  // TODO: remove
  if (process.env.NODE_ENV === 'production') {
    app.use(nocache());
  }
  app.use(
    require('serve-static')(resolve('dist/client'), {
      index: false,
    }),
  );

  app.use(
    '*',
    hydrogenMiddleware({
      getServerEntrypoint: () =>
        require('./dist/server/entry-server.js').default,
      indexTemplate: indexProd,
    }),
  );

  return {app};
}

createServer().then(({app}) => {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Hydrogen running at http://localhost:${port}`);
  });
});
