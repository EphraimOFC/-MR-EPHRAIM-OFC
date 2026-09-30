const axios=require('axios'); const FormData=require('form-data');
module.exports={name:"url",execute:async(sock,m,a,s)=>{
let q=m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
let media = q? {message: q} : m;
try{
let buffer=await sock.downloadMediaMessage(media);
let form=new FormData(); form.append("file", buffer, "file.jpg");
let {data}=await axios.post("https://catbox.moe/user/api.php", form, {headers: form.getHeaders()});
await sock.sendMessage(m.chat,{text:`🔗 *URL:* ${data}\n> ${s.footer}`},{quoted:m});
}catch(e){ await sock.sendMessage(m.chat,{text:"❌ Reply to image/video"}, {quoted:m}); }
}};
