export default function AsciiArt() {
  return (
    <div className="relative">
      <pre className="font-mono text-terminal-text-light dark:text-terminal-text-dark leading-none select-none text-[10px] sm:text-xs md:text-sm">
{`
████████╗ ██╗ ██████╗  ██████╗ ██╗  ██╗
╚══██╔══╝ ██║ ██╔══██╗██╔═══██╗██║ ██╔╝
   ██║    ██║ ██████╔╝██║   ██║█████╔╝
   ██║    ██║ ██╔══██╗██║   ██║██╔═██╗
   ██║    ██║ ██║  ██║╚██████╔╝██║  ██╗
   ╚═╝    ╚═╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
`}
      </pre>
    </div>
  );
}
