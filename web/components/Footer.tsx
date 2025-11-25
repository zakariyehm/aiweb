import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/terms" className="hover:text-gray-900 hover:underline transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 hover:underline transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-gray-900 hover:underline transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

