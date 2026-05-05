import { Send, ExternalLink, Crown, Sparkles, TrendingDown, Globe2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const Didmena = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Didmena – Prioritetiniai pasiūlymai automobilių prekiautojams | Autokopers</title>
        <meta name="description" content="Uždara didmenos platforma ir Telegram kanalas automobilių prekiautojams. Prioritetiniai pasiūlymai iš mūsų partnerių visoje Europoje." />
        <link rel="canonical" href="https://www.autokopers.lt/didmena" />
      </Helmet>
      <Header />
      <main>
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#1a1207] via-[#2d1d0a] to-[#1a1207]">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[120px]" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(251,191,36,0.8) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-5 py-2 rounded-full text-xs font-bold mb-6 uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                <Crown className="h-4 w-4" />
                Didmena · Premium
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent leading-tight">
                Prioritetiniai pasiūlymai.<br />Tiesiai iš mūsų partnerių.
              </h1>

              <p className="text-lg md:text-xl text-amber-100/80 mb-4 max-w-2xl mx-auto leading-relaxed">
                Mūsų <strong className="text-amber-300">uždara didmenos platforma</strong> ir Telegram kanalas yra
                vieta, kur automobilių prekiautojai ir VIP klientai pirmieji gauna
                geriausius pasiūlymus dar prieš jiems pasiekiant viešą rinką.
              </p>
              <p className="text-base md:text-lg text-amber-100/60 mb-10 max-w-2xl mx-auto">
                Tūkstančiai patikrintų automobilių iš mūsų partnerių. Kasdieniai švieži pasiūlymai.
                Konkurencingiausios kainos rinkoje.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <TrendingDown className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Didmeninės kainos</div>
                  <div className="text-amber-100/50 text-xs mt-1">Iki 30% žemiau rinkos</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <Globe2 className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Visa Europa</div>
                  <div className="text-amber-100/50 text-xs mt-1">Prioritetiniai pasiūlymai iš partnerių</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5 hover:border-amber-400/50 transition-all">
                  <Sparkles className="h-7 w-7 text-amber-400 mx-auto mb-2" />
                  <div className="text-amber-100 font-semibold text-sm">Pirmenybė nariams</div>
                  <div className="text-amber-100/50 text-xs mt-1">Pasiūlymai pirma kitų</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://koperseurope.de/auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-bold px-8 py-4 rounded-xl transition-all shadow-[0_10px_40px_rgba(251,191,36,0.4)] hover:shadow-[0_10px_50px_rgba(251,191,36,0.6)] hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5" />
                  Atidaryti didmenos platformą
                </a>
                <a
                  href="https://t.me/koperseurope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-amber-500/10 text-amber-200 font-semibold px-8 py-4 rounded-xl transition-all border-2 border-amber-400/50 hover:border-amber-300"
                >
                  <Send className="h-5 w-5" />
                  Prisijungti prie Telegram
                </a>
              </div>

              <p className="text-amber-100/40 text-xs mt-6 italic">
                Registracija nemokama · Prieiga skirta automobilių prekiautojams
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Didmena;
