import {loadEnv} from 'vite';
import {neon} from '@neondatabase/serverless';
import sharp from 'sharp';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {normalizeImage} from '../server/image.js';
const url=loadEnv('development',process.cwd(),'').DATABASE_URL;
if(!url)throw Error('DATABASE_URL required');
const sql=neon(url),id='image-check-'+randomUUID();
const png=await sharp({create:{width:4,height:4,channels:3,background:'#cc3300'}}).png().toBuffer();
const image=await normalizeImage('data:image/png;base64,'+png.toString('base64'));
// Atomic transient row: never visible to other sessions; no persistent test data.
const results=await sql.transaction([
 sql`INSERT INTO menu_items(id,name,category,image,price_cents,available) VALUES(${id},'Image verification','Verification',${image},100,false) RETURNING id`,
 sql`SELECT image FROM menu_items WHERE id=${id}`,
 sql`DELETE FROM menu_items WHERE id=${id} RETURNING id`
]);
assert.equal(results[1][0]?.image,image);assert.equal(results[2][0]?.id,id);
assert.equal((await sql`SELECT id FROM menu_items WHERE id=${id}`).length,0);
console.log(JSON.stringify({task_id:'ADMIN-IMAGE-05',database_image_roundtrip:'PASS',stored_format:'WebP Base64 in PostgreSQL text',persistent_test_rows:0}));
