import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoanApplicationForm from "@/components/LoanApplicationForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('submit-inquiry', {
        body: {
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          source: 'about_contact'
        }
      });

      if (error) throw error;

      toast({
        title: "Žinutė išsiųsta!",
        description: "Susisieksime su jumis artimiausiu metu.",
      });
      
      setIsContactFormOpen(false);
      setContactForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti žinutės. Bandykite dar kartą.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Apie mus</h1>
              <p className="text-xl md:text-2xl text-white/90">
                Jūsų patikimas partneris automobilio finansavimo srityje
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold mb-6 text-foreground">Kas mes esame?</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Esame komanda, kuri rūpinasi ne tik pardavimu, bet ir visu procesu – nuo poreikių įvertinimo ir automobilio paieškos
                  iki sklandaus finansavimo bei dokumentų sutvarkymo. Mums svarbiausia – skaidrumas ir aiški komunikacija, todėl viską
                  paaiškiname paprastai ir be paslėptų sąlygų.
                </p>
                <p className="text-muted-foreground text-lg mb-6">
                  Turime patikrintų partnerių tinklą Lietuvoje ir užsienyje, todėl galime pasiūlyti tiek čia esančius automobilius,
                  tiek individualią paiešką visoje Europoje. Kiekvieną automobilį tikriname atsakingai, o sprendimus pritaikome pagal kliento situaciją.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-card p-6 rounded-lg border border-border">
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Mūsų misija</h3>
                  <p className="text-muted-foreground">
                    Suteikti kiekvienam galimybę įsigyti automobilį su patogiu ir lanksčiu finansavimu, 
                    užtikrinant skaidrumą ir patikimumą visame procese.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">Mūsų vertybės</h3>
                  <p className="text-muted-foreground">
                    Sąžiningumas, profesionalumas ir klientų pasitenkinimas – tai vertybės, 
                    kuriomis grindžiame savo veiklą kiekvieną dieną.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Kodėl pasirinkti mus?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Patikimumas</h3>
                <p className="text-muted-foreground">
                  Visi automobiliai patikrinti ir su garantija
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">10+ metų patirtis</h3>
                <p className="text-muted-foreground">
                  Ilgametė patirtis automobilių rinkoje
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Lankstus finansavimas</h3>
                <p className="text-muted-foreground">
                  Individualūs sprendimai kiekvienam klientui
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Susisiekite su mumis</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Turite klausimų? Mūsų komanda pasiruošusi padėti!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setIsContactFormOpen(true)}
                  className="h-11 px-8 font-semibold"
                >
                  Susisiekti
                </Button>
                <Button 
                  onClick={() => setIsLoanFormOpen(true)}
                  variant="secondary"
                  className="h-11 px-8 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Gauti pasiūlymą
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Contact Form Dialog */}
      <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Susisiekite su mumis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Vardas</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Jūsų vardas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">El. paštas</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="jusu@pastas.lt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefonas</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                required
                placeholder="+370 600 00000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Žinutė</Label>
              <Textarea
                id="contact-message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
                placeholder="Jūsų klausimas ar žinutė..."
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Siunčiama..." : "Siųsti žinutę"}
            </Button>
          </form>
          
          {/* Contact info section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Arba susisiekite tiesiogiai:
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a 
                href="tel:+37060000000" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors justify-center"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +370 600 00000
              </a>
              <a 
                href="mailto:info@autokopers.lt" 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors justify-center"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@autokopers.lt
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loan Application Form */}
      <LoanApplicationForm
        open={isLoanFormOpen}
        onOpenChange={setIsLoanFormOpen}
      />
    </div>
  );
};

export default About;
