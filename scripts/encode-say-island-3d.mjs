import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, copyFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const work = path.join(root, 'work/concept-demos-3d/say-island');
const frames = path.join(work, 'frames');
const output = path.join(root, 'public/media/concept-demos/3d');
const slug = 'say-island-picture-guessing-game-concept';
const ffmpeg = process.env.FFMPEG_PATH || 'C:/Users/Defineless/AppData/Local/Programs/Python/Python312/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const checksum = file => createHash('sha256').update(readFileSync(file)).digest('hex');
for (let f = 1; f <= 720; f++) {
  const file = path.join(frames, `${String(f).padStart(4, '0')}.png`);
  if (!existsSync(file)) throw new Error(`Missing native rendered frame ${f}`);
}
const metadata = await sharp(path.join(frames, '0001.png')).metadata();
if (metadata.width !== 1920 || metadata.height !== 1080) throw new Error('Expected native 1920×1080 frames');
mkdirSync(output, { recursive: true });
const video = path.join(output, `${slug}.mp4`);
const label = "drawtext=fontfile='C\\:/Windows/Fonts/segoeui.ttf':text='Illustrative 3D concept':fontsize=28:fontcolor=0x333D3C:x=30:y=26:box=1:boxcolor=white@0.55:boxborderw=8";
const args = ['-hide_banner', '-y', '-framerate', '24', '-start_number', '1', '-i', path.join(frames, '%04d.png'), '-i', path.join(work, 'audio/final-mix.wav'), '-vf', label, '-frames:v', '720', '-t', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-metadata', 'title=Say Island — illustrative 3D concept interaction', '-metadata', 'comment=Native R01 product geometry. Illustrative button travel and picture transitions; not physical prototype footage.', video];
const encoded = spawnSync(ffmpeg, args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
writeFileSync(path.join(work, 'encode.log'), encoded.stderr || '', 'utf8');
if (encoded.status !== 0) throw new Error(`Encoding failed: ${encoded.stderr?.slice(-1200)}`);
const validation = spawnSync(ffmpeg, ['-v', 'error', '-i', video, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
if (validation.status !== 0 || validation.stderr.trim()) throw new Error(`Decode validation failed: ${validation.stderr}`);
const poster = path.join(output, `${slug}-poster.webp`);
await sharp(path.join(frames, '0001.png')).resize(1280, 720).webp({ quality: 88 }).toFile(poster);
const captions = path.join(output, `${slug}.vtt`);
copyFileSync(path.join(work, 'audio/dialogue.vtt'), captions);
const report = {
  slug, createdAt: new Date().toISOString(), durationSeconds: 30, frameRate: 24, nativeFrames: 720,
  width: 1920, height: 1080, engine: 'Blender 4.5.3 LTS / Cycles / OptiX', samples: 32,
  posterWidth: 1280, posterHeight: 720,
  source: 'SSDAO-ID-R01 / B_DESKTOP_OFFLINE_AA / native CAD tessellation',
  sourceMeshSha256: checksum(path.join(work, 'source/B_mesh.json')),
  pressedMeshSha256: checksum(path.join(work, 'source/B_KEY_RIGHT_DEPRESSED_mesh.json')),
  renderingScriptSha256: checksum(path.join(root, 'scripts/render-say-island-3d.py')),
  handMeshSha256: checksum(path.join(root, 'work/concept-demos-3d/node_modules/@webxr-input-profiles/assets/dist/profiles/generic-hand/right.glb')),
  independentFrameGateSha256: checksum(path.join(work, 'frame-gate.json')),
  editableBlend: path.relative(root, path.join(work, 'say-island-interaction.blend')).replaceAll('\\', '/'),
  output: [video, poster, captions].map(file => ({ file: path.relative(root, file).replaceAll('\\', '/'), bytes: statSync(file).size, sha256: checksum(file) })),
  decodedWithoutErrors: true,
  limitations: ['Illustrative digital concept, not physical prototype footage', '0.8 mm button travel is the original unvalidated CAD illustration', 'Additional picture content and response timing are illustrative', 'No speech recognition or automatic answer scoring'],
};
writeFileSync(path.join(work, 'render-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ video: path.relative(root, video), bytes: statSync(video).size, durationSeconds: 30, frames: 720, decodedWithoutErrors: true }));
