# Quy tắc file JSON tài liệu

Tài liệu này mô tả cấu trúc file JSON dùng để **nhập/xuất tài liệu** trong website. Đây là quy tắc định dạng JSON, không phải quy tắc chấm điểm.

> Xem thêm **Phần 8** ở cuối tài liệu: định dạng JSON riêng cho **Ngân hàng câu hỏi**.
>
> Xem thêm **QUY-TAC-LATEX.md**: quy tắc viết công thức Toán (`$...$`, `$$...$$`) và import file `.tex`.

## 1. Cấu trúc cấp cao

File phải là một **object JSON**, không phải một mảng. Các trường chính:

```json
{
  "version": 1,
  "title": "Tên tài liệu",
  "description": "Mô tả tài liệu",
  "grade": "Lớp 8",
  "status": "draft",
  "documentType": "normal",
  "topicIds": ["ham-so-va-do-thi"],
  "blocks": []
}
```

| Trường | Kiểu | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `version` | number | Không | Phiên bản định dạng; bản hiện tại là `1`. Khi xuất JSON, hệ thống luôn ghi `1`. |
| `title` | string | Có | Không được rỗng, tối đa 200 ký tự. |
| `description` | string | Không | Mô tả tùy chọn. Nếu thiếu, dùng chuỗi rỗng. |
| `grade` | string | Không | Nếu thiếu hoặc rỗng, mặc định là `Lớp 8`. |
| `status` | string | Không | Chỉ `draft` hoặc `published`; giá trị khác được chuyển thành `draft`. |
| `documentType` | string | Không | Chỉ `normal` hoặc `test`; giá trị khác được chuyển thành `normal`. |
| `topicIds` | array | Không | Chỉ giữ lại các mã chủ đề hợp lệ. |
| `blocks` | array | Có | Phải có ít nhất một khối nội dung hợp lệ. |

Các trường không được liệt kê có thể bị bỏ qua khi nhập. JSON phải dùng dấu ngoặc kép cho tên trường và chuỗi.

## 2. Các mã chủ đề hợp lệ

`topicIds` là mảng chuỗi. Website hiện hỗ trợ các mã:

```text
ham-so-va-do-thi
mu-va-logarit
dao-ham
nguyen-ham-va-tich-phan
luong-giac
day-so-va-gioi-han
hinh-hoc-khong-gian
vector-va-he-toa-do
xac-suat-va-thong-ke
```

Mã không hợp lệ sẽ bị bỏ qua, không làm file JSON bị lỗi.

## 3. Các khối nội dung (`blocks`)

Mỗi phần tử trong `blocks` phải là object và có trường `type`. Có 4 loại khối.

### 3.1. Khối văn bản

```json
{
  "type": "text",
  "content": "Nội dung văn bản, có thể dùng $LaTeX$."
}
```

`content` bắt buộc là chuỗi không rỗng. Khối thiếu nội dung hoặc chỉ có khoảng trắng sẽ bị báo lỗi.

### 3.2. Khối hình ảnh

```json
{
  "type": "image",
  "altText": "Mô tả hình ảnh",
  "caption": "Chú thích hình ảnh",
  "fileName": "hinh.png",
  "dataUrl": "data:image/png;base64,..."
}
```

- `altText`: tùy chọn; nếu thiếu dùng `Hình ảnh tài liệu Toán`.
- `caption`: tùy chọn.
- `fileName`: tên file dùng khi chuyển `dataUrl` thành file.
- `dataUrl`: tùy chọn; chỉ nhận ảnh JPEG, PNG hoặc WebP dạng base64 và tối đa 5 MB.
- `storagePath`: tùy chọn; đường dẫn ảnh đã có trên Supabase Storage.

Khi nhập, thứ tự ưu tiên là `dataUrl > storagePath > placeholder`. Nếu không có `dataUrl` hoặc `storagePath`, hệ thống tạo placeholder để người dùng chọn ảnh sau.

Khi xuất, ảnh mới không quá 512 KB có thể được nhúng thành `dataUrl`. Ảnh lớn hơn chỉ giữ tên file; ảnh đã có trên Storage giữ `storagePath`.

### 3.3. Khối bài giảng

```json
{
  "type": "lesson",
  "title": "Cách giải phương trình",
  "description": "Mô tả ngắn",
  "content": "Nội dung bài giảng, có thể dùng $LaTeX$."
}
```

- `title` bắt buộc và không được rỗng.
- `content` bắt buộc và không được rỗng.
- `description` tùy chọn.

### 3.4. Khối câu hỏi

```json
{
  "type": "quiz",
  "title": "Bài kiểm tra",
  "description": "Hướng dẫn làm bài",
  "questions": []
}
```

- `title` bắt buộc và không được rỗng.
- `description` tùy chọn.
- `questions` bắt buộc là mảng có ít nhất một câu hỏi hợp lệ.

