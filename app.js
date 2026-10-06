import * as THREE from 'three';
import {OBJLoader} from './assets/OBJLoader.js';
import {OrbitControls} from './assets/OrbitControls.js';
const entry=document.querySelector('#entrance'),main=document.querySelector('main');let entering=false,active=true,openDoors=()=>{},resetDoors=()=>{},requestEntry=()=>enter();
function enter(){if(entering)return;document.dispatchEvent(new Event('osu:prepare-entry'));entering=true;openDoors();entry.classList.add('opening');setTimeout(()=>{entry.hidden=true;main.hidden=false;active=false;document.dispatchEvent(new Event('osu:entered'));window.scrollTo(0,0);document.querySelector('nav a').focus();},matchMedia('(prefers-reduced-motion: reduce)').matches?50:1850)}
document.querySelector('#door').addEventListener('click',()=>requestEntry());document.querySelector('#skip').addEventListener('click',enter);document.querySelector('#replay').addEventListener('click',()=>{entering=false;active=true;resetDoors();main.hidden=true;entry.hidden=false;entry.classList.remove('opening');window.scrollTo(0,0);document.querySelector('#door').focus()});
const dialog=document.querySelector('dialog');document.querySelector('#plan').onclick=()=>dialog.showModal();document.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});let wish='';document.querySelector('#plan-form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);wish=`My Ōsu adventure wish list\nInterests: ${d.get('focus')}\nGuests: ${d.get('guests')}\nNotes: ${d.get('notes')||'No extra notes'}\nBooking details to be confirmed.`;document.querySelector('#summary').textContent=wish;document.querySelector('#summary').style.whiteSpace='pre-line';document.querySelector('#plan-result').hidden=false;document.querySelector('#copy').textContent='Copy wish list ↗'};document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(wish);document.querySelector('#copy').textContent='Copied ✓'}catch{document.querySelector('#copy').textContent='Select the note above to copy'}};
try{
const canvas=document.querySelector('#scene'),hint=document.querySelector('#door'),status=document.querySelector('#game-status'),front=document.querySelector('#front-view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x102527,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');const scene=new THREE.Scene();scene.background=new THREE.Color(0x213f4a);scene.fog=new THREE.FogExp2(0x213f4a,.00016);const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,1,7000);scene.add(new THREE.HemisphereLight(0xabbfc9,0x645333,2));const light=new THREE.DirectionalLight(0xffdcaa,3);light.position.set(100,1200,800);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-1100,right:1100,top:1100,bottom:-1100,near:10,far:3500});light.shadow.bias=-.0003;scene.add(light);const warm=new THREE.PointLight(0xff992f,750000,1300);warm.position.set(-45,150,130);scene.add(warm);
const loader=new THREE.TextureLoader();const atlas=loader.load('./assets/House_albedo.jpg');atlas.colorSpace=THREE.SRGBColorSpace;atlas.anisotropy=4;const groundTexture=loader.load('./assets/sol.jpg');groundTexture.colorSpace=THREE.SRGBColorSpace;
const doorSlideDistance=115;
let doors=[],opening=false,startTime=0,loaded=false,approach=null,finishApproach=false,lastFrame=0;
const cameraStart=new THREE.Vector3(),entryCamera=new THREE.Vector3(),target=new THREE.Vector3(),doorPoint=new THREE.Vector3(-40,130,-5);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=false;controls.minDistance=150;controls.maxDistance=2500;controls.maxPolarAngle=Math.PI*.49;controls.autoRotate=!reducedMotion.matches;controls.autoRotateSpeed=.7;
controls.addEventListener('start',()=>{controls.autoRotate=false;approach=null;finishApproach=false;});
const walking=new Set();const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
addEventListener('keydown',e=>{if(!active||entering||!loaded||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(keyMap[e.code]){e.preventDefault();walking.add(keyMap[e.code]);controls.autoRotate=false;approach=null;}if(e.code==='KeyE'){e.preventDefault();requestEntry();}});addEventListener('keyup',e=>walking.delete(keyMap[e.code]));addEventListener('blur',()=>walking.clear());
document.querySelectorAll('[data-walk]').forEach(button=>{button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);walking.add(button.dataset.walk);controls.autoRotate=false;approach=null;});const release=()=>walking.delete(button.dataset.walk);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);});
function walkToDoor(enterAfter=false){if(!loaded||opening)return;controls.autoRotate=false;walking.clear();approach={at:performance.now(),from:camera.position.clone(),target:controls.target.clone()};finishApproach=enterAfter;status.textContent='Walking to the restaurant…';}
requestEntry=()=>{document.dispatchEvent(new Event('osu:prepare-entry'));if(!loaded){enter();return;}if(camera.position.distanceTo(doorPoint)>420)walkToDoor(true);else enter();};front.onclick=()=>walkToDoor();document.querySelector('#reset-view').onclick=()=>{resetDoors();controls.autoRotate=!reducedMotion.matches;};
new OBJLoader().load('./assets/JapanHouse.obj',obj=>{
 obj.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;const old=Array.isArray(m.material)?m.material:[m.material];const materials=old.map(a=>new THREE.MeshStandardMaterial({map:a.name==='sol'?groundTexture:atlas,roughness:.9,side:THREE.DoubleSide,emissive:a.name==='vitre'?0xbb7028:0x000000,emissiveIntensity:.35}));
 const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;const pos=g.attributes.position;const keep=[],panels=[[],[]],groups=[];
 for(const group of g.groups.length?g.groups:[{start:0,count:pos.count,materialIndex:0}]){const first=keep.length;for(let i=group.start;i<group.start+group.count;i+=3){const x=(pos.getX(i)+pos.getX(i+1)+pos.getX(i+2))/3,y=(pos.getY(i)+pos.getY(i+1)+pos.getY(i+2))/3,z=(pos.getZ(i)+pos.getZ(i+1)+pos.getZ(i+2))/3;const door=old[group.materialIndex]?.name==='porte'&&y<230&&x>-100&&z>-10;if(door)panels[x<-40?0:1].push(i,i+1,i+2);else keep.push(i,i+1,i+2)}if(keep.length>first)groups.push({start:first,count:keep.length-first,materialIndex:group.materialIndex})}
 g.setIndex(keep);g.clearGroups();groups.forEach(a=>g.addGroup(a.start,a.count,a.materialIndex));m.geometry=g;m.material=materials.length===1?materials[0]:materials;
 panels.forEach((indices,side)=>{if(!indices.length)return;const dg=new THREE.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const array=new Float32Array(indices.length*a.itemSize);indices.forEach((idx,k)=>{for(let c=0;c<a.itemSize;c++)array[k*a.itemSize+c]=a.array[idx*a.itemSize+c]});dg.setAttribute(name,new THREE.BufferAttribute(array,a.itemSize))}const panel=new THREE.Mesh(dg,new THREE.MeshStandardMaterial({map:atlas,roughness:.9,side:THREE.DoubleSide}));doors.push({mesh:panel});});
 });doors.forEach(d=>{d.mesh.castShadow=true;obj.add(d.mesh)});scene.add(obj);loaded=true;canvas.classList.add('ready');hint.disabled=false;front.disabled=false;status.textContent='Explore the restaurant in 3D';hint.textContent='Enter through the restaurant door';
},undefined,()=>{hint.disabled=false;hint.textContent='Continue to the experience';status.textContent='The 3D model could not load. You can still enter.'});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(10000,10000),new THREE.MeshStandardMaterial({color:0x132e2b,roughness:.3}));floor.rotation.x=-Math.PI/2;floor.position.y=-3;floor.receiveShadow=true;scene.add(floor);
// Moonlit garden surrounding the original restaurant platform.
scene.background = new THREE.Color(0x04091b);
scene.fog = new THREE.FogExp2(0x071224, 0.00007);
light.color.set(0xb9d2ff);
light.intensity = 0.85;
floor.material.color.set(0x12331d);
floor.material.roughness = 1;
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(135, 40, 28),
  new THREE.MeshBasicMaterial({ color: 0xfff1cb, fog: false })
);
moon.position.set(1100, 1400, -2800);
scene.add(moon);
// A soft halo is attached to the moon, always facing the visitor.
const haloCanvas = document.createElement('canvas');
haloCanvas.width = haloCanvas.height = 128;
const haloContext = haloCanvas.getContext('2d');
const haloGradient = haloContext.createRadialGradient(64,64,12,64,64,64);
haloGradient.addColorStop(0,'rgba(239,230,190,.35)');
haloGradient.addColorStop(.45,'rgba(169,198,244,.12)');
haloGradient.addColorStop(1,'rgba(169,198,244,0)');
haloContext.fillStyle=haloGradient;haloContext.fillRect(0,0,128,128);
const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(haloCanvas),transparent:true,depthWrite:false,fog:false}));
halo.position.copy(moon.position);halo.scale.set(750,750,1);scene.add(halo);
const starLayers=[];
for(let layer=0;layer<3;layer++){
 const coords=[],colors=[];
 for(let i=0;i<260;i++){
  const angle=Math.random()*Math.PI*2,height=.22+Math.random()*.75;
  const radius=4400,ring=Math.sqrt(1-height*height)*radius;
  coords.push(Math.cos(angle)*ring,height*radius,Math.sin(angle)*ring);
  const brightness=.65+Math.random()*.35;colors.push(brightness*.9,brightness*.95,brightness);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const stars=new THREE.Points(geometry,new THREE.PointsMaterial({size:layer===0?2.2:1.4,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.8,fog:false,depthWrite:false}));
 scene.add(stars);starLayers.push(stars);
}
const bladeGeometry=new THREE.PlaneGeometry(9,55,1,3);bladeGeometry.translate(0,27.5,0);
const grassMaterial=new THREE.MeshStandardMaterial({color:0x428a45,side:THREE.DoubleSide,roughness:1});
const wind={value:0};
grassMaterial.onBeforeCompile=shader=>{
 shader.uniforms.gardenTime=wind;
 shader.vertexShader='uniform float gardenTime;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 #ifdef USE_INSTANCING
 float tip=clamp(position.y/55.0,0.0,1.0);
 float phase=instanceMatrix[3].x*.012+instanceMatrix[3].z*.008;
 transformed.x+=sin(gardenTime*1.2+phase)*7.0*tip*tip;
 #endif`);
};
const grass=new THREE.InstancedMesh(bladeGeometry,grassMaterial,5200);
const blade=new THREE.Object3D();
for(let i=0;i<5200;i++){
 let x,z;
 do{x=(Math.random()-.5)*4800;z=(Math.random()-.5)*4800;}
 while(x>-740&&x<840&&z>-870&&z<680);
 blade.position.set(x,-2,z);blade.rotation.set(0,Math.random()*Math.PI*2,0);
 const scale=.55+Math.random()*.9;blade.scale.set(scale,scale,scale);blade.updateMatrix();grass.setMatrixAt(i,blade.matrix);
}
grass.instanceMatrix.needsUpdate=true;grass.receiveShadow=true;scene.add(grass);
function animateGarden(seconds){
 wind.value=seconds;
 starLayers.forEach((stars,i)=>stars.material.opacity=.7+Math.sin(seconds*.8+i*2.1)*.18);
}

const positions=new Float32Array(110*3);for(let i=0;i<110;i++){positions[i*3]=(Math.random()-.5)*1800;positions[i*3+1]=Math.random()*900;positions[i*3+2]=(Math.random()-.5)*1000}const particles=new THREE.BufferGeometry();particles.setAttribute('position',new THREE.BufferAttribute(positions,3));const motes=new THREE.Points(particles,new THREE.PointsMaterial({color:0xffd992,size:2.4,transparent:true,opacity:.65}));scene.add(motes);
function resetView(){const mobile=innerWidth<750;cameraStart.set(mobile?420:500,mobile?310:340,mobile?1350:1080);target.set(-45,240,-40);camera.position.copy(cameraStart);controls.target.copy(target);controls.update();}function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}resize();resetView();addEventListener('resize',resize);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();function hit(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return doors.some(d=>raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(d.mesh)))}canvas.addEventListener('pointermove',e=>canvas.style.cursor=hit(e)?'pointer':'default');let pointerStart=null;canvas.addEventListener('pointerdown',e=>pointerStart={x:e.clientX,y:e.clientY});canvas.addEventListener('click',e=>{if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<8&&hit(e))requestEntry()});
openDoors=()=>{opening=true;controls.enabled=false;approach=null;walking.clear();startTime=performance.now();entryCamera.copy(camera.position);doors.forEach(d=>d.start=d.mesh.position.x);status.textContent='Welcome — come on in!'};resetDoors=()=>{opening=false;controls.enabled=true;approach=null;walking.clear();doors.forEach(d=>d.mesh.position.x=0);resetView();status.textContent='Explore the restaurant in 3D';};
function tick(t){requestAnimationFrame(tick);const dt=Math.min((t-lastFrame)/1000,.05);lastFrame=t;if(!active)return;const sec=t*.001;
if(opening){const p=Math.min((t-startTime)/1350,1),ease=p*p*(3-2*p);doors.forEach(d=>d.mesh.position.x=THREE.MathUtils.lerp(d.start,doorSlideDistance,ease));camera.position.lerpVectors(entryCamera,new THREE.Vector3(-40,130,80),ease);camera.lookAt(doorPoint);}
else if(approach){const p=Math.min((t-approach.at)/1700,1),ease=p*p*(3-2*p);camera.position.lerpVectors(approach.from,new THREE.Vector3(-40,140,320),ease);controls.target.lerpVectors(approach.target,doorPoint,ease);camera.lookAt(controls.target);if(p===1){approach=null;controls.update();status.textContent='You’re at the door. Click it or press E to enter.';if(finishApproach){finishApproach=false;enter();}}}
else{if(walking.size&&loaded){const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0));const move=new THREE.Vector3();if(walking.has('forward'))move.add(forward);if(walking.has('backward'))move.sub(forward);if(walking.has('right'))move.add(right);if(walking.has('left'))move.sub(right);move.normalize().multiplyScalar(350*dt);const next=camera.position.clone().add(move);if(next.z<75)move.z=75-camera.position.z;camera.position.add(move);controls.target.add(move);status.textContent=camera.position.distanceTo(doorPoint)<420?'Press E or click the door to enter.':'Explore the restaurant in 3D';}controls.update(dt);}
if(!opening&&loaded){const proximity=THREE.MathUtils.clamp((750-camera.position.distanceTo(doorPoint))/400,0,1);const openness=proximity*proximity*(3-2*proximity);const blend=reducedMotion.matches?1:1-Math.exp(-7*dt);doors.forEach(d=>d.mesh.position.x=THREE.MathUtils.lerp(d.mesh.position.x,doorSlideDistance*openness,blend));}
if(!reducedMotion.matches){animateGarden(sec);warm.intensity=750000+Math.sin(sec*1.4)*90000;motes.rotation.y=sec*.025;for(let i=0;i<110;i++)positions[i*3+1]=(positions[i*3+1]+dt*22)%900;particles.attributes.position.needsUpdate=true;}
renderer.render(scene,camera)}requestAnimationFrame(tick);
}catch(e){document.querySelector('#door').disabled=false;document.querySelector('#door').textContent='Enter the experience ↗';document.querySelector('#game-status').textContent='3D graphics aren’t available in this browser. You can still enter.';console.warn('3D scene unavailable; entrance remains usable.',e)}
