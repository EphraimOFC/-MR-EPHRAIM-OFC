const ytSearch = require('yt-search');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { chaminduDownload } = require('../lib/media');
const settings = require('../settings');

const tmpDir = path.join(__dirname, '../tmp');

function findTool(name) {
  const exe = process.platform === 'win32' ? name + '.exe' : name;
  const wingetPath = process.platform === 'win32'
    ? path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', exe)
    : '';
  return wingetPath && fs.existsSync(wingetPath) ? wingetPath : exe;
}

function cleanFileName(name) {
  return String(name || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'video';
}

function sendProcessCard(sock, m, video, quality) {
  const caption =
`╭─〔 🎬 E TECH VIDEO 〕─╮
│
│  🎥 *${video.title}*
│  ⏱️ ${video.timestamp || 'Unknown'}
│  🎞️ Quality: *${quality}p*
│
│  ⚡ Preparing your video...
│
╰────────────────────╯

${settings.footer}`;
  return sock.sendMessage(
    m.chat,
    { image: { url: video.thumbnail }, caption },
    { quoted: m }
  );
}

function downloadFallback(url, quality, id) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const output = path.join(tmpDir, `video-${id}.%(ext)s`);
    const args = [
      '--no-playlist',
      '-f', `best[height<=${quality}][ext=mp4]/best[height<=${quality}]/best`,
      '--concurrent-fragments', '4',
      '--retries', '1',
      '--fragment-retries', '1',
      '--socket-timeout', '15',
      '--no-warnings',
      '--quiet',
      '-o', output,
      url
    ];

    execFile(findTool('yt-dlp'), args, {
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024
    }, (error) => {
      if (error) return reject(error);

      const file = fs.readdirSync(tmpDir)
        .find(name => name.startsWith(`video-${id}.`));

      if (!file) return reject(new Error('No video file was produced.'));
      resolve(path.join(tmpDir, file));
    });
  });
}

module.exports = {
  name: 'video',
  alias: ['ytvideo', 'ytmp4'],

  async execute(sock, m, args) {
    if (!args.length) {
      return sock.sendMessage(
        m.chat,
        {
          text:
`🎬 *E TECH VIDEO*

Usage:
*.video <title or YouTube link> [quality]*

Quality: 144 / 240 / 360 / 480 / 720 / 1080
Example: *.video Calm Down 720*

${settings.footer}`
        },
        { quoted: m }
      );
    }

    let quality = '720';
    const last = String(args[args.length - 1] || '');
    if (/^(144|240|360|480|720|1080)$/.test(last)) {
      quality = last;
      args.pop();
    }

    const query = args.join(' ').trim();
    let url = query;
    let video;

    if (!/^https?:\/\//i.test(query)) {
      const search = await ytSearch(query);
      if (!search.videos?.length) {
        return sock.sendMessage(m.chat, { text: '❌ No matching YouTube video was found.' }, { quoted: m });
      }
      video = search.videos[0];
      url = video.url;
    } else {
      const search = await ytSearch(query);
      video = search.videos?.[0] || {
        title: 'YouTube Video',
        timestamp: 'Unknown',
        thumbnail: 'https://i.ytimg.com/vi/0/default.jpg'
      };
    }

    await sendProcessCard(sock, m, video, quality);

    const id = Date.now().toString();
    let filePath = null;

    try {
      // Fast path: use the media API when it accepts the request.
      try {
        const media = await chaminduDownload('ytmp4', url, quality);
        await sock.sendMessage(
          m.chat,
          {
            video: media.buffer,
            mimetype: media.mimetype || 'video/mp4',
            caption:
`🎬 *${video.title}*
\n\n📺 Quality: *${quality}p*
⚡ Delivered by E TECH OFC
\n\n${settings.footer}`
          },
          { quoted: m }
        );
        return true;
      } catch (apiError) {
        console.log('Chamindu video API unavailable, using yt-dlp: ' + apiError.message);
      }

      filePath = await downloadFallback(url, quality, id);
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();

      await sock.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype: ext === 'webm' ? 'video/webm' : 'video/mp4',
          caption:
`🎬 *${video.title}*
\n\n📺 Quality: *${quality}p*
⚡ Fast local fallback
\n\n${settings.footer}`
        },
        { quoted: m }
      );

      return true;
    } catch (error) {
      console.error('Video download failed:', error.message);
      await sock.sendMessage(
        m.chat,
        {
          text:
`╭─〔 ❌ VIDEO DOWNLOAD 〕─╮
│
│  Unable to download this video right now.
│  Try a lower quality or another YouTube link.
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
