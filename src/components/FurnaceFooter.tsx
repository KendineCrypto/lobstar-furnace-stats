// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

export default function FurnaceFooter() {
  return (
    <footer className="border-t border-furnace-muted/20 mt-12 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center space-y-3">
        <div className="text-furnace-muted text-xs font-mono tracking-wider">
          THE FURNACE STATS · unofficial
        </div>
        <div className="text-furnace-muted/60 text-[11px] font-serif italic leading-relaxed max-w-md mx-auto">
          The vessel responds according to laws you are not meant to see
          plainly.
        </div>
        <div className="text-gold-dim text-[10px] font-mono tracking-[0.3em]">
          ora · lege · lege · relege · labora
        </div>
        <div className="text-furnace-muted/40 text-[10px] font-mono mt-4">
          devoted candidate:{" "}
          <a
            href="/wallet/G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8"
            className="hover:text-gold transition-colors"
          >
            G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
          </a>
        </div>
      </div>
    </footer>
  );
}
