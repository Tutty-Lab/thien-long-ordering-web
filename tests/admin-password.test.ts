import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adminConfigured} from '../server/security.js';
test('deployed password policy rejects six characters; loopback may explicitly accept six',()=>{const secret='s'.repeat(32);assert.equal(adminConfigured('123456',secret),false);assert.equal(adminConfigured('123456',secret,6),true);assert.equal(adminConfigured('12345',secret,6),false);assert.equal(adminConfigured('123456','short',6),false);assert.equal(adminConfigured('long-password',secret),true)});
