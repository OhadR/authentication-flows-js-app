# authentication-flows-js-app

This project is a web-app, and uses the "authentication-flows-js" module. 
The "authentication-flows-js" project is [here](https://github.com/OhadR/authentication-flows-js).

[authentication-flows-js](https://github.com/OhadR/authentication-flows-js)

[authentication-flows-js on npm](https://www.npmjs.com/package/authentication-flows-js)

## `body-parser`

According to https://www.digitalocean.com/community/tutorials/use-expressjs-to-get-url-and-post-parameters, the client-app
MUST use body-parser in order to be able to parse the body params.
Thus, the `authentication-flows-js` can use:

        debug(`createAccount requestBody ${req.body}`);
