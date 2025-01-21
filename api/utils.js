import fs from 'fs';
import archiver from 'archiver';
import { parseFile } from 'music-metadata';

export function zip(sourceFolderPath, destFilePath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Folder ${sourceFolderPath} compressed successfully.`);
      resolve(destFilePath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceFolderPath, false);
    archive.finalize();
  });
}

export async function getTrackName(filePath){
  const metadata = await parseFile(filePath);
  const title = metadata.common.title || 'Untitled';
  return title
}

export async function poll(songId,redis_client,postgres_client){
  let songExists = await redis_client.get(songId);
  try{
    if (songExists === null) {
      songExists = (await postgres_client.query('SELECT COUNT(*) FROM songs WHERE track_id = $1;',[songId])).rows[0].count
      if (songExists == 1) {
        await redis_client.set(songId, songExists);
      }
    }
    return songExists
  }catch{
    return 0
  }
}
