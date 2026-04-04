import { GumroadButton } from '@/components/payment/GumroadButton'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Één prijs. Alles inbegrepen.</h1>
          <p className="text-xl text-gray-600">
            Geef je kind de AI-coach die het nodig heeft — voor minder dan een kop koffie per maand.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
            <p className="text-gray-600 mb-6">Probeer zonder risico</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              €0
              <span className="text-lg text-gray-600 font-normal">/maand</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex gap-3">
                <span>✓</span>
                <span>3 lessen per week</span>
              </li>
              <li className="flex gap-3">
                <span>✓</span>
                <span>1 avatar</span>
              </li>
              <li className="flex gap-3">
                <span>✓</span>
                <span>Basis woordenlijst</span>
              </li>
              <li className="flex gap-3">
                <span>✗</span>
                <span className="text-gray-400">Voortgang tracking</span>
              </li>
              <li className="flex gap-3">
                <span>✗</span>
                <span className="text-gray-400">AI-uitleg</span>
              </li>
              <li className="flex gap-3">
                <span>✗</span>
                <span className="text-gray-400">Ouderrapport</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition">
              Nu starten
            </button>
          </div>

          {/* Premium Plan - HIGHLIGHTED */}
          <div className="lg:col-span-1 relative">
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              MEEST GEKOZEN
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl h-full">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-blue-100 mb-6">Alles wat je nodig hebt</p>
              <div className="text-5xl font-bold text-white mb-2">
                €4,99
              </div>
              <p className="text-blue-100 mb-8">eenmalig (lifetime access)</p>
              <ul className="space-y-3 mb-8 text-white">
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Onbeperkt oefenen</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Alle 4 avatars</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Volledige woordenbank</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Voortgang tracking</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>AI-uitleg per woord</span>
                </li>
                <li className="flex gap-3">
                  <span>✓</span>
                  <span>Wekelijks ouderrapport</span>
                </li>
              </ul>
              <GumroadButton
                label="🚀 Start nu - €4,99"
                className="w-full bg-white text-blue-600 hover:bg-gray-100"
              />
              <p className="text-center text-blue-100 text-sm mt-4">
                Prijsgarantie: Jij bent er vroeg bij. Prijs gaat later omhoog.
              </p>
            </div>
          </div>

          {/* School License */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Leerkracht</h3>
            <p className="text-gray-600 mb-6">Voor de hele klas</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">
              GRATIS
              <span className="text-lg text-gray-600 font-normal">/jaar</span>
            </div>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex gap-3">
                <span>✓</span>
                <span>Eigen woordenlijsten</span>
              </li>
              <li className="flex gap-3">
                <span>✓</span>
                <span>Klasoverzicht (1 klas)</span>
              </li>
              <li className="flex gap-3">
                <span>✓</span>
                <span>Voortgang per kind</span>
              </li>
              <li className="flex gap-3">
                <span>✓</span>
                <span>CSV import/export</span>
              </li>
              <li className="flex gap-3">
                <span>✗</span>
                <span className="text-gray-400">Meerdere klassen</span>
              </li>
              <li className="flex gap-3">
                <span>✗</span>
                <span className="text-gray-400">School license</span>
              </li>
            </ul>
            <a
              href="/teacher"
              className="block text-center py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
            >
              Leerkracht account
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Veelgestelde vragen</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kan ik het gratis proberen?</h3>
              <p className="text-gray-600">
                Ja! De gratis versie biedt 3 lessen per week. Perfect om te testen of het voor jouw
                kind werkt.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kan ik het terugkrijgen?</h3>
              <p className="text-gray-600">
                Ja, 30 dagen geld-terug-garantie. Geen vragen gesteld. Je krijgt het volledig
                terug.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Hoe werkt het echt?</h3>
              <p className="text-gray-600">
                Je kind speelt 10 minuten per dag. Typt woorden na audio. AI verklaart regels.
                Ouders zien voortgang.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Werkt het echt?</h3>
              <p className="text-gray-600">
                Ja. Kinderen die 3× per week oefenen verbeteren hun spellingscore gemiddeld met
                1,8 punt.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Kan ik opzeggen?</h3>
              <p className="text-gray-600">
                Je betaalt eenmalig. Geen abonnement. Lifetime access. Je bent nooit gebonden.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Werkt het op mijn telefoon?</h3>
              <p className="text-gray-600">
                Ja! Het is een web-app die op elke telefoon werkt. Geen app store download nodig.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Klaar om te starten?</h2>
          <p className="text-lg text-gray-600 mb-8">
            €4,99 eenmalig. Lifetime access. Geld-terug-garantie.
          </p>
          <GumroadButton
            label="🚀 Start nu - Levenslang Toegang"
            className="px-8 py-4 text-lg"
          />
          <p className="text-gray-500 text-sm mt-4">
            Of start gratis → Unlimited oefenen
          </p>
        </div>
      </div>
    </main>
  )
}
