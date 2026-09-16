// Run with sharp installed locally or exposed through NODE_PATH.
// Rasterizes the editable SVG; source artwork and header logo are untouched.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const dir = path.resolve(__dirname, '../public/assets/branding');
async function main() {
  const svg = await fs.readFile(path.join(dir, 'favicon-v1.svg'));
  for (const size of [16,32,48,180,192,512]) {
    await sharp(svg).resize(size,size).png().toFile(path.join(dir,`favicon-v1-${size}.png`));
  }
  const sizes=[16,32,48], images=await Promise.all(sizes.map(size=>fs.readFile(path.join(dir,`favicon-v1-${size}.png`))));
  const header=Buffer.alloc(6+16*sizes.length);
  header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
  let offset=header.length;
  images.forEach((image,i)=>{
    const pos=6+i*16;
    header[pos]=sizes[i];header[pos+1]=sizes[i];
    header.writeUInt16LE(1,pos+4);header.writeUInt16LE(32,pos+6);
    header.writeUInt32LE(image.length,pos+8);header.writeUInt32LE(offset,pos+12);
    offset+=image.length;
  });
  await fs.writeFile(path.join(dir,'favicon-v1.ico'),Buffer.concat([header,...images]));
  console.log('Created six PNG sizes and multi-size ICO from favicon-v1.svg');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
