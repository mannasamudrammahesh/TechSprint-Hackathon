import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <Link 
      href="/Home"
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors duration-200 ease-in-out shadow-sm"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </Link>
  );
} 