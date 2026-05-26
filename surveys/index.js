/**
 * REGISTRY — Đăng ký survey mới ở đây
 * Mỗi lần thêm file config mới trong /surveys/, thêm 1 dòng import vào đây.
 */

import tiengNoiTuTam from './tieng-noi-tu-tam'
import apLucCongViec from './ap-luc-cong-viec'
// import survey mới ở đây...

const registry = [
  tiengNoiTuTam,
  apLucCongViec,
  // thêm survey mới ở đây...
]

export function getSurvey(slug) {
  return registry.find(s => s.slug === slug) || null
}

export function getAllSlugs() {
  return registry.map(s => ({ slug: s.slug }))
}

export default registry
