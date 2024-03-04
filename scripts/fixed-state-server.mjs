import { getServer } from '../test/utils/fixed-state-server.js';

const state = process.argv[2];
getServer(state, 8001);
console.log(`Server started on http://localhost:8001 with state ${state}`);