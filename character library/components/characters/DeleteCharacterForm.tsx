'use client'

import { useState } from 'react'
import { deleteCharacterAction } from '@/app/(protected)/characters/actions'

interface DeleteCharacterFormProps {
  characterId: string
}

export function DeleteCharacterForm({ characterId }: DeleteCharacterFormProps) {
  const [pending, setPending] = useState(false)

  return (
    <form
      action={deleteCharacterAction}
      onSubmit={(event) => {
        if (!window.confirm('Delete this character? This cannot be undone.')) {
          event.preventDefault()
          return
        }

        setPending(true)
      }}
    >
      <input type="hidden" name="character_id" value={characterId} />
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Deleting...' : 'Delete Character'}
      </button>
    </form>
  )
}
