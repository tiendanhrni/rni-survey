import { google } from 'googleapis'

export async function appendToSheet(sheetEnvKey, questions, answers) {
  const sheetId = process.env[sheetEnvKey]
  if (!sheetId) throw new Error(`Missing env: ${sheetEnvKey}`)

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })

  // Build header row từ labels câu hỏi (chỉ ghi 1 lần nếu sheet trống)
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

  // Build data row theo thứ tự câu hỏi
  const row = [timestamp, ...questions.map(q => {
    const val = answers[q.id]
    if (!val) return ''
    if (Array.isArray(val)) return val.join(', ')
    return String(val)
  })]

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  return true
}
