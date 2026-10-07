const yts = require('yt-search');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const settings = require('../settings');
const { sendInteractive, quickReply } = require('../ui');

const tmpDir = path.join(__dirname, '../tmp');
const searchCache = new Map();
const pendingSongs = new Map();
const PREFETCH_TTL = 10 * 60 * 1000;
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

async function sendChoiceCard(conn, m, video) {
  const body =
`╭─〔 🎵 E TECH SONG 〕─╮
│
│ 🎧 *${video.title}*
│ ⏱️ ${video.timestamp || 'Unknown'}
│ 🎤 ${video.author?.name || 'YouTube'}
│
│ ⚡ Choose your download format
│
╰────────────────────╯`;

  try {
    await sendInteractive(conn, m, {
      title: 'E TECH OFC • SONG',
      body,
      image: video.thumbnail,
      footer: settings.footer,
      buttons: [
        quickReply('🎧 AUDIO', 'etech_song_audio'),
        quickReply('📄 DOCUMENT', 'etech_song_document')
      ]
    });
    return true;
  } catch (error) {
    console.log('Song interactive UI failed:', error.message);
    await conn.sendMessage(
      m.chat,
      {
        image: { url: video.thumbnail },
        caption: body + '\n\nReply with *AUDIO* or *DOCUMENT*.\n\n' + settings.footer
      },
      { quoted: m }
    );
    return false;
  }
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

async function resolveVideo(query) {
  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.time < SEARCH_TTL) return cached.video;

  const search = await yts(query);
  if (!search.videos?.length) return null;

  const video = search.videos[0];
  searchCache.set(cacheKey, { video, time: Date.now() });
  return video;
}

module.exports = {
  name: 'song',
  alias: ['play', 'music', 's'],

  async execute(m, { conn, text, args }) {
    const action = String(args[0] || '').toLowerCase();
    const isChoice = action === 'etech_song_audio' || action === 'etech_song_document';
    let entry = pendingSongs.get(m.chat);
    let query;
    let video;

    if (isChoice && entry) {
      query = entry.query;
      video = entry.video;
    } else {
      query = String(text || args.join(' ')).trim();
      if (!query) {
        await conn.sendMessage(m.chat, { text: '🎵 *E TECH SONG*\n\nUse: *.song <song title or YouTube link>*\nExample: *.song Burna Boy - Last Last*' }, { quoted: m });
        return false;
      }
      video = await resolveVideo(query);
      if (!video) {
        await conn.sendMessage(m.chat, { text: '❌ No matching YouTube result was found.' }, { quoted: m });
        return false;
      }
    }

    if (!isChoice) {
      const id = Date.now().toString();
      const downloadPromise = downloadAudio(video.url, id);
      entry = { query, video, id, promise: downloadPromise, created: Date.now() };
      pendingSongs.set(m.chat, entry);
      downloadPromise.catch(() => {});
      entry.timer = setTimeout(() => {
        const current = pendingSongs.get(m.chat);
        if (current?.id !== id) return;
        pendingSongs.delete(m.chat);
        downloadPromise.then(file => { try { if (file && fs.existsSync(file)) fs.unlinkSync(file); } catch {} }).catch(() => {});
      }, PREFETCH_TTL);

      const shown = await sendChoiceCard(conn, m, video);
      return shown;
    }

    if (!entry) {
      await conn.sendMessage(m.chat, { text: '⌛ Song selection expired. Please run *.song <title>* again.' }, { quoted: m });
      return false;
    }

    const isDocument = action === 'etech_song_document';
    let filePath = null;
    try {
      filePath = await entry.promise;
      if (!filePath || !fs.existsSync(filePath)) throw new Error('Prefetched audio is no longer available.');
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const buffer = fs.readFileSync(filePath);
      const fileName = `${cleanFileName(video.title)}.${ext}`;

      if (isDocument) {
        await conn.sendMessage(m.chat, { document: buffer, fileName, mimetype: mimeFor(ext), caption: `🎵 *${video.title}*` }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { audio: buffer, mimetype: mimeFor(ext), ptt: false }, { quoted: m });
      }
      pendingSongs.delete(m.chat);
      if (entry.timer) clearTimeout(entry.timer);
      return true;
    } catch (error) {
      console.error('Song download failed:', error.message);
      pendingSongs.delete(m.chat);
      if (entry.timer) clearTimeout(entry.timer);
      await conn.sendMessage(m.chat, { text: '╭─〔 ❌ SONG DOWNLOAD 〕─╮\n│ Unable to prepare this track.\n│ Please run *.song* again and choose a format.\n╰────────────────────╯\n\n' + settings.footer }, { quoted: m });
      return false;
    } finally {
      if (filePath) { try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {} }
    }
  }
};