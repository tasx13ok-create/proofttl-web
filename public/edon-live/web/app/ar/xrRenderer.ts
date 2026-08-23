export type XrHudEntity={
  id?:string;
  trackId?:string;
  label?:string;
  category?:string;
  confidence?:number;
  box?:{x:number;y:number;w:number;h:number};
};

export type XrPerceptionFrame={
  frameDataUrl?:string|null;
  entities?:XrHudEntity[];
  commentary?:string|null;
  publishedAt?:string|null;
};

export type XrAnchor={
  anchorId:string;
  label:string;
  position:{x:number;y:number;z:number};
};

export type XrOverlayMode='sensor_panel'|'calibrated_overlay';

export type XrRenderSettings={
  mode:XrOverlayMode;
  threshold:number;
  showBoxes:boolean;
  showLabels:boolean;
  showAnchors:boolean;
  mirrorX:boolean;
  scaleX:number;
  scaleY:number;
  offsetX:number;
  offsetY:number;
};

export type XrSceneState={
  anchors:XrAnchor[];
  reticle:{x:number;y:number;z:number}|null;
  settings:XrRenderSettings;
};

type GL=WebGLRenderingContext|WebGL2RenderingContext;

type ProgramInfo={
  program:WebGLProgram;
  position:number;
  uv?:number;
  color?:WebGLUniformLocation|null;
  texture?:WebGLUniformLocation|null;
};

const DEFAULT_SETTINGS:XrRenderSettings={
  mode:'sensor_panel',threshold:.55,showBoxes:true,showLabels:true,showAnchors:true,
  mirrorX:false,scaleX:1,scaleY:1,offsetX:0,offsetY:0,
};

export class EdonXrRenderer{
  private gl:GL;
  private colorProgram:ProgramInfo;
  private textureProgram:ProgramInfo;
  private colorBuffer:WebGLBuffer;
  private textureBuffer:WebGLBuffer;
  private texture:WebGLTexture;
  private hudCanvas:HTMLCanvasElement;
  private hudCtx:CanvasRenderingContext2D;
  private image:HTMLImageElement|null=null;
  private imageSource='';
  private frame:XrPerceptionFrame={};
  private textureDirty=true;
  private disposed=false;

