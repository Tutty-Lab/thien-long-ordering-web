import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicMenu} from '../src/lib/menu.js';
test('empty public catalog is authoritative, not a fallback catalog',()=>{assert.deepEqual(parsePublicMenu([]),[])});
test('public menu preserves current sale and rejects invalid API bodies',()=>{const item={id:'1',name:'Pho',category:'Main',description:'',image:'',price:13,sale:null};assert.equal(parsePublicMenu([item])[0].sale,null);assert.equal(parsePublicMenu([{...item,sale:11.5}])[0].sale,11.5);for(const body of [{error:'Unavailable'},null,[{...item,price:'13'}]])assert.throws(()=>parsePublicMenu(body))});
