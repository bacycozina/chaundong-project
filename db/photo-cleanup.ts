import {database,bucket} from './store';
export async function cleanupPhotos(){
 try{const rows=await database().prepare('SELECT photo_key FROM photo_cleanup LIMIT 10').all<{photo_key:string}>();
 for(const row of rows.results){await bucket().delete(row.photo_key);await database().prepare('DELETE FROM photo_cleanup WHERE photo_key=?').bind(row.photo_key).run()}
 }catch{ /* A failed storage deletion remains queued for the next record operation. */ }
}
