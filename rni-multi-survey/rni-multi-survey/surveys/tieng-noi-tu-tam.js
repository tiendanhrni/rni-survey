/**
 * HƯỚNG DẪN TẠO SURVEY MỚI:
 * 1. Copy file này
 * 2. Đặt tên file = slug URL (vd: cong-viec.js → /surveys/cong-viec)
 * 3. Sửa nội dung bên dưới
 * 4. Thêm GOOGLE_SHEET_ID_[SLUG] vào biến môi trường Vercel
 * Xong! Không cần đụng vào code khác.
 *
 * LOẠI CÂU HỎI (type):
 *   chips    → chọn nhiều (tag)
 *   radio    → chọn một
 *   scale    → thang điểm 1–5
 *   textarea → nhập tự do
 */

const config = {
  // --- Thông tin chung ---
  slug: 'tieng-noi-tu-tam',
  title: 'Khi yêu thương mà vẫn xa nhau',
  subtitle: 'Học viện RNI',
  description:
    'Chúng tôi muốn thực sự hiểu bạn đang trải qua điều gì — trước khi bắt đầu bất cứ điều gì. Không cần đăng ký, không cần cam kết. Chỉ cần vài phút thật lòng.',
  estimatedTime: '3 phút',
  thankYouMessage:
    'Mỗi dòng bạn viết sẽ được đọc kỹ và trở thành một phần trong chương trình mà Học viện RNI đang xây dựng — dành cho những người đang cần được lắng nghe.',

  // --- Màu chủ đạo (hex) ---
  // Dùng để tô màu nút, chip được chọn, thanh progress
  color: {
    primary:   '#534AB7',
    light:     '#EEEDFE',
    dark:      '#3C3489',
  },

  // --- Tên biến môi trường chứa Google Sheet ID ---
  // Thêm vào Vercel: GOOGLE_SHEET_ID_TIENG_NOI_TU_TAM=your_sheet_id
  sheetEnvKey: 'GOOGLE_SHEET_ID_TIENG_NOI_TU_TAM',

  // --- Câu hỏi ---
  questions: [
    {
      id: 'q1',
      type: 'chips',           // chọn nhiều
      required: true,
      label: 'Điều nào đang khiến bạn cảm thấy nặng lòng nhất trong các mối quan hệ hiện tại?',
      hint: 'Có thể chọn nhiều',
      options: [
        { val: 'cha-me',     label: 'Khoảng cách với cha / mẹ' },
        { val: 'con-cai',    label: 'Khó kết nối với con cái' },
        { val: 'vo-chong',   label: 'Vợ chồng ngày càng xa nhau' },
        { val: 'nguoi-than', label: 'Mâu thuẫn với anh chị em / người thân' },
        { val: 'ban-be',     label: 'Bạn bè — không ai thực sự hiểu mình' },
        { val: 'ban-than',   label: 'Xa lạ với chính mình' },
        { val: 'khac',       label: 'Điều khác' },
      ],
    },
    {
      id: 'q2',
      type: 'chips',
      required: false,
      label: 'Khi muốn nói thật lòng với người thân, bạn thường cảm thấy thế nào?',
      hint: 'Có thể chọn nhiều',
      options: [
        { val: 'so-ton-thuong', label: 'Sợ làm tổn thương họ' },
        { val: 'khong-biet-tu', label: 'Không tìm được từ ngữ phù hợp' },
        { val: 'so-hieu-lam',   label: 'Sợ bị hiểu lầm' },
        { val: 'im-lang',       label: 'Thường chọn im lặng để tránh xung đột' },
        { val: 'chon-vui',      label: 'Cảm xúc bị chôn vùi từ lâu, không biết bắt đầu từ đâu' },
        { val: 'quen-roi',      label: 'Đã quen không nói — không còn thấy cần thiết nữa' },
      ],
    },
    {
      id: 'q3',
      type: 'scale',
      required: false,
      label: 'Mức độ những điều trên đang ảnh hưởng đến cuộc sống của bạn?',
      scaleMin: 'Ít ảnh hưởng',
      scaleMax: 'Ảnh hưởng rất nhiều',
    },
    {
      id: 'q4',
      type: 'radio',           // chọn một
      required: false,
      label: 'Bạn đang ở đâu với vấn đề này?',
      options: [
        { val: 'chua-nghi',  label: 'Tôi biết có vấn đề nhưng chưa nghĩ đến việc giải quyết' },
        { val: 'muon-nhung', label: 'Tôi muốn thay đổi nhưng chưa biết bắt đầu từ đâu' },
        { val: 'san-sang',   label: 'Tôi đang thực sự sẵn sàng để làm điều gì đó khác đi' },
        { val: 'cap-thiet',  label: 'Tôi cần giải quyết điều này sớm — nó đang ảnh hưởng đến tôi mỗi ngày' },
      ],
    },
    {
      id: 'q5',
      type: 'textarea',
      required: false,
      label: 'Nếu có một điều bạn ước mình có thể nói thật lòng với ai đó — nhưng chưa bao giờ dám nói — đó là điều gì?',
      hint: 'Không bắt buộc · Ẩn danh hoàn toàn',
      placeholder: 'Viết ra đây nếu bạn muốn...',
    },
  ],
}

export default config
