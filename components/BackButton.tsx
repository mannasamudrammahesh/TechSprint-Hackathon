"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center justify-center bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 h-9 w-9 p-0 md:h-10 md:w-auto md:px-4 md:gap-2"
    >
      <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
      <span className="hidden md:inline text-sm">Back</span>
    </Button>
  );
}

export function StickyBackButton() {
  const router = useRouter();

  return (
    <div className="sticky top-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center justify-center bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 shadow-md hover:shadow-lg h-9 w-9 p-0 md:h-10 md:w-auto md:px-4 md:gap-2"
      >
        <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
        <span className="hidden md:inline text-sm">Back</span>
      </Button>
    </div>
  );
}
