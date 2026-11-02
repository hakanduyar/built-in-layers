"""Grade the original plates, assemble both silent films and synthesize their opt-in score.
python finish.py PATH_TO_PLATES PATH_TO_OUTPUT [PATH_TO_FFMPEG]
Requires Pillow, numpy and FFmpeg with libx264.
"""
import functools
import math
from pathlib import Path
import subprocess
import sys
import wave
import numpy as np
from PIL import Image

plates, output = map(Path, sys.argv[1:3])
encoder = sys.argv[3] if len(sys.argv) > 3 else 'ffmpeg'
output.mkdir(parents=True, exist_ok=True)
width, height, fps = 960, 720, 24

@functools.lru_cache(maxsize=38)
def read(name):
    return Image.open(plates / (name+'.png')).convert('RGB')

def interpolate(series, end, fraction):
    at = max(0,min(end,end*fraction))
    index = int(at)
    return Image.blend(read(series+'%02d'%index),read(series+'%02d'%min(index+1,end)),at-index)

def frame(ending,time):
    if time < 2.5:
        shot = read('opening')
        zoom = 1.015 + time*.019
    elif time < 6.6:
        t = (time-2.5)/4.1
        shot = interpolate('move',16,max(0,min(1,(t-.14)/.68)))
        zoom = 1.015+.052*t
    elif ending=='b':
        shot = interpolate('hold',8,(time-6.6)/2.2)
        zoom = 1.07-(time-6.6)*.010
    else:
        t = max(0,min(1,(time-7.25)/1.65))
        shot = interpolate('reply',8,t)
        zoom = 1.025+(time-6.6)*.010
    # A restrained optical push preserves the full action inside a 4:3 crop.
    w,h=shot.size
    dx,dy=w*(1-1/zoom)/2,h*(1-1/zoom)/2
    top=0 if 2.5 <= time < 6.6 else dy
    shot=shot.resize((width,height),Image.Resampling.BICUBIC,box=(dx,top,w-dx,min(h,h-2*dy+top)))
    rgb=np.asarray(shot,dtype=np.float32)/255
    rgb=np.clip((rgb-.39)*1.115+.39,0,1)
    rgb*=vignette
    shadow = np.maximum(0,.33-rgb.mean(axis=2))
    rgb[:,:,1]+=shadow*.055
    rgb[:,:,2]+=shadow*.095
    grain=np.random.default_rng(round(time*fps)+203).normal(0,.0021,(height,width)).astype(np.float32)
    rgb+=grain[:,:,None]
    rgb[:,:,0]*=1.032
    rgb[:,:,2]*=.952
    # Fade from ochre-black and dip back at the tail, preserving poster visibility.
    fade=min(1,.42+time/.64,.24+(11-time)/.62)
    return Image.fromarray((np.clip(rgb*fade,0,1)*255).astype('uint8'))

y,x=np.mgrid[-1:1:complex(height),-1:1:complex(width)]
vignette=np.clip(1.04-.12*(x*x+y*y),.74,1)[:,:,None].astype(np.float32)
for ending in ['a','b']:
    frame(ending,8.95 if ending=='a' else 7.45).save(output/f'chess-{ending}.webp',quality=90)
    command=[encoder,'-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
             '-s',f'{width}x{height}','-r',str(fps),'-i','-','-an','-c:v','libx264',
             '-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',
             str(output/f'chess-{ending}.mp4')]
    proc=subprocess.Popen(command,stdin=subprocess.PIPE)
    try:
        for i in range(11*fps):
            proc.stdin.write(frame(ending,i/fps).tobytes())
    finally:
        proc.stdin.close()
    if proc.wait(): raise RuntimeError('Video encode failed')
# Felt-lined room, low two-note bowed resonance and a dry boxwood landing.
rate=24000
t=np.arange(rate*11)/rate
signal=np.zeros_like(t)
for freq,amp in [(73.416,.051),(110,.022),(146.83,.014),(220,.008)]:
    signal+=amp*np.sin(2*np.pi*freq*t+.32*np.sin(2*np.pi*.16*t))
signal*=np.minimum(1,t/1.6)*np.minimum(1,(11-t)/1.6)
rng=np.random.default_rng(68)
def strike(start,level):
    local=t-start
    active=(local>=0)&(local<.29)
    u=local[active]
    body=(np.sin(2*np.pi*410*u)*np.exp(-u*37)+.65*np.sin(2*np.pi*950*u)*np.exp(-u*55))
    attack=rng.normal(0,1,len(u))*np.exp(-u*145)
    signal[active]+=level*(body+.55*attack)
strike(3.10,.065)
strike(5.85,.23)
for delay,gain in [(.042,.065),(.087,.034),(.13,.018)]:
    strike(5.85+delay,gain)
with wave.open(str(output/'chess-sound.wav'),'wb') as wav:
    wav.setparams((1,2,rate,0,'NONE','not compressed'))
    wav.writeframes((signal.clip(-1,1)*32767).astype('<i2').tobytes())
