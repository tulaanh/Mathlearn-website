import { deflateRawSync } from "node:zlib";

export type ZipEntry = {
  name: string;
  data: Uint8Array;
};

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { date: number; time: number } {
  return {
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

function u16(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt16LE(value & 0xffff, 0);
  return buffer;
}

function u32(value: number): Buffer {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value >>> 0, 0);
  return buffer;
}

/** Tạo ZIP UTF-8 nhỏ gọn mà không cần thêm dependency runtime. */
export function createZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const now = dosDateTime(new Date());

  for (const entry of entries) {
    const name = Buffer.from(entry.name.replaceAll("\\", "/"), "utf8");
    const source = Buffer.from(entry.data);
    const compressed = deflateRawSync(source, { level: 6 });
    const checksum = crc32(source);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x800), u16(8), u16(now.time), u16(now.date),
      u32(checksum), u32(compressed.length), u32(source.length), u16(name.length), u16(0), name, compressed,
    ]);
    localParts.push(local);

    centralParts.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x800), u16(8), u16(now.time), u16(now.date),
      u32(checksum), u32(compressed.length), u32(source.length), u16(name.length), u16(0), u16(0), u16(0),
      u16(0), u32(0), u32(offset), name,
    ]));
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralDirectory.length), u32(offset), u16(0),
  ]);
  return Buffer.concat([...localParts, centralDirectory, end]);
}
