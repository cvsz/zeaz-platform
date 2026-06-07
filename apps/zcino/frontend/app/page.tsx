import Link from "next/link";

import { GameLobby } from "@/components/games/game-lobby";
import { Button } from "@/components/ui/button";
import { getGames } from "@/lib/games-data";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const initialResponse = getGames({});

  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Zcino Meta</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Enterprise control plane for network operations, games, tasks, and governance.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Production Next.js frontend with live metrics streaming, force-directed topology, explorer views,
            OAuth/wallet access, design-system primitives, and deployment-ready infrastructure.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard"><Button>Open dashboard</Button></Link>
            <Link href="/explorer"><Button variant="secondary">Explore chain</Button></Link>
            <a href="/legacy/index.php"><Button className="bg-[#00e701] text-black hover:bg-[#00c501]">Legacy Casino & Wallets</Button></a>
          </div>
        </div>
      </header>

      <GameLobby initialResponse={initialResponse} />
    </div>
  );
}
