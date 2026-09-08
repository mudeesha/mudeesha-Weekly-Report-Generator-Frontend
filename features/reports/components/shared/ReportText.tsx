export function SafeNotes({ text }: { text: string }) {
  return <p className="whitespace-pre-wrap break-words text-[12px] leading-6 text-[#655e79]">{text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => /^https?:\/\//.test(part) ? <a className="break-all text-[#594dba] underline" key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</p>;
}
