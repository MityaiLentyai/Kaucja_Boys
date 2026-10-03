import { Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="h1">Kaucja Boys In The House</div>
        <div className="flex flex-row justify-self-center">
          <Link
            href="/login"
            className="bg-blend-lighten"
            style={{ border: "1px solid white", padding: "5px" }}
          >
            login link
          </Link>
        </div>
      </main>
    </div>
  );
}
