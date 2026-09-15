"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { followAction, unfollowAction } from "@/lib/actions/follows";
import { buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";

export function FollowButton({ targetId, username, initialFollowing }: { targetId: string; username: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setDemo(false);
    const nextFollowing = !following;
    const formData = new FormData();
    formData.set("targetId", targetId);
    formData.set("username", username);
    startTransition(async () => {
      const result = await (nextFollowing ? followAction : unfollowAction)({ ok: true }, formData);
      if (result.ok) {
        setFollowing(nextFollowing);
        if (nextFollowing) ambientEngine.playPop();
        else ambientEngine.playUnpop();
        router.refresh();
      } else if (result.demo) setDemo(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={buttonVariants(following ? "secondary" : "primary", "sm")}
      >
        {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
        {following ? "Takip ediliyor" : "Takip et"}
      </button>
      {demo && <DemoNote />}
    </>
  );
}
