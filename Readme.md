# Sledilnik Screenshots

Based on [SledilnikScreenshots](https://github.com/VesterDe/SledilnikScreenshots).

Calling URL with appropriate query params will return `image/png` `base64` encoded.

## Developing new screenshot

Run `yarn` to install everything. You are now ready.

Add your new screenshot settings into an appropriate key inside screenshots.js.

In `test.js` set `query` variable to match your screenshot.

Running `node test.js` should make your screenshot on your local machine.

If you want to observe what is going on, set variable `headless` to `false`.

## Deploying

Just push to master, the code will be live about 60 seconds after that.
