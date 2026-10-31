import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseOrderReceipt} from '../src/lib/order-receipt.js';
test('confirmation retains server total, rejecting invalid success bodies',()=>{const receipt={id:'80125f15-8198-4a77-8ba3-fd788318b9db',total:23};assert.deepEqual(parseOrderReceipt(receipt),receipt);for(const value of [{}, {...receipt,total:-1},{...receipt,total:'23'},{...receipt,id:'invalid'}])assert.throws(()=>parseOrderReceipt(value));});
