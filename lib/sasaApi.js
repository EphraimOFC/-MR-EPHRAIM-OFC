require('dotenv').config()

const axios = require('axios')

const BASE_URL = 'https://sasa-dev-api.xyz'

function getApiKey() {
  const key = process.env.SASA_DEV_API_KEY
  if (!key) throw new Error('SASA_DEV_API_KEY is not configured')
  return key
}

async function facebook(url, raw = false) {
  const { data } = await axios.get(`${BASE_URL}/api/facebook/dl`, {
    params: { apikey: getApiKey(), url, raw: String(raw) },
    timeout: 30000
  })
  return data
}

module.exports = { facebook }
