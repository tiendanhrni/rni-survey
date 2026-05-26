/**
 * SURVEY MẪU #2 — Về áp lực công việc
 * URL: /surveys/ap-luc-cong-viec
 * Biến môi trường cần thêm: GOOGLE_SHEET_ID_AP_LUC_CONG_VIEC
 */

const config = {
  slug: 'ap-luc-cong-viec',
  title: 'Bạn đang mang bao nhiêu thứ một mình?',
  subtitle: 'Học viện RNI',
  description:
    'Không phải ai cũng nói được rằng mình đang kiệt sức. Chia sẻ với chúng tôi — ẩn danh, không phán xét.',
  estimatedTime: '2 phút',
  thankYouMessage:
    'Cảm ơn bạn đã chia sẻ. Mỗi câu trả lời giúp chúng tôi hiểu rõ hơn điều bạn thực sự cần.',

  color: {
    primary:   '#0F6E56',
    light:     '#E1F5EE',
    dark:      '#085041',
  },

  sheetEnvKey: 'GOOGLE_SHEET_ID_AP_LUC_CONG_VIEC',

  questions: [
    {
      id: 'q1',
      type: 'chips',
      required: true,
      label: 'Điều nào đang khiến bạn mệt mỏi nhất trong công việc hiện tại?',
      hint: 'Có thể chọn nhiều',
      options: [
        { val: 'qua-tai',      label: 'Quá tải, không có thời gian nghỉ' },
        { val: 'vo-nghia',     label: 'Cảm thấy công việc vô nghĩa' },
        { val: 'khong-duoc-ghi-nhan', label: 'Cố gắng nhưng không được ghi nhận' },
        { val: 'moi-truong',   label: 'Môi trường độc hại, nhiều áp lực từ người khác' },
        { val: 'tuong-lai',    label: 'Không biết mình đang đi về đâu' },
        { val: 'khong-can-bang', label: 'Mất cân bằng công việc — cuộc sống' },
        { val: 'khac',         label: 'Điều khác' },
      ],
    },
    {
      id: 'q2',
      type: 'radio',
      required: false,
      label: 'Bạn thường làm gì khi cảm thấy kiệt sức?',
      options: [
        { val: 'co-lai',    label: 'Co lại, không nói với ai' },
        { val: 'lam-them',  label: 'Lao vào làm thêm để quên đi' },
        { val: 'giai-tri',  label: 'Tìm cách giải trí tạm thời' },
        { val: 'chia-se',   label: 'Chia sẻ với người thân hoặc bạn bè' },
        { val: 'khong-biet','label': 'Không biết phải làm gì' },
      ],
    },
    {
      id: 'q3',
      type: 'scale',
      required: false,
      label: 'Mức độ áp lực công việc đang ảnh hưởng đến sức khoẻ tinh thần của bạn?',
      scaleMin: 'Gần như không',
      scaleMax: 'Rất nghiêm trọng',
    },
    {
      id: 'q4',
      type: 'textarea',
      required: false,
      label: 'Nếu được nói một câu với sếp / đồng nghiệp mà không sợ hậu quả — bạn sẽ nói gì?',
      hint: 'Không bắt buộc · Ẩn danh hoàn toàn',
      placeholder: 'Viết ra đây...',
    },
  ],
}

export default config
