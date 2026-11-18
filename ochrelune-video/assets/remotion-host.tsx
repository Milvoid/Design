// Remotion 外壳：每帧通知 iframe 舞台画第 N 帧，舞台画完回报后才截图。
// 舞台页面需要监听 {type:'ochre-frame', frame, token}，画完回 {type:'ochre-presented', token}，出错回 {type:'ochre-error', text, token}。
import React, {useLayoutEffect, useRef} from 'react';
import {Composition, registerRoot, useCurrentFrame, delayRender, continueRender, cancelRender} from 'remotion';

export const fps = 30;
export const cuts = [0, 126, 251 /* … 每镜起始帧，最后一项为总帧数 */];
export const duration = cuts[cuts.length - 1];

function Film({stageURL, title}: {stageURL: string; title: string}) {
  const frame = useCurrentFrame();
  const node = useRef<HTMLIFrameElement>(null);
  useLayoutEffect(() => {
    const token = frame + '-' + performance.now();
    const handle = delayRender('frame ' + frame, {timeoutInMilliseconds: 90000});
    const origin = new URL(stageURL).origin;
    let done = false;
    const submit = () => node.current?.contentWindow?.postMessage({type: 'ochre-frame', frame, token}, origin);
    const listener = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== node.current?.contentWindow || event.data?.token !== token || done) return;
      if (event.data.type === 'ochre-error') { cancelRender(new Error(event.data.text)); return; }
      if (event.data.type === 'ochre-presented') { done = true; continueRender(handle); }
    };
    const child = node.current;
    window.addEventListener('message', listener);
    child?.addEventListener('load', submit);
    submit();
    return () => {
      window.removeEventListener('message', listener);
      child?.removeEventListener('load', submit);
      if (!done) { done = true; continueRender(handle); }
    };
  }, [frame, stageURL]);
  return <iframe ref={node} src={stageURL} title={title}
    style={{border: 0, display: 'block', width: 1920, height: 1080, background: '#FAF9F5'}}/>;
}

registerRoot(() => (
  <Composition id="OchreFilm" component={Film} durationInFrames={duration} fps={fps} width={1920} height={1080}
    defaultProps={{stageURL: 'http://127.0.0.1:8080/stage.html', title: 'Ochrelune film'}}/>
));

/* 舞台端（stage.mjs）的最小骨架：
const ready = (async () => {
  await Promise.all([loadAssets(), document.fonts.load('500 80px OchreTitle'),
    document.fonts.load('400 40px OchreBody'), document.fonts.load('500 180px OchreNumber')]);
  await document.fonts.ready;
  const brushes = await initBrushes();          // 见 brush-marks.mjs
  return frame => {
    const n = cuts.findIndex(c => c > frame), f = frame - cuts[n - 1];
    base.innerHTML = shot(n, f);                // 当前镜头 SVG
    // 前 15 帧把上一镜最后一帧叠在 #cover 上做交叉淡化；笔触画在 #effect canvas
  };
})();
addEventListener('message', async e => {
  if (e.source !== parent || e.data?.type !== 'ochre-frame') return;
  const {frame, token} = e.data;
  try { (await ready)(frame); document.body.getBoundingClientRect();
        parent.postMessage({type: 'ochre-presented', frame, token}, e.origin); }
  catch (err) { parent.postMessage({type: 'ochre-error', text: String(err), token}, e.origin); }
});

渲染（render.mjs）：bundle → selectComposition → renderMedia({codec:'h264', pixelFormat:'yuv420p', crf:16,
imageFormat:'png', muted:true, chromiumOptions:{gl:'swangle'}, concurrency:4})，再用 ffmpeg 混入音乐。
*/
