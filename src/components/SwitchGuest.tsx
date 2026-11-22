"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions";

export function SwitchGuest({ name }: { name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="min-h-11 text-sm font-semibold text-smoke underline underline-offset-4"
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.replace("/");
          router.refresh();
        })
      }
    >
      Not {name}? Switch
    </button>
  );
}
