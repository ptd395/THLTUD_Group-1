# Functional Specification

## Dự án
`NovaTech AI Support Copilot`

## Phiên bản tài liệu
`v1.0`

## Ngày cập nhật
`2026-03-13`

## 1. Mục đích tài liệu
Tài liệu này mô tả đặc tả chức năng cho 2 nhóm chức năng chính của hệ thống NovaTech:

1. `Chatbot / Voicebot`
2. `Sentiment Escalation`

Mục tiêu của hệ thống là hỗ trợ đội ngũ CSKH tiếp nhận hội thoại đa ngôn ngữ, xác định nhu cầu hỗ trợ, đánh giá cảm xúc khách hàng theo thời gian thực và đưa ra cảnh báo chuyển tuyến khi hội thoại có dấu hiệu tiêu cực.

## 2. Phạm vi
Phạm vi của tài liệu bao gồm:

- Giao diện chat hỗ trợ khách hàng.
- Luồng voice demo để mô phỏng voicebot.
- Phân loại nhu cầu hỗ trợ theo nhãn dịch vụ.
- Phân tích sentiment cho từng lượt hội thoại.
- Luật escalation dựa trên ngưỡng sentiment và chuỗi hội thoại tiêu cực.
- Cấu hình ngưỡng đánh giá và dashboard theo dõi kết quả.

Ngoài phạm vi của bản MVP hiện tại:

- Tích hợp ASR/TTS production.
- Mô hình NLP/LLM production-grade.
- Phân quyền nhiều vai trò vận hành.
- Tự động tạo ticket trên hệ thống CRM bên thứ ba.

## 3. Đối tượng sử dụng

- `Khách hàng`: nhập nội dung chat hoặc giọng nói để nhận hỗ trợ.
- `Nhân viên CSKH`: theo dõi trạng thái escalation và tiếp nhận ca khi cần chuyển tuyến.
- `Quản trị viên / Reviewer`: điều chỉnh cấu hình sentiment, theo dõi KPI trên dashboard.

## 4. Tổng quan chức năng

### 4.1. Chatbot / Voicebot
Hệ thống cung cấp giao diện hội thoại để khách hàng nhập nội dung bằng văn bản hoặc dùng voice demo. Hệ thống sẽ nhận diện ngôn ngữ, phân loại nhóm nhu cầu, phản hồi theo kịch bản và mở form thông tin đơn hàng khi phù hợp.

### 4.2. Sentiment Escalation
Hệ thống chấm điểm cảm xúc cho từng lượt hội thoại, theo dõi xu hướng cảm xúc, tính toán negative streak, đánh giá điều kiện escalation và hiển thị cảnh báo hỗ trợ chuyển tuyến cho nhân viên.

## 5. Danh sách nhãn dịch vụ

Các nhãn nghiệp vụ hiện tại:

- `1`: Tra cứu đơn hàng
- `2`: Đổi trả / Hoàn tiền / Hủy đơn
- `3`: Bảo hành
- `4`: Giá / Thông tin sản phẩm
- `5`: Lỗi kỹ thuật
- `6`: Gặp nhân viên

## 6. Đặc tả chức năng chi tiết

## 6.1. Chức năng 1: Chatbot / Voicebot

| ID | Tên chức năng | Mô tả |
| --- | --- | --- |
| `FR-CB-01` | Khởi tạo phiên hội thoại | Hệ thống cho phép người dùng mở màn hình demo chat và bắt đầu một phiên hội thoại mới. |
| `FR-CB-02` | Chọn chế độ ngôn ngữ | Người dùng có thể chọn `Auto`, `Vietnamese`, `English`. Nếu chọn `Auto`, hệ thống tự phát hiện ngôn ngữ từ nội dung nhập. |
| `FR-CB-03` | Gửi tin nhắn văn bản | Người dùng nhập nội dung chat và gửi bằng nút gửi hoặc phím `Enter`. |
| `FR-CB-04` | Nhận diện ngôn ngữ | Hệ thống xác định ngôn ngữ `vi/en` để phục vụ phân loại và phản hồi đúng ngôn ngữ. |
| `FR-CB-05` | Phân loại nhu cầu hỗ trợ | Hệ thống phân loại nội dung vào 1 trong 6 nhãn dịch vụ. |
| `FR-CB-06` | Xử lý trường hợp chưa rõ nhu cầu | Nếu nội dung chưa đủ rõ, hệ thống hiển thị menu clarification để người dùng chọn đúng loại hỗ trợ. |
| `FR-CB-07` | Phản hồi theo kịch bản | Hệ thống sinh phản hồi bot dựa trên ngôn ngữ, nhãn dịch vụ và ngữ cảnh hội thoại. |
| `FR-CB-08` | Mở popup thông tin đơn hàng | Với các trường hợp cần tra cứu hoặc xác minh, hệ thống mở popup thông tin đơn hàng dùng chung cho nhiều nhãn dịch vụ. |
| `FR-CB-09` | Tiếp nhận thông tin đơn hàng | Người dùng có thể nhập `Order ID`, `Email` hoặc `Phone`. Hệ thống yêu cầu tối thiểu 1 trường hợp lệ. |
| `FR-CB-10` | Hiển thị chi tiết đơn hàng | Sau khi tra cứu thành công, hệ thống hiển thị mã đơn, trạng thái, ETA, tổng giá trị, danh sách sản phẩm và timeline xử lý. |
| `FR-CB-11` | Tóm tắt kết quả vào chat | Sau khi popup trả về dữ liệu đơn hàng, hệ thống bổ sung một tin nhắn tóm tắt vào luồng hội thoại. |
| `FR-CB-12` | Voice input trong chat | Người dùng có thể mở voice modal, ghi âm hoặc lấy transcript để đổ vào ô chat. |
| `FR-CB-13` | Voice demo harness | Hệ thống cho phép bấm `Start Recording` / `Stop Recording`, sinh transcript mẫu và hiển thị độ trễ ASR/LLM/TTS. |
| `FR-CB-14` | Hỗ trợ song ngữ | Bot response, nhãn hỗ trợ và popup order info phải hiển thị phù hợp với ngôn ngữ `vi/en`. |
| `FR-CB-15` | Trạng thái tải | Trong khi bot xử lý, hệ thống khóa thao tác gửi lặp và hiển thị trạng thái loading. |

