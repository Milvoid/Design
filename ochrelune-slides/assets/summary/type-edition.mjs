import fs from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base=path.resolve('..'), out='/Users/milvoid/.codex/visualizations/2026/11/08/01a1ba64-2df3-7b22-9ed1-85d0a4275047/dianrong-summary/点融的下一笔投资-苹方版.png';
const asset=async n=>'data:image/png;base64,'+(await fs.readFile(path.join(base,n))).toString('base64');
const macro=await asset('summary-study/macro.png'),port=await asset('v3/portfolio.png'),pos=await asset('v3/appPos.png');
const original=await sharp(path.join(base,'v3/brand.png')).extract({left:127,top:121,width:411,height:169}).removeAlpha().raw().toBuffer({resolveWithObject:true});
const buf=Buffer.alloc(411*169*4);for(let i=0;i<411*169;i++){buf[i*4]=buf[i*4+1]=buf[i*4+2]=255;buf[i*4+3]=Math.round(Math.max(0,Math.min(1,(original.data[i*original.info.channels]-61)/194))*255)}
const mark='data:image/png;base64,'+(await sharp(buf,{raw:{width:411,height:169,channels:4}}).png().toBuffer()).toString('base64');
const gr=await sharp(path.join(base,'v3/graphB.png')).resize(850,760,{fit:'cover'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
const graphbuf=Buffer.alloc(gr.info.width*gr.info.height*4);for(let i=0;i<gr.info.width*gr.info.height;i++){
 let r=gr.data[i*3],g=gr.data[i*3+1],b=gr.data[i*3+2];let strength=255-Math.min(r,g,b);let alpha=Math.min(1,strength/90);for(const [j,col] of [r,g,b].entries())graphbuf[i*4+j]=Math.max(0,255-(255-col)/Math.max(alpha,.001));graphbuf[i*4+3]=Math.round(255*alpha);}
const graph='data:image/png;base64,'+(await sharp(graphbuf,{raw:{width:gr.info.width,height:gr.info.height,channels:4}}).png().toBuffer()).toString('base64');
const K='#191D1C',G='#087A57',S='#5B6561',bg='#F4F5F4',soft='#E3ECE7',font='Hiragino Sans GB',sans='Helvetica Neue';
const formerText=(s,x,y,z,c=K,wt=600,anchor='start',f=font,spacing=0)=>`<text x="${x}" y="${y}" font-family="${f}, sans-serif" font-size="${z}" font-weight="${wt}" text-anchor="${anchor}" fill="${c}" letter-spacing="${spacing}">${s}</text>`;
const rect=(x,y,w,h,r,f,st='none',sw=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`;
const im=(src,x,y,w,h,mode='xMidYMid meet')=>`<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${mode}" xlink:href="${src}"/>`;
const p=(d,c,sw=2.8)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const formerNum=(s,unit,x,y,z,u,c,anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${c}"><tspan font-family="Helvetica Neue" font-size="${z}" font-weight="600" letter-spacing="-4">${s}</tspan><tspan dx="5" font-family="Hiragino Sans GB" font-size="${u}" font-weight="600">${unit}</tspan></text>`;
const labels=[];
function markText(x,y,c,anchor,runs){const i=labels.length;labels.push({anchor,runs});return `<g transform="translate(${x} ${y})" fill="${c}">@@OUTLINE${i}@@</g>`;}
function t(s,x,y,z,c=K,wt=600,anchor='start',f=font,spacing=0){
 const style=wt>=600?'PingFangSC-Medium':'PingFangSC-Regular';
 const tracking=s==='点融的下一笔投资'?1.1:(z>=28?-.32:.08);
 return markText(x,y,c,anchor,[{value:s,size:z,style,tracking}]);
}
function num(s,unit,x,y,z,u,c,anchor='start'){
 const runs=[{value:s,size:z,style:s==='650'?'sfMedium':'sfRegular',tracking:-z*.048}];
 if(unit) runs.push({value:' '+unit,size:u,style:'PingFangSC-Medium',tracking:-u*.024});
 return markText(x,y,c,anchor,runs);
}
let defs=`<linearGradient id="hero" x1="4%" y1="100%" x2="100%" y2="0%"><stop stop-color="#142C25"/><stop offset=".55" stop-color="#234F3F"/><stop offset="1" stop-color="#306B53"/></linearGradient><linearGradient id="ink"><stop stop-color="#115B42"/><stop offset="1" stop-color="#299B68"/></linearGradient><linearGradient id="film"><stop stop-color="#101A18" stop-opacity=".6"/><stop offset=".62" stop-color="#111" stop-opacity="0"/></linearGradient><linearGradient id="gf"><stop offset="0" stop-color="white" stop-opacity=".02"/><stop offset=".16" stop-color="white" stop-opacity="1"/><stop offset="1" stop-color="white"/></linearGradient><mask id="gfade"><rect x="264" y="0" width="320" height="208" fill="url(#gf)"/></mask>`;
let all='',idx=0;function tile(x,y,w,h,background,content){const id='t'+(++idx);defs+=`<clipPath id="${id}"><rect width="${w}" height="${h}" rx="25"/></clipPath>`;all+=`<g transform="translate(${x} ${y})"><g clip-path="url(#${id})">${rect(0,0,w,h,0,background)}${content}</g></g>`}
// The four staggered strips meet the centred 716 × 350 brand panel.
tile(12,12,751,341,'#27312E',im(macro,0,0,751,341,'xMidYMid slice')+rect(0,0,751,341,0,'url(#film)')+t('从金属触点',29,229,42,'white')+t('到整机',29,285,42,'white'));
tile(775,12,543,341,bg,num('400','万',271.5,203,145,58,K,'middle')+t('注册零售出借人',271.5,259,36,S,500,'middle'));
tile(602,365,716,350,'url(#hero)',im(mark,171,61,374,154)+t('点融的下一笔投资',358,273,42,'#F3F9F5',500,'middle',font,.6));
// An actual case screenshot is inset in a dark period-appropriate handset.
let phone=rect(306,40,212,393,32,'#616866')+rect(308,42,208,389,30,'#202422')+rect(314,52,196,369,24,'#101211')+rect(389,60,48,4,2,'#78817D')+rect(323,77,178,326,3,'#FFF')+im(port,323,77,178,326,'xMidYMin slice');
tile(1330,12,578,294,bg,t('团团赚',31,139,44,K)+t('分散持仓',32,192,36,S,500)+phone);
tile(1330,318,578,190,bg,`<g mask="url(#gfade)">${im(graph,260,-52,317,283,'xMidYMid slice')}</g>`+t('关联图',30,90,39,K)+t('识别风险',30,139,32,S,500));
// A single checked invoice describes the control without floating icon-stacks.
const check=rect(332,35,142,147,8,'#FAFCFB','#8FABA0',3)+p('M354 64h79 M354 80h56 M354 98h42','#A1B5AB',4)+rect(413,106,70,54,13,'#D5E9DE')+p('M428 133l11 11 26-29','#17805A',5);
tile(1330,520,578,195,bg,t('直接买方',30,88,39,K)+t('确认应付',30,138,32,S,500)+check);
const qbars=rect(321,63,195,13,6.5,'#358169')+rect(321,104,77,13,6.5,'#B9C9BF')+t('新增',322,55,16,S,400)+t('原有',322,99,16,S,400);
tile(12,365,578,194,bg,num('71','家',29,111,97,35,K)+t('整合借款服务中心',31,164,31,S,500)+qbars);
const checks=[0,1,2].map((n)=>{const x=276+84*n;return rect(x,45,70,86,8,n===2?'#DFEDE6':'#F8FAF9','#90AA9A',2.5)+p('M'+(x+13)+' 67h40 M'+(x+13)+' 77h27','#9AADA1',2.5)+p('M'+(x+18)+' 103l8 8 19-20','#2C7855',3.5)}).join('');
tile(12,571,578,182,bg,t('共享账本',31,80,37,K)+t('核对状态',31,128,32,S,500)+checks);
const bank=p('M57 93l87-44 87 44z M69 103h150 M77 155h134 M69 165h150','#57776A',4.3)+[88,118,149,180].map(x=>p('M'+x+' 111v35','#57776A',5)).join('');
tile(12,765,278,303,bg,bank+t('资金存管',139,224,32,K,600,'middle')+t('与信用审核分工',139,262,24,S,500,'middle'));
const at=rect(52,70,91,66,11,'#DCECE2')+p('M68 101l13 13 25-29','#267950',5)+p('M145 104h26m-7-6 7 6-7 6','#879C90',3)+p('M179 137V93l17-13v17l17-14v13h10V67h8v70z M189 116h8 M206 116h8','#536D60',3.5);
tile(302,765,288,303,bg,at+t('首批回款后',144,224,31,K,600,'middle')+t('决定是否扩张',144,263,26,S,500,'middle'));
tile(602,727,442,341,'#EAF2EC',num('650','',221,174,133,45,'url(#ink)','middle')+t('万美元',221,221,37,'#176242',600,'middle')+t('试点累计促成贷款',221,281,30,K,600,'middle'));
tile(1056,727,405,341,bg,num('80','万元',202.5,177,109,37,K,'middle')+t('提前 90 天到账',202.5,235,33,K,600,'middle')+t('课堂融资算例',202.5,281,21,S,400,'middle'));
tile(1473,727,435,341,bg,num('100','笔',217.5,177,109,39,K,'middle')+t('收回买方接入成本',217.5,235,32,K,600,'middle')+t('课堂盈亏平衡算例',217.5,281,21,S,400,'middle'));
let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080"><defs>${defs}</defs><rect width="1920" height="1080" fill="#FFF"/>${all}</svg>`;
const outlines=JSON.parse(execFileSync("./text-outlines",{input:JSON.stringify(labels),maxBuffer:16000000}).toString());svg=svg.replace(/@@OUTLINE(\d+)@@/g,(_,i)=>outlines[Number(i)]);
await sharp(Buffer.from(svg),{density:144}).png().toFile(out);await sharp(out).resize(1000).png().toFile('/tmp/dr-apple-type-check.png');
