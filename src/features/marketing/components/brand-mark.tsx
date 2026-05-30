import Image from "next/image";
import { brand } from "../data";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        alt=""
        aria-hidden="true"
        className="size-10 rounded-md"
        height={40}
        src={brand.logo}
        width={40}
      />
      {compact ? null : (
        <div>
          <p className="font-black text-base leading-none">{brand.name}</p>
          <p className="mt-1 text-muted-foreground text-xs">{brand.tagline}</p>
        </div>
      )}
    </div>
  );
}