## 4. Câu hỏi trong khối `quiz`

Mỗi câu hỏi phải có `text` là chuỗi không rỗng. Nếu bỏ qua `type`, hệ thống mặc định là `multiple_choice`.

Các loại `type` được hỗ trợ:

```text
multiple_choice
true_false
short_answer
essay
```

### 4.1. Trắc nghiệm (`multiple_choice`)

```json
{
  "type": "multiple_choice",
  "text": "Kết quả của 2 + 2 là gì?",
  "options": ["3", "4", "5", "6"],
  "correctIndex": 1,
  "points": 1,
  "explanation": "2 + 2 = 4."
}
```

- `options` là mảng chuỗi, cần ít nhất 2 đáp án không rỗng.
- Khi nhập, tối đa 6 đáp án được giữ lại.
- `correctIndex` là chỉ số bắt đầu từ `0`; `0` là đáp án đầu tiên.
- Nếu `correctIndex` không hợp lệ, hệ thống dùng `0`.
- `points` và `explanation` là tùy chọn.

### 4.2. Đúng/Sai (`true_false`)

```json
{
  "type": "true_false",
  "text": "Xác định tính đúng sai của các mệnh đề.",
  "statements": [
    { "text": "Mệnh đề 1", "correct": true },
    { "text": "Mệnh đề 2", "correct": false }
  ],
  "points": 1,
  "trueFalsePoints": [0, 0.1, 1]
}
```

- `statements` là mảng các object.
- Mỗi mệnh đề cần `text` và `correct` (`true` hoặc `false`).
- Các mệnh đề không có nội dung sẽ bị loại bỏ.
- Có thể dùng `options` thay cho `statements` để tương thích dữ liệu cũ.
- `points`, `trueFalsePoints` và `explanation` là tùy chọn.
- Nếu có `trueFalsePoints`, mảng phải có đúng `số mệnh đề + 1` phần tử: phần tử thứ `i` là điểm khi có `i` mệnh đề đúng, phần tử cuối là điểm tối đa và phải bằng `points`.
- Với 4 mệnh đề, bảng mặc định là `[0, 0.1, 0.25, 0.5, 1]` khi `points` bằng `1`. Nếu tự khai báo `points` khác `1`, nên tự khai báo các giá trị `trueFalsePoints` tương ứng.
- `trueFalsePoints` được lưu và xuất cùng dữ liệu câu hỏi.

### 4.3. Trả lời ngắn (`short_answer`)

```json
{
  "type": "short_answer",
  "text": "Thủ đô của Việt Nam là gì?",
  "correctAnswer": "Hà Nội",
  "points": 1,
  "explanation": "Đáp án là Hà Nội."
}
```

- `correctAnswer` là đáp án đúng dạng chuỗi.
- Có thể dùng tên cũ `correct_answer` khi nhập.
- `points` và `explanation` là tùy chọn.

### 4.4. Tự luận (`essay`)

```json
{
  "type": "essay",
  "text": "Hãy trình bày cách giải bài toán.",
  "points": 0,
  "explanation": "Gợi ý trình bày."
}
```

- Chỉ cần `text`.
- `explanation` là tùy chọn.
- Câu tự luận không được chấm tự động.

### 4.5. Trường điểm dùng trong JSON

- `points` là số điểm tối đa của câu hỏi. Nếu thiếu, không hợp lệ hoặc không dương, khi nhập hệ thống dùng `1`.
- Với câu `essay`, hệ thống luôn xuất và nạp `points: 0`.
- `trueFalsePoints` là mảng các số không âm. Các giá trị không phải số hoặc âm sẽ bị loại khi nhập.
- Dữ liệu câu hỏi cũ không có `points` vẫn được hỗ trợ nhờ giá trị mặc định `1`.

### 4.6. Hình ảnh câu hỏi và hình ảnh lời giải

Mỗi câu hỏi có thể kèm theo hình ảnh ở phần đề bài và/hoặc phần lời giải:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `imageStoragePath` | string | Đường dẫn ảnh đề bài đã lưu trên Storage. |
| `imageCaption` | string | Chú thích cho ảnh đề bài. |
| `explanationImageStoragePath` | string | Đường dẫn ảnh lời giải / sơ đồ giải thích trên Storage. |
| `explanationImageCaption` | string | Chú thích cho ảnh lời giải. |

## 5. Quy tắc nhập và xuất

### Nhập JSON

1. Chọn file `.json` hoặc dán nội dung JSON vào công cụ nhập.
2. JSON phải hợp lệ về cú pháp.
3. Hệ thống kiểm tra các trường bắt buộc và báo lỗi theo số khối/câu hỏi.
4. Dữ liệu hợp lệ được chuyển thành trạng thái trình soạn thảo.
5. Ảnh dạng `dataUrl` sẽ được chuyển thành file để có thể lưu lên Storage.

