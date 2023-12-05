const { TextEncoder, TextDecoder } = require('node:util');

Reflect.set(global, 'TextEncoder', TextEncoder);
Reflect.set(global, 'TextDecoder', TextDecoder);

