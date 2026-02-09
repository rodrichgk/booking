import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {isFr ? "Conditions Générales d'Utilisation" : 'Terms of Service'}
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                {isFr 
                  ? "Dernière mise à jour : Février 2026"
                  : "Last updated: February 2026"}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "1. Acceptation des conditions" : "1. Acceptance of Terms"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "En accédant et en utilisant Orphelia, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service."
                  : "By accessing and using Orphelia, you agree to be bound by these terms of service. If you do not agree to these terms, please do not use our service."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "2. Description du service" : "2. Service Description"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Orphelia est une plateforme de réservation en ligne pour salons de coiffure spécialisés dans les cheveux afro et naturels. Nous permettons aux utilisateurs de découvrir des salons, de prendre des rendez-vous et de gérer leurs réservations."
                  : "Orphelia is an online booking platform for barbershops specializing in afro and natural hair care. We enable users to discover salons, book appointments, and manage their reservations."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "3. Comptes utilisateurs" : "3. User Accounts"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités sous votre compte."
                  : "To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your credentials and all activities under your account."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "4. Réservations" : "4. Bookings"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Les réservations effectuées via notre plateforme sont soumises à la disponibilité et aux politiques d'annulation de chaque salon. Nous vous encourageons à consulter les conditions spécifiques de chaque établissement."
                  : "Bookings made through our platform are subject to availability and cancellation policies of each salon. We encourage you to review the specific terms of each establishment."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "5. Propriété intellectuelle" : "5. Intellectual Property"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Tout le contenu présent sur Orphelia, y compris les textes, graphiques, logos et logiciels, est la propriété d'Orphelia ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle."
                  : "All content on Orphelia, including text, graphics, logos, and software, is the property of Orphelia or its licensors and is protected by intellectual property laws."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "6. Limitation de responsabilité" : "6. Limitation of Liability"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Orphelia ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation de notre plateforme ou des services fournis par les salons partenaires."
                  : "Orphelia shall not be liable for any direct or indirect damages resulting from the use of our platform or services provided by partner salons."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "7. Contact" : "7. Contact"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Pour toute question concernant ces conditions, contactez-nous à contact@orphelia.net"
                  : "For any questions regarding these terms, contact us at contact@orphelia.net"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
