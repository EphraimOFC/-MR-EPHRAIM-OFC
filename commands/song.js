const yts = require('yt-search');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const settings = require('../settings');
const tmpDir = path.join(__dirname, '../tmp');
const searchCache = new Map();
const SEARCH_TTL = 5 * 60 * 1000;

function findTool(name) {
  const exe = process.platform === 'win32' ? name + '.exe' : name;
  const wingetPath = process.platform === 'win32'
    ? path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', exe)
    : '';
  return wingetPath && fs.existsSync(wingetPath) ? wingetPath : exe;
}

function cleanFileName(name) {
  return String(name || 'song')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'song';
}

function mimeFor(ext) {
  const e = String(ext || '').toLowerCase();
  if (e === 'm4a') return 'audio/mp4';
  if (e === 'mp3') return 'audio/mpeg';
  if (e === 'webm') return 'audio/webm';
  if (e === 'ogg' || e === 'opus') return 'audio/ogg; codecs=opus';
  return 'audio/mpeg';
}

function sendProcessCard(conn, m, video) {
  const caption =
`╭─〔 🎵 E TECH SONG 〕─╮
│
│  🎧 *${video.title}*
│  ⏱️ ${video.timestamp || 'Unknown'}
│  🎤 ${video.author?.name || 'YouTube'}
│
│  ⚡ Preparing fast audio...
│
╰────────────────────╯

${settings.footer}`;
  return conn.sendMessage(
    m.chat,
    { image: { url: video.thumbnail }, caption },
    { quoted: m }
  );
}

function downloadAudio(url, id) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const outputBase = path.join(tmpDir, `song-${id}`);
    const args = [
      '--no-playlist',
      '-f', 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio',
      '--concurrent-fragments', '4',
      '--retries', '1',
      '--fragment-retries', '1',
      '--socket-timeout', '15',
      '--no-warnings',
      '--quiet',
      '-o', `${outputBase}.%(ext)s`,
      url
    ];

    execFile(findTool('yt-dlp'), args, {
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024
    }, (error) => {
      if (error) return reject(error);

      const file = fs.readdirSync(tmpDir)
        .find(name => name.startsWith(`song-${id}.`));

      if (!file) return reject(new Error('yt-dlp completed without an audio file.'));
      resolve(path.join(tmpDir, file));
    });
  });
}

module.exports = {
  name: 'song',
  alias: ['play', 'music', 's'],

  async execute(m, { conn, text, args }) {
    const raw = String(text || args.join(' ')).trim();

    if (!raw) {
      await conn.sendMessage(
        m.chat,
        { text: '🎵 *E TECH SONG*\n\nUse: *.song <song title or YouTube link>*\nExample: *.song Burna Boy - Last Last*' },
        { quoted: m }
      );
      return false;
    }

    const query = raw.replace(/^audio\s+/i, '').trim();
    const cacheKey = query.toLowerCase();
    let video = searchCache.get(cacheKey)?.video;

    if (!video || Date.now() - searchCache.get(cacheKey).time > SEARCH_TTL) {
      const search = await yts(query);
      if (!search.videos?.length) {
        await conn.sendMessage(m.chat, { text: '❌ No matching YouTube result was found.' }, { quoted: m });
        return false;
      }
      video = search.videos[0];
      searchCache.set(cacheKey, { video, time: Date.now() });
    }

    await sendProcessCard(conn, m, video);

    const id = Date.now().toString();
    let filePath;

    try {
      filePath = await downloadAudio(video.url, id);

      const ext = path.extname(filePath).slice(1).toLowerCase();
      const buffer = fs.readFileSync(filePath);
      const fileName = `${cleanFileName(video.title)}.${ext}`;

      await conn.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: mimeFor(ext),
          ptt: false
        },
        { quoted: m }
      );

      await conn.sendMessage(
        m.chat,
        {
          text:
`╭─〔 🎧 DOWNLOAD COMPLETE 〕─╮
│
│  *${video.title}*
│  📦 ${fileName}
│  ⚡ Fast audio delivery
│
╰────────────────────╯

${settings.footer}`
        },
        { quoted: m }
      );

      return true;
    } catch (error) {
      console.error('Song download failed:', error.message);
      await conn.sendMessage(
        m.chat,
        {
          text:
`╭─〔 ❌ SONG DOWNLOAD 〕─╮
│
│  Unable to download this track right now.
│  Please try another song or YouTube link.
│
╰────────────────────╯

${settings.footer}`
        },
        { quoted: m }
      );
      return false;
    } finally {
      if (filePath) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }
  }
};
