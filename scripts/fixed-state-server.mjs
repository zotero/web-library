import {getServer} from '../test/utils/fixed-state-server.js';
import {fixturePathLookup} from "./fixtures.mjs";

const state = process.argv[2];
const path = fixturePathLookup.get(state);
await getServer(state, 8001);
console.log(`Server started on http://localhost:8001/${path} with state ${state}`);