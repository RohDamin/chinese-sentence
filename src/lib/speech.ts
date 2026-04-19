/** Web Speech API로 한자 문장을 중국어 음성으로 읽습니다. */
export function speakChinese(text: string): void {
  const trimmed = text.trim()
  if (!trimmed || typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const run = () => {
    const u = new SpeechSynthesisUtterance(trimmed)
    u.lang = 'zh-CN'
    const voices = window.speechSynthesis.getVoices()
    const voice =
      voices.find((v) => v.lang === 'zh-CN') ||
      voices.find((v) => v.lang.startsWith('zh')) ||
      voices.find((v) => /Chinese|中文|Mandarin/i.test(v.name))
    if (voice) u.voice = voice
    u.rate = 0.92
    window.speechSynthesis.speak(u)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    run()
    return
  }

  const onVoices = () => {
    window.speechSynthesis.removeEventListener('voiceschanged', onVoices)
    run()
  }
  window.speechSynthesis.addEventListener('voiceschanged', onVoices)
}
