import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#c1ff72' }}>
      <main className="flex flex-1 flex-col items-center justify-center w-full">
        {/* Centered Logo */}
        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/nutro.png"
            alt="Nutro Logo"
            width={300}
            height={300}
            priority
            className="object-contain"
          />
        </div>
      </main>
    </div>
  );
}
