export type AvatarId = 'ollie' | 'leo' | 'stella' | 'max'
export type AvatarState = 'idle' | 'happy' | 'thinking' | 'celebrate'

export type Avatar = {
  id: AvatarId
  name: string
  emoji: string
  color: string          // primaire kleur
  colorLight: string     // lichte achtergrond
  colorDark: string      // donkere variant
  voice: string          // OpenAI TTS voice
  reactions: {
    correct: string[]
    wrong1: string[]     // eerste poging fout
    wrong2: string       // tweede poging fout (prefix voor uitleg)
    perfect: string      // alle woorden goed
    streak: string       // streak verlengd
  }
}

export const AVATARS: Record<AvatarId, Avatar> = {
  ollie: {
    id: 'ollie',
    name: 'Ollie',
    emoji: '🦉',
    color: '#F59E0B',
    colorLight: '#FEF3C7',
    colorDark: '#D97706',
    voice: 'nova',
    reactions: {
      correct: ['Whoehoe! Perfect! 🎉', 'Briljant! Dat wist je zeker!', 'Ollie is trots op jou! ⭐'],
      wrong1: ['Bijna! Probeer nog eens 💪', 'Hmm, bijna... nog één keer!', 'Je kunt het! Probeer nog eens!'],
      wrong2: 'Ollie\'s geheime truc:',
      perfect: 'Wauw, ALLES goed! Ollie danst van vreugde! 🕺',
      streak: 'Je bent op streek! Ollie klopt je op de schouder! 🔥',
    },
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    emoji: '🦁',
    color: '#EF4444',
    colorLight: '#FEE2E2',
    colorDark: '#DC2626',
    voice: 'echo',
    reactions: {
      correct: ['Brullend goed! 🦁', 'De leeuw BRULT van trots!', 'GEWELDIG! Leo is onder de indruk!'],
      wrong1: ['Bijna, held! Nog een keer!', 'De leeuw gelooft in jou! Opnieuw!', 'Kom op, jij kunt dit!'],
      wrong2: 'Leo\'s tip:',
      perfect: 'Een echte kampioen! Leo brult het uit! 🏆',
      streak: 'Dag na dag sterker! De leeuw is trots! 🔥',
    },
  },
  stella: {
    id: 'stella',
    name: 'Stella',
    emoji: '🚀',
    color: '#8B5CF6',
    colorLight: '#EDE9FE',
    colorDark: '#7C3AED',
    voice: 'shimmer',
    reactions: {
      correct: ['Lancering geslaagd! 🚀', 'Houston, we hebben een hit!', 'Uit de sterren! Perfecte landing!'],
      wrong1: ['Houston, bijna raak! Probeer nog eens!', 'De missie gaat door! Nog één poging!', 'Sterren bereik je stap voor stap!'],
      wrong2: 'Stella\'s ruimtegids:',
      perfect: 'Mission accomplished! Alle sterren behaald! 🌟',
      streak: 'Elke dag dichter bij de sterren! 🔥',
    },
  },
  max: {
    id: 'max',
    name: 'Max',
    emoji: '⚽',
    color: '#10B981',
    colorLight: '#D1FAE5',
    colorDark: '#059669',
    voice: 'fable',
    reactions: {
      correct: ['GOAAAL! 🥅⚽', 'Wat een schot! Raak!', 'De coach is trots! Top speler!'],
      wrong1: ['Goede aanval! Schiet nog eens!', 'Bijna in het doel! Nog één keer!', 'Max gelooft in je! Opnieuw!'],
      wrong2: 'Coach Max zijn tip:',
      perfect: 'Ongeslagen! Kampioen van de klas! 🏆',
      streak: 'Dag na dag trainen werkt! Topvorm! 🔥',
    },
  },
}

export const AVATAR_LIST = Object.values(AVATARS)

export function getAvatar(id: string): Avatar {
  return AVATARS[id as AvatarId] ?? AVATARS.ollie
}

export function randomReaction(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]
}