### 6.1.1. Luồng chính Chatbot

1. Người dùng mở màn hình `Demo Chat`.
2. Người dùng nhập nội dung hoặc dùng voice input.
3. Hệ thống phát hiện ngôn ngữ.
4. Hệ thống phân loại nhãn dịch vụ.
5. Nếu chưa rõ nhu cầu, hệ thống hiển thị menu clarification.
6. Nếu xác định được nhu cầu, hệ thống trả lời bot và có thể mở popup thông tin đơn hàng.
7. Người dùng nhập thông tin tra cứu.
8. Hệ thống trả về chi tiết đơn hàng.
9. Hệ thống tiếp tục hội thoại hoặc chuyển sang quy trình escalation nếu điều kiện phù hợp.

### 6.1.2. Luồng ngoại lệ Chatbot

- Nếu người dùng gửi tin nhắn rỗng, hệ thống không thực hiện gửi.
- Nếu popup thông tin đơn hàng không có dữ liệu đầu vào, hệ thống cảnh báo yêu cầu nhập ít nhất một trường.
- Nếu người dùng từ chối quyền microphone, hệ thống hiển thị cảnh báo không thể truy cập mic.

## 6.2. Chức năng 2: Sentiment Escalation

| ID | Tên chức năng | Mô tả |
| --- | --- | --- |
| `FR-SE-01` | Phân tích sentiment theo lượt | Mỗi lượt hội thoại của người dùng phải được chấm `label`, `score`, `confidence`. |
| `FR-SE-02` | Hiển thị current sentiment | Hệ thống hiển thị sentiment hiện tại dưới dạng badge, score số và thanh gauge từ negative đến positive. |
| `FR-SE-03` | Hiển thị trend sentiment | Hệ thống hiển thị biểu đồ xu hướng sentiment theo từng turn hội thoại. |
| `FR-SE-04` | Tính chỉ số tổng hợp | Hệ thống tính `avg sentiment`, `negative rate`, `volatility` từ lịch sử hội thoại. |
| `FR-SE-05` | Theo dõi negative streak | Hệ thống đếm số turn tiêu cực liên tiếp để phục vụ điều kiện escalation. |
| `FR-SE-06` | Đánh giá escalation threshold | Nếu score hiện tại thấp hơn `escalationThreshold`, hệ thống phải bật cảnh báo escalation. |
| `FR-SE-07` | Đánh giá consecutive negative turns | Nếu số lượt tiêu cực liên tiếp đạt ngưỡng cấu hình, hệ thống phải bật cảnh báo escalation. |
| `FR-SE-08` | Bật/tắt trigger | Người dùng quản trị có thể bật/tắt các trigger gồm escalation, negative streak, volatility alert trong màn hình settings. |
| `FR-SE-09` | Cấu hình threshold | Người dùng quản trị có thể thay đổi `negativeThreshold`, `escalationThreshold`, `consecutiveNegativeCount`. |
| `FR-SE-10` | Lưu cấu hình runtime | Cấu hình sentiment được lưu ở client storage để duy trì giữa các lần truy cập. |
| `FR-SE-11` | Ghi log metrics event | Hệ thống ghi lại event cho dashboard gồm session, channel, language, label, sentiment, escalation và latency. |
| `FR-SE-12` | Tổng hợp dashboard | Dashboard hiển thị KPI, chart và bảng dữ liệu từ metrics event đã ghi nhận. |
| `FR-SE-13` | Fallback khi không có dữ liệu | Nếu database hoặc dữ liệu chưa sẵn sàng, dashboard vẫn render với trạng thái an toàn hoặc dữ liệu fallback. |

