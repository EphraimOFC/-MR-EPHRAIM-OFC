const axios = require('axios');

function pickUrl(value){
  if(!value) return null;
  if(typeof value === 'string') return /^https?:\\/\\//i.test(value) ? value : null;
  if(typeof value !== 'object') return null;
  return value.url || value.dlink || value.download || value.downloadUrl || value.link || value.data?.url || value.data?.dlink || null;
}

async function chaminduDownload(kind, sourceUrl, quality='720'){
  const endpoint = `https://api.chamindu.site/api/v1/media/${kind}/dl`;
  const response = await axios.get(endpoint, {
    params: { url: sourceUrl, quality },
    responseType: 'arraybuffer',
    timeout: 90000,
    maxContentLength: 80 * 1024 * 1024,
    maxBodyLength: 80 * 1024 * 1024,
    validateStatus: () => true
  });

  const type = String(response.headers['content-type'] || '').toLowerCase();
  if(response.status < 200 || response.status >= 300) {
    throw new Error(`Chamindu API returned HTTP ${response.status}`);
  }

  if(type.includes('application/json') || type.includes('text/json')){
    let data;
    try { data = JSON.parse(Buffer.from(response.data).toString('utf8')); }
    catch { throw new Error('Chamindu API returned invalid JSON'); }
    const url = pickUrl(data?.result) || pickUrl(data);
    if(!url) throw new Error(data?.message || 'Chamindu API returned no media URL');
    const media = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 90000,
      maxContentLength: 80 * 1024 * 1024,
      maxBodyLength: 80 * 1024 * 1024
    });
    return {
      buffer: Buffer.from(media.data),
      mimetype: media.headers['content-type'] || (kind === 'ytmp4' ? 'video/mp4' : 'audio/mpeg')
    };
  }

  return {
    buffer: Buffer.from(response.data),
    mimetype: response.headers['content-type'] || (kind === 'ytmp4' ? 'video/mp4' : 'audio/mpeg')
  };
}

module.exports = { chaminduDownload };
