/* NeuralNarrative.tsx */
export default function NeuralNarrative({ content }) {
  return (
    <section className="p-10 md:p-16 bg-[#050510] border border-white/10 relative overflow-hidden group rounded-3xl">
       <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-[#00d1b2] opacity-40 uppercase tracking-tighter">System_Decoding_Complete</div>
       <h3 className="text-[11px] font-black text-[#00d1b2] mb-10 uppercase tracking-[0.5em] flex items-center gap-3">
         <span className="w-8 h-[1px] bg-[#00d1b2]" />
         Neural_Narrative_Expansion
       </h3>
       <div className="text-gray-200 leading-relaxed font-light space-y-8 text-xl md:text-2xl italic font-serif relative z-10">
          {content ? (
            content.split('\n').map((p, i) => p && <p key={i} className="opacity-90 hover:opacity-100 transition-opacity">{p}</p>)
          ) : (
            <p className="opacity-20 italic font-sans text-sm tracking-widest uppercase animate-pulse text-center">Scanning_Bio_Data...</p>
          )}
       </div>
    </section>
  );
}