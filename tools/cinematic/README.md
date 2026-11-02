# Chess study

Both 11-second films use the same original procedural Blender set and the same first 6.6 seconds. The white knight moves from g1 to f3. In A, Black replies d7–d5. B holds on the knight from the other side of the board. The final MP4s are silent. The separate mono WAV contains a synthesized room tone and an original boxwood impact timed to the knight landing.

## Rebuild

Use Blender 4.5 LTS, Python with Pillow and NumPy, and FFmpeg with libx264. From the repository root, supply an empty temporary plate directory for a clean render.

~~~text
blender -b -P tools/cinematic/scene.py -- PATH_TO_PLATES
python tools/cinematic/finish.py PATH_TO_PLATES public/cinematic PATH_TO_FFMPEG
~~~

The scene generator creates the 32 chess pieces, board, wood materials, hands, sleeves, lights and cameras from geometry and procedural shading. Cycles uses CUDA when available and falls back to CPU. The finishing script interpolates 17 rendered knight poses, nine black-pawn reply poses and nine hold plates, applies the grade and camera pushes, and writes two 960 × 720, 24 fps H.264 MP4s, two WebP posters and the separate 24 kHz WAV. The 4:3 frame is composed to fit within a mobile viewer. Display the full frame to preserve the board action.