### Xuất JSON

JSON xuất ra được định dạng đẹp với 2 khoảng trắng, gồm:

- `version`, `title`, `description`, `grade`, `status`.
- `documentType`, `topicIds`.
- Các `blocks` hợp lệ.
- Các câu hỏi có nội dung.
- Ảnh nhỏ có thể được nhúng bằng `dataUrl`.

Các nội dung rỗng sẽ không được xuất, ví dụ khối text rỗng, câu hỏi không có nội dung hoặc khối quiz không có câu hỏi hợp lệ.

## 6. Mẫu file JSON hoàn chỉnh

```json
{
  "version": 1,
  "title": "Tài liệu Toán lớp 8",
  "description": "Tài liệu mẫu",
  "grade": "Lớp 8",
  "status": "draft",
  "documentType": "test",
  "topicIds": ["ham-so-va-do-thi"],
  "blocks": [
    {
      "type": "text",
      "content": "Ôn tập phương trình bậc nhất: $ax + b = 0$."
    },
    {
      "type": "lesson",
      "title": "Cách giải",
      "content": "Chuyển vế và chia hai vế cho hệ số của ẩn."
    },
    {
      "type": "quiz",
      "title": "Kiểm tra nhanh",
      "questions": [
        {
          "type": "multiple_choice",
          "text": "Nghiệm của x + 2 = 5 là gì?",
          "options": ["1", "2", "3", "4"],
          "correctIndex": 2,
          "points": 1
        },
        {
          "type": "true_false",
          "text": "Xác định tính đúng sai.",
          "statements": [
            { "text": "0 là số nguyên.", "correct": true },
            { "text": "1/2 là số nguyên.", "correct": false }
          ],
          "points": 1,
          "trueFalsePoints": [0, 0.1, 1]
        },
        {
          "type": "short_answer",
          "text": "Nhập nghiệm của x - 4 = 0.",
          "correctAnswer": "4",
          "points": 1
        }
      ]
    }
  ]
}
```

## 7. Hằng số định dạng

Phiên bản định dạng hiện tại được khai báo trong mã nguồn là:

```text
DOCUMENT_JSON_VERSION = 1
```

Khi định dạng JSON thay đổi trong tương lai, cần tăng phiên bản và cập nhật tài liệu này.

## 8. Định dạng JSON ngân hàng câu hỏi

Ngân hàng câu hỏi (`/quan-ly/ngan-hang-cau-hoi`) có định dạng nhập/xuất riêng:

```json
{
  "version": 1,
  "kind": "question_bank",
  "questions": [
    {
      "text": "Nội dung câu hỏi, có thể dùng $LaTeX$.",
      "type": "multiple_choice",
      "difficulty": "nhan_biet",
      "grade": "Lớp 12",
      "topicIds": ["ham-so-va-do-thi"],
      "imageFileName": "lt_1.png",
      "options": ["3", "4", "5", "6"],
      "correctIndex": 1,
      "points": 1,
      "explanation": "Giải thích (tùy chọn).",
      "explanationImageFileName": "lt_2.png"
    }
  ]
}
```

| Trường | Quy tắc |
|---|---|
| `version` | Hiện tại là `1` (hằng số `QUESTION_BANK_JSON_VERSION`). |
| `questions` | Mảng câu hỏi; cũng chấp nhận mảng thuần `[ ... ]` không bọc object. |
| `text`, `type`, `options`, `correctIndex`, `statements`, `correctAnswer`, `points`, `trueFalsePoints`, `explanation` | Giống quy tắc câu hỏi trong khối `quiz` ở Phần 4. |
| `difficulty` | Một trong: `nhan_biet`, `thong_hieu`, `van_dung`, `van_dung_cao`. Nếu thiếu hoặc không hợp lệ, mặc định `nhan_biet`; tên tiếng Việt ("Nhận biết", "Vận dụng cao"...) cũng được nhận diện. |
| `grade` | Khối lớp dạng chuỗi; nếu thiếu dùng `Lớp 8`. |
| `topicIds` | Chỉ giữ lại mã chủ đề hợp lệ (xem Phần 2). |
| `imageFileName` / `imageSourceName` | *(Tùy chọn)* Tên file ảnh minh họa đề bài (`lt_1.png`) để tải lên cùng lúc khi nhập JSON. |
| `explanationImageFileName` / `explanationImageSourceName` | *(Tùy chọn)* Tên file ảnh minh họa lời giải (`lt_2.png`) để tải lên cùng lúc khi nhập JSON. |
| `explanationImages` | *(Tùy chọn)* Mảng danh sách nhiều file ảnh lời giải `[ "lt_2.png", "lt_3.png" ]`. |

Khi nhập, câu bị lỗi sẽ bị bỏ qua và hệ thống báo rõ từng lỗi theo số thứ tự; các câu hợp lệ vẫn được thêm vào ngân hàng.

