import Link from 'next/link'
import { createCharacterAction } from '@/app/(protected)/characters/actions'

export default function NewCharacterPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Character</h1>
          <Link
            href="/characters"
            className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
          >
            Back to Library
          </Link>
        </div>

        <form action={createCharacterAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <input
                id="role"
                name="role"
                placeholder="Mage, Rogue, Leader..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input id="is_public" name="is_public" type="checkbox" defaultChecked className="h-4 w-4" />
            <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
              Public character
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Core Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['strength', 'Strength'],
                ['dexterity', 'Dexterity'],
                ['constitution', 'Constitution'],
                ['intelligence', 'Intelligence'],
                ['wisdom', 'Wisdom'],
                ['charisma', 'Charisma'],
              ].map(([name, label]) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    min={1}
                    max={30}
                    defaultValue={10}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="hero, arcane, stealth"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="image_urls" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              id="image_urls"
              name="image_urls"
              rows={4}
              placeholder="https://example.com/portrait.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Create Character
            </button>
            <Link
              href="/characters"
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md font-medium text-gray-900 dark:text-white transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
