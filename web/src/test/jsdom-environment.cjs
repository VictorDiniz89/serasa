const { TestEnvironment } = require('jest-environment-jsdom');

/**
 * jsdom does not provide Fetch (Request/Response). MSW v2 needs them.
 * Copy Node's implementations onto the jsdom global.
 */
class JsdomWithFetch extends TestEnvironment {
  constructor(config, context) {
    super(config, context);

    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.fetch = fetch;
    this.global.FormData = FormData;
    this.global.ReadableStream = ReadableStream;
    this.global.TransformStream = TransformStream;
    this.global.BroadcastChannel = BroadcastChannel;
    this.global.structuredClone = structuredClone;
    this.global.Blob = Blob;
    this.global.File = File;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
  }
}

module.exports = JsdomWithFetch;
