import { TextEncoder, TextDecoder } from 'node:util';

Reflect.set(global, 'TextEncoder', TextEncoder);
Reflect.set(global, 'TextDecoder', TextDecoder);

