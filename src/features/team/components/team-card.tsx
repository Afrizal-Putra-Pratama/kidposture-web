import Image from "next/image";
import { cn } from "@/lib/utils";

export type TeamCardProps = {
  name: string;
  role: string;
  image: string;
  description?: string;
  variant?: "light" | "blue";
};

export function TeamCard({
  name,
  role,
  image,
  description,
  variant = "light",
}: TeamCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[28px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        variant === "blue"
          ? "border-blue-700/20 bg-gradient-to-br from-blue-700 to-blue-950"
          : "border-slate-200 bg-white/90 shadow-sm"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-6 text-white">
          <p className="text-sm font-semibold text-amber-300">{role}</p>
          <h3 className="mt-1 text-2xl font-bold">{name}</h3>

          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