  constructor(gl:GL){
    this.gl=gl;
    this.colorProgram=this.createColorProgram();
    this.textureProgram=this.createTextureProgram();
    const colorBuffer=gl.createBuffer(),textureBuffer=gl.createBuffer(),texture=gl.createTexture();
    if(!colorBuffer||!textureBuffer||!texture)throw new Error('XR GPU resource allocation failed');
    this.colorBuffer=colorBuffer;this.textureBuffer=textureBuffer;this.texture=texture;
    this.hudCanvas=document.createElement('canvas');this.hudCanvas.width=1024;this.hudCanvas.height=512;
    const ctx=this.hudCanvas.getContext('2d');if(!ctx)throw new Error('XR HUD canvas unavailable');this.hudCtx=ctx;
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D,null);
  }

  setPerception(frame:XrPerceptionFrame){
    if(this.disposed)return;
    this.frame=frame||{};
    const src=typeof frame?.frameDataUrl==='string'&&frame.frameDataUrl.startsWith('data:image/')?frame.frameDataUrl:'';
    if(src&&src!==this.imageSource){
      this.imageSource=src;
      const image=new Image();
      image.onload=()=>{if(this.disposed||this.imageSource!==src)return;this.image=image;this.textureDirty=true};
      image.onerror=()=>{if(this.imageSource===src){this.image=null;this.textureDirty=true}};
      image.src=src;
    }
    this.textureDirty=true;
  }

  render(baseLayer:any,pose:any,scene:Partial<XrSceneState>){
    if(this.disposed||!baseLayer?.framebuffer||!pose?.views?.length)return;
    const gl=this.gl;
    const settings={...DEFAULT_SETTINGS,...(scene.settings||{})};
    this.refreshHudTexture(settings);
    gl.bindFramebuffer(gl.FRAMEBUFFER,baseLayer.framebuffer);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0,0,0,0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    for(const view of pose.views){
      const viewport=baseLayer.getViewport(view);if(!viewport)continue;
      gl.viewport(viewport.x,viewport.y,viewport.width,viewport.height);
      if(settings.mode==='sensor_panel')this.drawHudQuad(.12,.18,.96,.88);
      else this.drawHudQuad(-1,-1,1,1);
      if(scene.reticle)this.drawWorldMarker(view,scene.reticle,.018,[0,.9,1,.96]);
      if(settings.showAnchors&&Array.isArray(scene.anchors))for(const anchor of scene.anchors.slice(-32))this.drawWorldMarker(view,anchor.position,.026,[0,1,.25,.95]);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  }

  dispose(){
    if(this.disposed)return;this.disposed=true;
    const gl=this.gl;
    gl.deleteBuffer(this.colorBuffer);gl.deleteBuffer(this.textureBuffer);gl.deleteTexture(this.texture);
    gl.deleteProgram(this.colorProgram.program);gl.deleteProgram(this.textureProgram.program);
    this.image=null;
  }

  private refreshHudTexture(settings:XrRenderSettings){
    if(!this.textureDirty)return;
    this.textureDirty=false;
    const c=this.hudCanvas,ctx=this.hudCtx,w=c.width,h=c.height;
    ctx.clearRect(0,0,w,h);
    if(settings.mode==='sensor_panel')this.paintSensorPanel(ctx,w,h,settings);
    else this.paintCalibratedOverlay(ctx,w,h,settings);
    const gl=this.gl;
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    gl.bindTexture(gl.TEXTURE_2D,null);
  }

  private paintSensorPanel(ctx:CanvasRenderingContext2D,w:number,h:number,settings:XrRenderSettings){
    ctx.fillStyle='rgba(0,8,5,.88)';roundRect(ctx,0,0,w,h,26);ctx.fill();
    ctx.strokeStyle='rgba(0,255,65,.72)';ctx.lineWidth=4;roundRect(ctx,2,2,w-4,h-4,24);ctx.stroke();
    ctx.fillStyle='#00ff41';ctx.font='700 30px ui-monospace,Consolas,monospace';ctx.fillText('EDÔN // EXTERNAL SENSOR',34,48);
    ctx.fillStyle='#8ab98e';ctx.font='18px ui-monospace,Consolas,monospace';ctx.fillText('PHONE → PC → PERCEPTION  //  NOT QUEST CAMERA',34,78);
    const video={x:30,y:104,w:680,h:382};
    ctx.fillStyle='#010502';ctx.fillRect(video.x,video.y,video.w,video.h);
    if(this.image){
      const fit=contain(this.image.naturalWidth||640,this.image.naturalHeight||360,video.w,video.h);
      const dx=video.x+(video.w-fit.w)/2,dy=video.y+(video.h-fit.h)/2;
      ctx.drawImage(this.image,dx,dy,fit.w,fit.h);
      this.paintEntities(ctx,{x:dx,y:dy,w:fit.w,h:fit.h},settings,false);
    }else{
      ctx.fillStyle='#5f7e64';ctx.font='22px ui-monospace,Consolas,monospace';ctx.fillText('WAITING FOR PHONE FRAME',video.x+42,video.y+video.h/2);
    }
    ctx.strokeStyle='rgba(0,255,65,.35)';ctx.lineWidth=2;ctx.strokeRect(video.x,video.y,video.w,video.h);
    const entities=this.filteredEntities(settings);
    ctx.fillStyle='#a8ffb0';ctx.font='700 21px ui-monospace,Consolas,monospace';ctx.fillText(`${entities.length} PERCEPTS`,742,130);
    ctx.font='17px ui-monospace,Consolas,monospace';
    let y=166;
    for(const entity of entities.slice(0,9)){
      const label=entityLabel(entity),conf=Math.round(Number(entity.confidence||0)*100);
      ctx.fillStyle=classColor(entity);ctx.fillRect(742,y-13,8,8);
      ctx.fillStyle='#d6ffdb';ctx.fillText(`${label.slice(0,14)} ${conf}%`,760,y);y+=31;
    }
    const age=this.frame.publishedAt?Date.now()-Date.parse(this.frame.publishedAt):NaN;
    ctx.fillStyle=Number.isFinite(age)&&age<4000?'#00ff41':'#ffd600';ctx.font='700 18px ui-monospace,Consolas,monospace';
    ctx.fillText(Number.isFinite(age)?`FEED ${Math.max(0,age/1000).toFixed(1)}s`:'FEED —',742,458);
  }

  private paintCalibratedOverlay(ctx:CanvasRenderingContext2D