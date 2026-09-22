import React from 'react';
import { Smartphone, X, Check, Globe, AlertCircle, Apple } from 'lucide-react';

interface InstallAppModalProps {
  onClose: () => void;
  onTriggerInstall?: () => void;
  canDirectInstall?: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  onClose,
  onTriggerInstall,
  canDirectInstall,
}) => {
  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instalace aplikace do mobilu</h3>
              <p className="text-[11px] text-slate-400">StageMaster Pro jako plnohodnotná offline PWA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If browser supports direct install prompt right now */}
        {canDirectInstall && onTriggerInstall && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 space-y-2">
            <span className="text-xs font-bold text-emerald-300 block">Váš prohlížeč je připraven:</span>
            <button
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Spustit okamžitou instalaci</span>
            </button>
          </div>
        )}

        {/* Warning if on non-localhost HTTP */}
        {!isHttps && (
          <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-amber-300">Proč prohlížeč hlásí „Nelze nainstalovat“?</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Google Chrome a moderní telefony <b>z bezpečnostních důvodů zakazují instalaci PWA</b>, pokud je stránka otevřena přes nezabezpečenou lokální IP adresu (např. <code>http://192.168.x.x</code>).
              </p>
            </div>
          </div>
        )}

        {/* Instructions by Platform */}
        <div className="space-y-3 text-xs">
          {/* iOS Safari instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Apple className="w-4 h-4 text-slate-300" />
              <span>Apple iPhone / iPad (Safari):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Otevřete stránku v prohlížeči <b>Safari</b>.</li>
              <li>Klepněte dole uprostřed na tlačítko <b>Sdílet</b> (čtvereček se šipkou nahoru ⎋).</li>
              <li>Sjeďte níže v nabídce a zvolte <b>„Přidat na plochu“</b> (Add to Home Screen).</li>
              <li>Klepněte na <b>Přidat</b> vpravo nahoře. Aplikace se objeví na ploše!</li>
            </ol>
          </div>

          {/* Android Chrome instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android (Google Chrome):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Otevřete zabezpečenou trvalou verzi s <b>HTTPS</b> (odkaz níže).</li>
              <li>Klepněte na <b>tři tečky ⋮</b> vpravo nahoře v Chrome.</li>
              <li>Zvolte <b>„Nainstalovat aplikaci“</b> (nebo „Přidat na plochu“).</li>
              <li>Potvrďte tlačítkem <b>Instalovat</b>.</li>
            </ol>
          </div>

          {/* GitHub Pages permanent HTTPS URL */}
          <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <Globe className="w-4 h-4" />
              <span>Trvalá HTTPS stránka na GitHub Pages:</span>
            </div>
            <a
              href="https://janmaslan.github.io/stagemaster/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-indigo-400 hover:text-indigo-200 underline block break-all"
            >
              https://janmaslan.github.io/stagemaster/
            </a>
            <span className="text-[10px] text-slate-400 block">
              Zde je plné HTTPS šifrování, které telefony vyžadují pro bezproblémovou instalaci.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
        >
          Rozumím, zavřít
        </button>
      </div>
    </div>
  );
};
