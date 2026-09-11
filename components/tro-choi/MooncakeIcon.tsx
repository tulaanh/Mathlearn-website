"use client";

import Image from "next/image";

export const MOONCAKE_SVG_MAP: Record<string, string> = {
  thap_cam_xa_xiu: "/tro-choi/mooncakes/thap-cam-xa-xiu.svg",
  dau_xanh_hat_dua: "/tro-choi/mooncakes/dau-xanh-hat-dua.svg",
  sua_dua_soi_non: "/tro-choi/mooncakes/sua-dua-soi-non.svg",
  com_non_dua_deo: "/tro-choi/mooncakes/com-non-dua-deo.svg",
  mochi_khoai_mon: "/tro-choi/mooncakes/mochi-khoai-mon.svg",
  lava_trung_chay: "/tro-choi/mooncakes/lava-trung-chay.svg",
};

export const MOONCAKE_NAME_MAP: Record<string, string> = {
  thap_cam_xa_xiu: "Bánh Thập Cẩm Xá Xíu Trứng Muối",
  dau_xanh_hat_dua: "Bánh Đậu Xanh Hạt Dưa Trứng Muối",
  sua_dua_soi_non: "Bánh Sữa Dừa Sợi Non",
  com_non_dua_deo: "Bánh Cốm Non Dừa Dẻo",
  mochi_khoai_mon: "Bánh Mochi Khoai Môn Trứng Muối",
  lava_trung_chay: "Bánh Lava Trứng Chảy Hoàng Kim",
};

export function getMooncakeSrc(cakeId?: string | null): string {
  if (!cakeId) return "/tro-choi/mooncakes/thap-cam-xa-xiu.svg";
  return MOONCAKE_SVG_MAP[cakeId] ?? "/tro-choi/mooncakes/thap-cam-xa-xiu.svg";
}

type Props = {
  cakeId?: string | null;
  className?: string;
  size?: number;
  alt?: string;
};

export default function MooncakeIcon({ cakeId, className = "h-12 w-12", size = 48, alt }: Props) {
  const src = getMooncakeSrc(cakeId);
  const fallbackAlt = (cakeId && MOONCAKE_NAME_MAP[cakeId]) || "Bánh Trung Thu";

  return (
    <img
      src={src}
      alt={alt || fallbackAlt}
      width={size}
      height={size}
      className={`inline-block select-none object-contain drop-shadow-md transition-transform hover:scale-110 ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
