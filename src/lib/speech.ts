/**
 * Text-to-speech pronunciation of Pokémon names via the Web Speech API.
 * No dependency required — uses the browser's built-in voices.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Speak a Pokémon's display name out loud (e.g. "mr-mime" → "mr mime") */
export function speakPokemonName(name: string): boolean {
  if (!isSpeechSupported()) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(name.replace(/-/g, ' '))
  utter.rate = 0.95
  utter.pitch = 1
  const voices = synth.getVoices()
  const english =
    voices.find((v) => v.lang?.toLowerCase().startsWith('en') && v.default) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('en'))
  if (english) utter.voice = english
  synth.speak(utter)
  return true
}

/** Stop any in-progress pronunciation (dialog close / step to next dossier) */
export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* speech API unavailable — nothing to stop */
  }
}
