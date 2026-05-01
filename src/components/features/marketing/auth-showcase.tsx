export function AuthShowcase() {
  return (
    <section className="relative min-h-[620px] overflow-hidden rounded-[4px] bg-(--mirai-sem-surface-muted)">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(67,73,231,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(72,225,237,0.18),transparent_45%)]" />

      <div className="absolute left-8 top-10 h-60 w-44 rotate-[-22deg] rounded-[28px] border-[6px] border-white/60 bg-gradient-to-b from-[#f5d3df] to-[#ef9ac6] shadow-[0_25px_40px_rgba(15,15,15,0.2)]" />
      <div className="absolute left-44 top-6 h-72 w-48 rotate-[7deg] rounded-[30px] border-[6px] border-white/70 bg-gradient-to-b from-[#1f8eff] to-[#1f3fd6] shadow-[0_25px_40px_rgba(15,15,15,0.26)]" />
      <div className="absolute left-72 top-20 h-64 w-48 rotate-[24deg] rounded-[30px] border-[6px] border-white/70 bg-gradient-to-b from-[#f6e9a5] to-[#d6a92d] shadow-[0_20px_35px_rgba(15,15,15,0.22)]" />

      <div className="absolute bottom-16 left-16 h-40 w-60 rotate-[-14deg] rounded-[30px] border-[6px] border-white/60 bg-gradient-to-br from-[#22272f] via-[#111216] to-[#3f4a57] shadow-[0_20px_35px_rgba(15,15,15,0.35)]" />
      <div className="absolute bottom-14 left-52 h-44 w-64 rotate-[20deg] rounded-[30px] border-[6px] border-white/60 bg-gradient-to-br from-[#5a0d15] via-[#a30f27] to-[#e83148] shadow-[0_20px_35px_rgba(15,15,15,0.35)]" />

      <div className="absolute bottom-20 left-36 h-20 w-20 rounded-full bg-gradient-to-br from-[#f8d441] via-[#f36f34] to-[#d52a6c] ring-8 ring-black/40" />
    </section>
  );
}
