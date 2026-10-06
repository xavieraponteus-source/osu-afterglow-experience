const music=document.querySelector('#background-music');
const play=document.querySelector('#music-play'),stop=document.querySelector('#music-stop'),status=document.querySelector('#music-status');
let pending=false,enterPending=false,operation=0;
function sync(){const playing=!music.paused&&music.volume>0;play.disabled=playing||pending;stop.disabled=music.paused&&!pending;status.textContent=playing?'Music playing':enterPending?'Music ready':'Music off';}
async function start(volume){const id=++operation;pending=true;music.volume=volume;sync();try{await music.play();}catch{if(id===operation)status.textContent='Press Play for music';}finally{if(id===operation){pending=false;play.disabled=!music.paused&&music.volume>0;stop.disabled=music.paused;}}}
play.addEventListener('click',()=>{enterPending=false;start(.4);});
stop.addEventListener('click',()=>{operation++;enterPending=false;pending=false;music.pause();music.currentTime=0;sync();});
// Start silently during the visitor's gesture so browsers permit playback.
// Reveal the song only after the welcome/door transition finishes.
document.addEventListener('osu:prepare-entry',()=>{if(enterPending||(!music.paused&&music.volume>0))return;enterPending=true;start(0);});
document.addEventListener('osu:entered',()=>{if(!enterPending)return;enterPending=false;music.currentTime=0;music.volume=.4;if(music.paused)start(.4);else sync();});
music.addEventListener('play',sync);music.addEventListener('pause',sync);music.addEventListener('error',()=>{pending=false;enterPending=false;sync();status.textContent='Music unavailable';});
sync();
