export type CharacterVisibility = 'public' | 'private'

export interface CharacterFormData {
  name: string
  role: string
  summary: string
  notes: string
  isPublic: boolean
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  tagsInput: string
  imageUrlsInput: string
}
