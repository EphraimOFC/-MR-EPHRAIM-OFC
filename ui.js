const { generateWAMessageFromContent, prepareWAMessageMedia, proto, isJidGroup } = require('@whiskeysockets/baileys');
const fs = require('fs');

function quickReply(display_text, id){
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text, id })
  };
}

async function sendInteractive(conn, m, { title, body, image, buttons = [], footer = '⚡ Powered by E TECH OFC™' }) {
  const imageContent = image && fs.existsSync(image) ? { image: fs.readFileSync(image) } : { image: { url: image } };
  const media = image ? await prepareWAMessageMedia(
    imageContent,
    { upload: conn.waUploadToServer }
  ) : null;

  const header = proto.Message.InteractiveMessage.Header.create({
    title: title || 'E TECH OFC',
    hasMediaAttachment: !!media,
    ...(media || {})
  });

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header,
    body: proto.Message.InteractiveMessage.Body.create({ text: body || '' }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
      buttons,
      messageParamsJson: '{}',
      messageVersion: 1
    })
  });

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage
        }
      }
    },
    { quoted: m, userJid: conn.user?.id }
  );

  const bizNode = {
    tag: 'biz',
    attrs: {
      actual_actors: '2',
      host_storage: '2',
      privacy_mode_ts: String(Math.floor(Date.now() / 1000) - 77980457)
    },
    content: [{
      tag: 'interactive',
      attrs: { type: 'native_flow', v: '1' },
      content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
    }, {
      tag: 'quality_control',
      attrs: { source_type: 'third_party' }
    }]
  };

  const additionalNodes = isJidGroup(m.chat)
    ? [bizNode]
    : [{ tag: 'bot', attrs: { biz_bot: '1' } }, bizNode];

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id,
    additionalNodes
  });
}

module.exports = { quickReply, sendInteractive };
