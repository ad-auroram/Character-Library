'use client';

/**
 * SVG icons and constants used across the app
 */

/**
 * Default user avatar SVG component (fallback when no image available)
 */
export function AvatarFallbackSVG() {
  return (
    <svg
      className="h-full w-full text-gray-400 p-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/**
 * Data URI for broken avatar images (fallback in img onError)
 */
export const BROKEN_IMAGE_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22%23D1D5DB%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E';