### 6.2.1. Luật nghiệp vụ escalation

- `BR-SE-01`: Nếu `sentimentScore < escalationThreshold` thì `escalationSuggested = true`.
- `BR-SE-02`: Nếu số lượt liên tiếp có `sentimentScore < negativeThreshold` lớn hơn hoặc bằng `consecutiveNegativeCount` thì `escalationSuggested = true`.
- `BR-SE-03`: Nếu trigger escalation bị tắt trong settings thì hệ thống không bật gợi ý escalation.
- `BR-SE-04`: Nếu escalation được gợi ý, giao diện phải hiển thị trạng thái cảnh báo rõ ràng trong panel sentiment.
- `BR-SE-05`: Label `6 - Gặp nhân viên` được xem là một tín hiệu chuyển tuyến trực tiếp về nghiệp vụ.

### 6.2.2. Chỉ số cần theo dõi trên dashboard

- Tổng số cuộc hội thoại.
- Thời gian xử lý trung bình.
- Tỷ lệ resolution.
- CSAT score.
- First response time.
- Số lượng SLA breaches.
- Conversation volume theo thời gian.
- Tỷ lệ trạng thái Open / Pending / Resolved.
- Phân bố theo kênh.
- Top issues / intents.
- Top agents.
- Recent SLA breaches.

## 7. Màn hình liên quan

| Màn hình | Route | Vai trò |
| --- | --- | --- |
| `Home` | `/` | Trang giới thiệu giải pháp NovaTech |
| `Demo Chat` | `/demo` | Thực hiện chatbot/voicebot demo và sentiment analysis |
| `Settings` | `/settings/sentiment` | Cấu hình threshold, trigger, metric selection, preview |
| `Dashboard` | `/dashboard` | Theo dõi KPI, chart và dữ liệu escalation |

## 8. Dữ liệu đầu vào và đầu ra

### 8.1. Input chính

- Nội dung chat text.
- Transcript giọng nói.
- Lựa chọn ngôn ngữ.
- Thông tin đơn hàng: `Order ID`, `Email`, `Phone`.
- Cấu hình sentiment thresholds/triggers.

### 8.2. Output chính

- Bot response.
- Nhãn dịch vụ.
- Sentiment label / score / confidence.
- Trạng thái escalation.
- Thông tin đơn hàng.
- Dashboard KPI và biểu đồ.

## 9. Yêu cầu phi chức năng

- Ứng dụng phải hoạt động tốt trên desktop và mobile.
- Các màn hình chính phải có loading state và empty state.
- Không được phát sinh lỗi hook runtime khi chuyển route hoặc đổi filter dashboard.
- Hệ thống phải hỗ trợ song ngữ `vi/en`.
- Các cấu hình sentiment phải được lưu và nạp lại đúng khi refresh trang.
- Nếu backend metrics chưa sẵn sàng, ứng dụng vẫn phải hiển thị giao diện an toàn.

## 10. Giả định

- Voicebot ở bản hiện tại là `demo harness`, chưa phải voicebot production.
- Sentiment analysis hiện dùng logic rule-based / mock scoring.
- Order information hiện là dữ liệu mô phỏng để phục vụ demo nghiệp vụ.
- Escalation hiện là trạng thái gợi ý trên giao diện, chưa tự động đồng bộ sang hệ thống ticket bên ngoài.

## 11. Điều kiện nghiệm thu

- Người dùng có thể chat bằng tiếng Việt hoặc tiếng Anh và nhận phản hồi tương ứng.
- Hệ thống phân loại được ít nhất 6 nhóm nhu cầu hỗ trợ.
- Menu clarification xuất hiện khi nhu cầu chưa rõ.
- Popup order info dùng chung được cho nhiều label và hiển thị được màn hình chi tiết đơn hàng.
- Voice demo ghi nhận được transcript mẫu và hiển thị latency breakdown.
- Sentiment panel hiển thị score, gauge, trend chart và escalation status.
- Settings thay đổi được threshold/trigger và lưu thành công.
- Dashboard hiển thị đầy đủ KPI, chart và bảng dữ liệu mà không lỗi runtime.

## 12. Đề xuất mở rộng giai đoạn tiếp theo

- Tích hợp ASR/TTS thực tế cho voicebot.
- Thay rule-based classifier bằng LLM / intent model.
- Đồng bộ escalation sang CRM / helpdesk.
- Thêm lịch sử phiên hội thoại và báo cáo theo agent/team.
- Bổ sung role-based access control cho admin và supervisor.
