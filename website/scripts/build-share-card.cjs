// Deterministic original-logo composition requested by the user.
// Run with sharp available locally or through NODE_PATH. Original assets stay intact.
const path = require('node:path');
const sharp = require('sharp');
const assets = path.resolve(__dirname,'../public/assets');
async function main(){
  const shade=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><radialGradient id="shade"><stop stop-color="#061522" stop-opacity=".87"/>
    <stop offset=".7" stop-color="#061522" stop-opacity=".55"/>
    <stop offset="1" stop-color="#061522" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="630" fill="#03121e" opacity=".28"/>
    <ellipse cx="600" cy="315" rx="620" ry="340" fill="url(#shade)"/>
  </svg>`);
  const logo=await sharp(path.join(assets,'branding/vireth-logo-20260915.png')).resize({width:720}).png().toBuffer();
  const slogan=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <text x="600" y="471" text-anchor="middle" font-family="Malgun Gothic, sans-serif"
      font-size="44" font-weight="600" letter-spacing="1" fill="#fff7e8">누구든, 무엇이든 될 수 있는 곳</text>
  </svg>`);
  await sharp(path.join(assets,'hero/hero-desktop.png')).resize(1200,630,{fit:'cover'})
    .composite([{input:shade},{input:logo,left:240,top:140},{input:slogan}])
    .png({compressionLevel:9}).toFile(path.join(assets,'branding/vireth-share-v1.png'));
  console.log('Created 1200x630 share card with unchanged original logo centered at 720px wide.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
