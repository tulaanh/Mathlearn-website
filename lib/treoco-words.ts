/**
 * ============================================================
 *  GAME TREO CỔ TRUNG THU — Danh sách từ & bàn phím
 * ------------------------------------------------------------
 *  - Từ đoán: chủ đề Trung Thu, VIẾT HOA có dấu tiếng Việt đầy đủ
 *    để hiển thị đẹp (VD: "ĐÈN ÔNG SAO").
 *  - Đoán chữ KHÔNG phân biệt dấu: mọi chữ được chuẩn hoá về chữ cái
 *    Latin chuẩn (Ă→A, Đ→D, Ộ→O, Ự→U...). Bàn phím chỉ có 22 chữ cái
 *    tiếng Việt viết bằng chữ chuẩn (không có F, J, W, Z).
 *  - Dùng bảng map cứng để tránh pitfall Unicode NFD.
 * ============================================================
 */

export type TreocoWord = {
  key: string;
  /** Từ đoán, VIẾT HOA có dấu (VD: "ĐÈN ÔNG SAO") — chỉ để hiển thị. */
  text: string;
  /** Câu gợi ý hiển thị cho người chơi. */
  hint: string;
};

/** Bàn phím 22 chữ cái chuẩn (không dấu, không có F J W Z). */
export const VIETNAMESE_LETTERS: string[] = [
  "A", "B", "C", "D", "E", "G", "H", "I", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y",
];

/** Bảng bỏ dấu thanh (giữ nguyên dấu phụ ă â đ ê ô ơ ư và chữ thường/hoa). */
const TONE_MAP: Record<string, string> = {
  à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
  À: "A", Á: "A", Ả: "A", Ã: "A", Ạ: "A",
  ằ: "ă", ắ: "ă", ẳ: "ă", ẵ: "ă", ặ: "ă",
  Ằ: "Ă", Ắ: "Ă", Ẳ: "Ă", Ẵ: "Ă", Ặ: "Ă",
  ầ: "â", ấ: "â", ẩ: "â", ẫ: "â", ậ: "â",
  Ầ: "Â", Ấ: "Â", Ẩ: "Â", Ẫ: "Â", Ậ: "Â",
  è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
  È: "E", É: "E", Ẻ: "E", Ẽ: "E", Ẹ: "E",
  ề: "ê", ế: "ê", ể: "ê", ễ: "ê", ệ: "ê",
  Ề: "Ê", Ế: "Ê", Ể: "Ê", "Ễ": "Ê", "Ệ": "Ê",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  Ì: "I", Í: "I", Ỉ: "I", Ĩ: "I", Ị: "I",
  ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
  Ò: "O", Ó: "O", Ỏ: "O", Õ: "O", Ọ: "O",
  ồ: "ô", ố: "ô", ổ: "ô", ỗ: "ô", ộ: "ô",
  Ồ: "Ô", Ố: "Ô", Ổ: "Ô", Ỗ: "Ô", Ộ: "Ô",
  ờ: "ơ", ớ: "ơ", ở: "ơ", ỡ: "ơ", ợ: "ơ",
  Ờ: "Ơ", Ớ: "Ơ", Ở: "Ơ", Ỡ: "Ơ", Ợ: "Ơ",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  Ù: "U", Ú: "U", Ủ: "U", Ũ: "U", Ụ: "U",
  ừ: "ư", ứ: "ư", ử: "ư", ữ: "ư", ự: "ư",
  Ừ: "Ư", Ứ: "Ư", Ử: "Ư", Ữ: "Ư", Ự: "Ư",
  ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  Ỳ: "Y", Ý: "Y", Ỷ: "Y", Ỹ: "Y", Ỵ: "Y",
};

