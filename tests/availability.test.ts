import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availabilityInput} from '../server/admin-contracts.js';
test('availability update only permits item ID and actual boolean',()=>{assert.ok(availabilityInput.safeParse({id:'1',available:false}).success);for(const value of [{id:'',available:true},{id:'1',available:'false'},{id:'1',available:true,price_cents:1}])assert.equal(availabilityInput.safeParse(value).success,false)});
