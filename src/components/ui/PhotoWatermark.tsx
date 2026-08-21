import Image from "next/image";

export function PhotoWatermark({ compact = false }: { compact?: boolean }) {
  return <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" aria-hidden="true"><Image src="/images/logo.png" alt="" width={420} height={280} className={`${compact ? "w-2/3" : "w-1/2"} h-auto select-none object-contain opacity-[0.45] drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)]`} /></div>;
}
