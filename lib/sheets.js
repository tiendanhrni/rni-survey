import { google } from 'googleapis'

// ─── Auth & Client ─────────────────────────────────────────────────────────

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

async function getClient() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) throw new Error('Thiếu biến môi trường GOOGLE_SHEET_ID.')
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) throw new Error('Thiếu biến môi trường GOOGLE_SERVICE_ACCOUNT_EMAIL.')
  if (!process.env.GOOGLE_PRIVATE_KEY) throw new Error('Thiếu biến môi trường GOOGLE_PRIVATE_KEY.')
  return { sheets, spreadsheetId }
}

function wrapGoogleError(err) {
  const msg = err?.message || ''
  if (msg.includes('Requested entity was not found')) {
    throw new Error('GOOGLE_SHEET_ID không tồn tại hoặc đã bị xóa. Vào Google Sheets, copy ID từ URL và cập nhật biến môi trường GOOGLE_SHEET_ID.')
  }
  if (err?.code === 403 || msg.includes('does not have permission') || msg.toLowerCase().includes('forbidden')) {
    throw new Error('Service account chưa được cấp quyền. Hãy share Google Sheet cho ' + (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'service account email') + ' với quyền Editor.')
  }
  if (msg.includes('invalid_grant') || msg.includes('invalid_client')) {
    throw new Error('GOOGLE_PRIVATE_KEY hoặc GOOGLE_SERVICE_ACCOUNT_EMAIL không hợp lệ. Kiểm tra lại credentials trong Vercel.')
  }
  throw err
}

// ─── Tab management ────────────────────────────────────────────────────────

async function ensureSurveysTab(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId }).catch(wrapGoogleError)
  const sheetTitles = meta.data.sheets.map(s => s.properties.title)

  if (!sheetTitles.includes('surveys')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'surveys' } } }],
      },
    })
    // Write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'surveys!A1:S1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'id', 'slug', 'title', 'subtitle', 'description',
          'estimated_time', 'color_primary', 'color_light', 'color_dark',
          'questions_json', 'thankyou_message',
          'gift_enabled', 'gift_title', 'gift_description', 'gift_type', 'gift_value', 'gift_button_text',
          'created_at', 'active',
        ]],
      },
    })
  }
}

async function ensureSurveyResponseTab(sheets, spreadsheetId, slug, questions) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId }).catch(wrapGoogleError)
  const sheetTitles = meta.data.sheets.map(s => s.properties.title)

  if (!sheetTitles.includes(slug)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: slug } } }],
      },
    })
    // Write header row: STT | Thời gian | [Q labels...]
    const headers = ['STT', 'Thời gian', ...questions.map(q => q.label)]
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${slug}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    })
  }
}

// ─── Row converters ────────────────────────────────────────────────────────

// Columns: id(0) slug(1) title(2) subtitle(3) description(4)
//          estimated_time(5) color_primary(6) color_light(7) color_dark(8)
//          questions_json(9) thankyou_message(10)
//          gift_enabled(11) gift_title(12) gift_description(13) gift_type(14) gift_value(15) gift_button_text(16)
//          created_at(17) active(18)

function rowToSurvey(row, rowIndex) {
  if (!row || !row[0]) return null
  let questions = []
  try {
    questions = JSON.parse(row[9] || '[]')
  } catch {
    questions = []
  }

  return {
    id: row[0] || '',
    slug: row[1] || '',
    title: row[2] || '',
    subtitle: row[3] || 'Học viện RNI',
    description: row[4] || '',
    estimatedTime: row[5] || '',
    color: {
      primary: row[6] || '#534AB7',
      light: row[7] || '#EEEDFE',
      dark: row[8] || '#3C3489',
    },
    questions,
    thankYouMessage: row[10] || '',
    gift: {
      enabled: (row[11] || '').toString().toUpperCase() === 'TRUE',
      title: row[12] || '',
      description: row[13] || '',
      type: row[14] || 'link',
      value: row[15] || '',
      buttonText: row[16] || 'Nhận quà ngay',
    },
    createdAt: row[17] || '',
    active: (row[18] || '').toString().toUpperCase() !== 'FALSE',
    _rowIndex: rowIndex,
  }
}

function surveyToRow(survey) {
  return [
    survey.id || '',
    survey.slug || '',
    survey.title || '',
    survey.subtitle || 'Học viện RNI',
    survey.description || '',
    survey.estimatedTime || '',
    survey.color?.primary || '#534AB7',
    survey.color?.light || '#EEEDFE',
    survey.color?.dark || '#3C3489',
    JSON.stringify(survey.questions || []),
    survey.thankYouMessage || '',
    survey.gift?.enabled ? 'TRUE' : 'FALSE',
    survey.gift?.title || '',
    survey.gift?.description || '',
    survey.gift?.type || 'link',
    survey.gift?.value || '',
    survey.gift?.buttonText || 'Nhận quà ngay',
    survey.createdAt || new Date().toISOString(),
    survey.active !== false ? 'TRUE' : 'FALSE',
  ]
}

// ─── Generate light/dark from primary ─────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