/** Bảng gộp chữ gốc có dấu phụ về chữ cái Latin chuẩn. */
const BASE_MAP: Record<string, string> = {
  ă: "a", Ă: "A",
  â: "a", Â: "A",
  đ: "d", Đ: "D",
  ê: "e", Ê: "E",
  ô: "o", Ô: "O",
  ơ: "o", Ơ: "O",
  ư: "u", Ư: "U",
};

/** Chuẩn hoá một chữ cái về chữ Latin không dấu: bỏ dấu thanh rồi gộp ăâđêôơư (HẰNG→A, ĐÈN→D, CỖ→O). */
export function chuanHoaChu(chu: string): string {
  const upper = chu.toUpperCase();
  const noTone = TONE_MAP[upper] ?? upper;
  return BASE_MAP[noTone] ?? noTone;
}

/** Danh sách 60 từ đoán chủ đề Trung Thu với gợi ý trừu tượng, thi vị và thử thách tư duy. */
export const TREOCO_WORDS: TreocoWord[] = [
  // Nhóm 1: Bánh trái & Tinh hoa ẩm thực thu
  { key: "banh-trang-trang", text: "BÁNH TRÁNG TRĂNG", hint: "Vầng sáng giòn tan ôm lấy lòng vàng bùi ngậy, nướng chín trên than hồng đất phương Nam." },
  { key: "banh-nuong", text: "BÁNH NƯỚNG", hint: "Lớp áo gốm màu hổ phách ôm trọn trăm phong vị nhân gian sau ngọn lửa tôi luyện." },
  { key: "banh-deo", text: "BÁNH DẺO", hint: "Ngọc mềm thuần khiết dệt từ giọt ngọc trời, ngậm hương hoa bưởi thoảng trong sương thu." },
  { key: "banh-pia", text: "BÁNH PÍA", hint: "Vỏ ngàn lớp mỏng manh che chở cho hương vị nồng nàn và vầng dương đỏ béo ngậy." },
  { key: "thap-cam", text: "THẬP CẨM", hint: "Bản giao hưởng hòa quyện mười phong vị trần thế: mặn, ngọt, bùi, ngậy trong một thể tròn đầy." },
  { key: "dau-xanh", text: "ĐẬU XANH", hint: "Lòng vàng dịu mát được nghiền mịn thành chất nền thanh tịnh cho ngàn thức quà thu." },
  { key: "trung-muoi", text: "TRỨNG MUỐI", hint: "Mặt trời đỏ thu nhỏ nằm ẩn mình nơi tâm điểm, tượng trưng cho phúc khí viên mãn." },
  { key: "lap-xuong", text: "LẠP XƯỞNG", hint: "Dải lụa thắm đượm vị mặn ngọt hong khô qua sương gió, điểm xuyết giữa tầng hương cổ truyền." },
  { key: "hat-sen", text: "HẠT SEN", hint: "Vị ngọt bùi ngủ say nơi đáy bùn lầy, bừng tỉnh thành ngọc quý thanh cao dâng đời." },
  { key: "sen-hong", text: "SEN HỒNG", hint: "Hồn cốt thanh khiết vươn mình giữa sương mai, đọng lại hương sắc trang nhã bậc nhất." },
  { key: "com-vong", text: "CỐM VÒNG", hint: "Hạt ngọc xanh gói trọn hương đồng gió nội và giọt sữa non dịu ngọt của mùa thu xứ Bắc." },
  { key: "tra-sen", text: "TRÀ SEN", hint: "Thức hương đạo ướp giọt sương đêm trong búp ngọc, đánh thức sự tĩnh tại của tâm hồn." },
  { key: "tra-cuc", text: "TRÀ CÚC", hint: "Dòng nước vàng óng mang dư vị đắng ngọt thanh tao, xoa dịu đi vị ngọt gắt của thế tục." },
  { key: "khuon-banh", text: "KHUƠN BÁNH", hint: "Khối mộc khắc họa trăm nét hoa văn kỳ ảo, trao hình hài kiêu sa cho tinh hoa đất trời." },

  // Nhóm 2: Lồng đèn & Ánh sáng dạ hội
  { key: "den-ong-sao", text: "ĐÈN ÔNG SAO", hint: "Ánh tinh tú năm nhánh giáng trần, rực sáng lòng bàn tay dẫn lối trẻ thơ qua đêm huyền ảo." },
  { key: "den-long", text: "ĐÈN LỒNG", hint: "Trái tim lửa ấm áp được nâng niu trong lụa mỏng, thắp sáng cả một góc trời hoài niệm." },
  { key: "den-keo-quan", text: "ĐÈN KÉO QUÂN", hint: "Ngọn nến vô tình làm xoay chuyển cả một đoàn binh mã ảo ảnh nối đuôi nhau trong bóng tối." },
  { key: "den-cu", text: "ĐÈN CÙ", hint: "Bánh xe sắc màu xoay tròn dưới gót chân rộn rã, càng vội vã lại càng bừng sáng rực rỡ." },
  { key: "den-ca-chep", text: "ĐÈN CÁ CHÉP", hint: "Linh vật giấy mang khát vọng vượt ngọn sóng vũ môn, bơi lội giữa dòng sông ánh sáng trần gian." },
  { key: "den-to-ong", text: "ĐÈN TỔ ONG", hint: "Tác phẩm giấy xếp kỳ diệu bung nở như tổ mật ngậm ngàn tia sáng khi được kéo dài đôi đầu." },
  { key: "den-hoa-dang", text: "ĐÈN HOA ĐĂNG", hint: "Cánh sen lửa trôi lững lờ trên dòng nước biếc, chở theo ước nguyện bình an xuôi về cõi vô tận." },

  // Nhóm 3: Thần thoại, Cung trăng & Cõi mơ
  { key: "chu-cuoi", text: "CHÚ CUỘI", hint: "Kẻ lỡ nắm lấy rễ thiêng để rồi ngàn năm làm bạn cùng bóng tịch mịch nơi thăm thẳm trời cao." },
  { key: "cung-trang", text: "CUNG TRĂNG", hint: "Lâu đài ngọc ngà lơ lửng giữa vô tận, nơi cất giữ những giấc mơ xa xôi chưa bao giờ chạm tới." },
  { key: "quang-han-cung", text: "QUẢNG HÀN CUNG", hint: "Cung thất lạnh giá chìm trong màn sương khói của cõi tiên giới, vĩnh viễn cách biệt nhân gian." },
  { key: "chi-hang", text: "CHỊ HẰNG", hint: "Bóng hồng vĩnh cửu mang nỗi u hoài nghìn thu, tỏa ánh sáng dịu mát chở che muôn loài." },
  { key: "nguyet-nga", text: "NGUYỆT NGA", hint: "Mỹ danh thi vị của vị tiên nữ mang sắc đẹp băng thanh ngọc khiết ngự chốn tầng mây." },
  { key: "tho-ngoc", text: "THỎ NGỌC", hint: "Sinh linh trắng muốt miệt mài giã thuốc trường sinh trong chiếc cối ngọc nơi cõi vắng." },
  { key: "ngoc-tho", text: "NGỌC THỎ", hint: "Hiện thân của tuyết trắng thuần khiết trong thần thoại, biểu tượng bất tử ngự bên vầng dạ quang." },
  { key: "cay-da", text: "CÂY ĐA", hint: "Cội rễ cổ xưa vươn giữa hai bờ thực ảo, chứng nhân nghìn năm của nỗi cô đơn giữa thiên hà." },
  { key: "hau-nghe", text: "HẬU NGHỆ", hint: "Tay cung huyền thoại bắn rụng chín vầng dương nhưng bất lực nhìn người thương bay về chốn xa xăm." },
  { key: "bong-que", text: "BÓNG QUẾ", hint: "Vết mờ ảo diệu thoang thoảng hương thơm huyền tích in sâu vào tâm khảm kẻ si tình." },

  // Nhóm 4: Thiên văn, Mùa trăng & Thời khắc
  { key: "mat-trang", text: "MẶT TRĂNG", hint: "Tấm gương khổng lồ của vũ trụ phản chiếu trọn vẹn những ước vọng viên mãn nơi trần thế." },
  { key: "trang-ram", text: "TRĂNG RẰM", hint: "Thời khắc đỉnh cao của ánh sáng dạ hành, khi sự vẹn toàn đạt đến độ tuyệt đối giữa chu kỳ thời gian." },
  { key: "trung-thu", text: "TRUNG THU", hint: "Thời điểm phân đôi mùa vàng rực rỡ, khi đất trời giao hòa và lòng người hướng về nguồn cội." },
  { key: "thang-tam", text: "THÁNG TÁM", hint: "Khoảng thời gian giao mùa kỳ diệu mang số thứ tự tám, mở lối cho ngàn vì sao hội tụ trần gian." },
  { key: "vong-nguyet", text: "VỌNG NGUYỆT", hint: "Tâm thế ngẩng đầu đối thoại cùng hư không, gởi gắm nỗi niềm tri kỷ vào vầng sáng vô ngôn." },
  { key: "trang-thu", text: "TRĂNG THU", hint: "Bảo vật tuyệt mỹ nhất năm, vừa trong vắt không tì vết vừa u uẩn như giọt sương rơi chốn tiêu dao." },
  { key: "nguyet-quang", text: "NGUYỆT QUANG", hint: "Thứ ánh sáng không thiêu đốt nhưng đủ sức xua tan bóng lạnh trong lòng kẻ viễn xứ." },
  { key: "ngan-ha", text: "NGÂN HÀ", hint: "Dải lụa bạc lung linh vắt ngang bầu trời đêm, phân chia đôi bờ thương nhớ trong huyền tích." },
  { key: "hac-nguyet", text: "HẠC NGUYỆT", hint: "Cánh chim thanh tao sải bóng dưới dạ quang, biểu tượng cho phong thái tiêu dao thoát tục." },

  // Nhóm 5: Không khí lễ hội, Vũ điệu & Âm thanh
  { key: "mua-lan", text: "MÚA LÂN", hint: "Linh thú giáng thế giữa hồi sấm giòn giã, mở ra vũ điệu trừ tà rước cát tường." },
  { key: "mua-rong", text: "MÚA RỒNG", hint: "Thần thú uốn lượn như dòng chảy sinh khí cuồn cuộn, kết nối linh khí đất trời bằng uy vũ." },
  { key: "su-tu", text: "SƯ TỬ", hint: "Dáng hình dũng mãnh khoác lớp giáp hoa rực rỡ, gieo rắc niềm vui và xua tan ám khí." },
  { key: "song-lan", text: "SONG LÂN", hint: "Cặp linh vật hòa nhịp âm dương đối xứng, mang điềm lành và phước lộc nhân đôi tới muôn nhà." },
  { key: "ong-dia", text: "ÔNG ĐỊA", hint: "Nụ cười tròn đầy phúc hậu phe phẩy quạt mo, hiện thân của đất mẹ bao dung hòa nhã." },
  { key: "le-hoi", text: "LỄ HỘI", hint: "Khoảng không gian nhiệm màu xóa nhòa biên giới thời gian, nơi cộng đồng sẻ chia niềm hân hoan." },
  { key: "tieng-trong", text: "TIẾNG TRỐNG", hint: "Nhịp tim rộn rã thúc giục bước chân trần gian, đánh thức bóng đêm bằng thanh âm hào sảng." },
  { key: "trong-quan", text: "TRỐNG QUÂN", hint: "Sợi dây mây căng trên hố đất ngân vang câu đối đáp ân tình của lứa đôi dưới bóng trăng thanh." },
  { key: "mat-na", text: "MẶT NẠ", hint: "Tấm màn biến ảo che chở thân phận thực, mở cánh cửa bước vào thế giới thần tiên diệu kỳ." },
  { key: "dan-ong", text: "DÀN ỐNG", hint: "Chuỗi tiếng nổ tí tách rộn rã của đồ chơi dân gian, vang lên tiếng cười hồn nhiên một thời thơ ấu." },

  // Nhóm 6: Phong tục, Ý nghĩa & Triết lý nhân sinh
  { key: "pha-co", text: "PHÁ CỖ", hint: "Nghi lễ chia sẻ lộc trời khi vầng dạ quang lên tới đỉnh trời cao nhất, đánh dấu khoảnh khắc sum vầy." },
  { key: "doan-vien", text: "ĐOÀN VIÊN", hint: "Vòng tròn vô hình khép lại muôn dặm cách trở, gom góp mọi bước chân phiêu bạt về chung một mái nhà." },
  { key: "cho-buoi", text: "CHÓ BƯỞI", hint: "Linh vật hiền lành kết từ hàng trăm múi tép trắng muốt, lặng lẽ canh giữ mâm cỗ đêm rằm." },
  { key: "mam-ngu-qua", text: "MÂM NGŨ QUẢ", hint: "Năm sắc thái hài hòa tượng trưng cho ngũ hành trời đất, dâng trọn lòng biết ơn và nguyện ước bình an." },
  { key: "hoa-cuc", text: "HOA CÚC", hint: "Loài hoa gom trọn sắc vàng rực của nắng hạ để kiêu hãnh bừng nở giữa tiết sương hàn." },
  { key: "da-yen", text: "DẠ YẾN", hint: "Bữa tiệc thanh nhã hội tụ tri âm dưới trời sao, nơi thi họa và tâm tình hòa vào chén trà thơm." },
  { key: "phuc-loc", text: "PHÚC LỘC", hint: "Ước vọng nghìn đời về cuộc sống tròn đầy, được khắc trang trọng lên mỗi khuôn bánh dâng người." },
  { key: "tu-quy", text: "TỨ QUÝ", hint: "Bốn giai điệu luân chuyển của đất trời, tượng trưng cho sự thịnh vượng vững bền cùng tuế nguyệt." },
  { key: "vien-man", text: "VIÊN MÃN", hint: "Trạng thái trọn vẹn tuyệt đối khi trăng tròn, lòng người an yên và tình thân không còn khoảng cách." },
  { key: "tich-xua", text: "TÍCH XƯA", hint: "Dòng chảy truyền kỳ ngàn năm được thì thầm bên bàn trà, nuôi dưỡng tâm hồn qua bao mùa trăng sáng." },
];

/** Tìm từ theo key (undefined nếu key không còn trong danh sách). */
export function getTreocoWord(key: string): TreocoWord | undefined {
  return TREOCO_WORDS.find((w) => w.key === key);
}

/** Chọn ngẫu nhiên một từ, tránh trùng từ hiện tại nếu có thể. */
export function randomTreocoWordKey(excludeKey?: string): string {
  const pool = TREOCO_WORDS.filter((w) => w.key !== excludeKey);
  const list = pool.length ? pool : TREOCO_WORDS;
  return list[Math.floor(Math.random() * list.length)].key;
}

/** Chữ đã đoán đúng có nằm trong từ hay không (so khớp bỏ dấu thanh). */
export function letterInWord(word: string, letter: string): boolean {
  const normalizedLetter = chuanHoaChu(letter);
  return [...word].some((c) => c !== " " && chuanHoaChu(c) === normalizedLetter);
}

/** Từ đã được đoán hết chưa (mọi chữ cái đã nằm trong revealedLetters). */
export function isWordComplete(word: string, revealedLetters: string[]): boolean {
  const revealed = new Set(revealedLetters.map(chuanHoaChu));
  return [...word].every((c) => c === " " || revealed.has(chuanHoaChu(c)));
}
