import {test} from 'node:test';
import assert from 'node:assert/strict';
import {session,valid} from '../server/security.js';
import {orderInput} from '../server/contracts.js';
test('signed sessions reject tampering, expiry and wrong secret',()=>{const token=session('x'.repeat(32),1000);assert.ok(valid(token,'x'.repeat(32),1001));assert.equal(valid(token+'x','x'.repeat(32),1001),false);assert.equal(valid(token,'y'.repeat(32),1001),false);assert.equal(valid(token,'x'.repeat(32),1000+8*3600000),false)});
test('orders reject empty, duplicate and invalid quantities',()=>{const order={key:'62f46340-b45a-49a2-9387-2f6af2dfd600',name:'Test',phone:'012345678',address:'Test street',items:[{id:'1',quantity:1}]};assert.ok(orderInput.safeParse(order).success);assert.equal(orderInput.safeParse({...order,items:[]}).success,false);assert.equal(orderInput.safeParse({...order,items:[...order.items,...order.items]}).success,false);assert.equal(orderInput.safeParse({...order,items:[{id:'1',quantity:-1}]}).success,false)});
