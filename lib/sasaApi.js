require('dotenv').config()

const axios = require('axios')

const BASE_URL = 'https://sasa-dev-api.xyz'

function getApiKey() {
  const key = process.env.SASA_DEV_API_KEY
  if (!key) throw new Error('SASA_DEV_API_KEY is not configured')
  return key
}

async function request(endpoint, params = {}, timeout = 30000) {
  const { data } = await axios.get(`${BASE_URL}${endpoint}`, {
    params: { apikey: getApiKey(), ...params },
    timeout
  })
  return data
}

async function facebook(url, raw = false) {
  return request('/api/facebook/dl', { url, raw: String(raw) })
}

async function ytMp4(url, quality = '720', raw = false) {
  return request('/api/yt/mp4-dl', { url, quality, raw: String(raw) }, 60000)
}

async function ytMp3(url, quality = '128', raw = false) {
  return request('/api/yt/mp3-dl', { url, quality, raw: String(raw) }, 60000)
}

async function spotify(q) {
  return request('/api/spotify', { q }, 60000)
}

async function cinesubzSearch(q, page = 1) {
  return request('/api/cinesubz/search', { q, page })
}

async function cinesubzDownload(url, raw = false) {
  return request('/api/cinesubz/dl', { url, raw: String(raw) }, 60000)
}

async function waChannelReact(url, count = 1, emojis = '❤️') {
  return request('/api/wachannelreact', { url, count, emojis }, 60000)
}

module.exports = {
  facebook,
  ytMp4,
  ytMp3,
  spotify,
  cinesubzSearch,
  cinesubzDownload,
  waChannelReact
}