function deriveColors(primary) {
  try {
    const { r, g, b } = hexToRgb(primary)
    // light: mix with white at 90%
    const lr = Math.round(r * 0.15 + 255 * 0.85)
    const lg = Math.round(g * 0.15 + 255 * 0.85)
    const lb = Math.round(b * 0.15 + 255 * 0.85)
    // dark: 80% of primary
    const dr = Math.round(r * 0.8)
    const dg = Math.round(g * 0.8)
    const db = Math.round(b * 0.8)
    const toHex = (n) => n.toString(16).padStart(2, '0')
    return {
      light: `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`,
      dark: `#${toHex(dr)}${toHex(dg)}${toHex(db)}`,
    }
  } catch {
    return { light: '#EEEDFE', dark: '#3C3489' }
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getAllSurveysRaw() {
  const { sheets, spreadsheetId } = await getClient()
  await ensureSurveysTab(sheets, spreadsheetId)

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'surveys!A2:S',
  })

  const rows = res.data.values || []
  return rows.map((row, i) => rowToSurvey(row, i + 2)).filter(Boolean)
}

export async function getActiveSurveys() {
  const all = await getAllSurveysRaw()
  return all.filter(s => s.active)
}

export async function getSurveyBySlug(slug) {
  const surveys = await getActiveSurveys()
  return surveys.find(s => s.slug === slug) || null
}

export async function getSurveyById(id) {
  const all = await getAllSurveysRaw()
  return all.find(s => s.id === id) || null
}

export async function createSurvey(data) {
  const { sheets, spreadsheetId } = await getClient()
  await ensureSurveysTab(sheets, spreadsheetId)

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const primary = data.color?.primary || '#534AB7'
  const derived = deriveColors(primary)

  const survey = {
    id,
    slug: data.slug,
    title: data.title || '',
    subtitle: data.subtitle || 'Học viện RNI',
    description: data.description || '',
    estimatedTime: data.estimatedTime || '',
    color: {
      primary,
      light: data.color?.light || derived.light,
      dark: data.color?.dark || derived.dark,
    },
    questions: data.questions || [],
    thankYouMessage: data.thankYouMessage || '',
    gift: {
      enabled: data.gift?.enabled || false,
      title: data.gift?.title || '',
      description: data.gift?.description || '',
      type: data.gift?.type || 'link',
      value: data.gift?.value || '',
      buttonText: data.gift?.buttonText || 'Nhận quà ngay',
    },
    createdAt: new Date().toISOString(),
    active: true,
  }

  const row = surveyToRow(survey)
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'surveys!A:S',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  // Create response tab for this survey
  await ensureSurveyResponseTab(sheets, spreadsheetId, survey.slug, survey.questions)

  return survey
}

export async function updateSurvey(id, data) {
  const { sheets, spreadsheetId } = await getClient()
  await ensureSurveysTab(sheets, spreadsheetId)

  const existing = await getSurveyById(id)
  if (!existing) throw new Error('Survey not found')

  const primary = data.color?.primary || existing.color.primary
  const derived = deriveColors(primary)

  const survey = {
    ...existing,
    ...data,
    id,
    color: {
      primary,
      light: data.color?.light || derived.light,
      dark: data.color?.dark || derived.dark,
    },
    gift: {
      enabled: data.gift?.enabled ?? existing.gift.enabled,
      title: data.gift?.title ?? existing.gift.title,
      description: data.gift?.description ?? existing.gift.description,
      type: data.gift?.type ?? existing.gift.type,
      value: data.gift?.value ?? existing.gift.value,
      buttonText: data.gift?.buttonText ?? existing.gift.buttonText,
    },
    active: data.active !== undefined ? data.active : existing.active,
  }

  const row = surveyToRow(survey)
  const rowIndex = existing._rowIndex

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `surveys!A${rowIndex}:S${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  // If slug changed or tab doesn't exist, ensure response tab exists
  if (survey.questions?.length > 0) {
    await ensureSurveyResponseTab(sheets, spreadsheetId, survey.slug, survey.questions)
  }

  return survey
}

export async function deleteSurvey(id) {
  const { sheets, spreadsheetId } = await getClient()
  const existing = await getSurveyById(id)
  if (!existing) throw new Error('Survey not found')

  const rowIndex = existing._rowIndex
  // Soft delete: set active = FALSE (column S = index 18, col 19)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `surveys!S${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['FALSE']] },
  })

  return true
}

export async function appendResponse(slug, questions, answers) {
  const { sheets, spreadsheetId } = await getClient()

  // Ensure tab exists (in case)
  await ensureSurveyResponseTab(sheets, spreadsheetId, slug, questions)

  // Get current row count to determine STT
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${slug}!A:A`,
  })
  const currentRows = (existing.data.values || []).length
  // currentRows includes header row (row 1), so STT = currentRows (responses count + 1)
  const stt = currentRows // header is row 1, first response is row 2, STT=1 → currentRows=1 after header → stt = 1

  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

  const dataRow = [
    stt,
    timestamp,
    ...questions.map(q => {
      const val = answers[q.id]
      if (!val && val !== 0) return ''
      if (Array.isArray(val)) return val.join(', ')
      return String(val)
    }),
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${slug}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [dataRow] },
  })

  return true
}
