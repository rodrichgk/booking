import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {isFr ? "Politique des Cookies" : 'Cookie Policy'}
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                {isFr 
                  ? "Dernière mise à jour : Février 2026"
                  : "Last updated: February 2026"}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "1. Qu'est-ce qu'un cookie ?" : "1. What is a Cookie?"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. Les cookies nous aident à faire fonctionner le site, à le rendre plus sûr et à améliorer votre expérience."
                  : "A cookie is a small text file stored on your device when you visit a website. Cookies help us make the site work, make it more secure, and improve your experience."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "2. Types de cookies utilisés" : "2. Types of Cookies Used"}
              </h2>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                {isFr ? "Cookies essentiels" : "Essential Cookies"}
              </h3>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Ces cookies sont nécessaires au fonctionnement du site. Ils permettent la navigation et l'utilisation des fonctionnalités de base comme la connexion à votre compte."
                  : "These cookies are necessary for the site to function. They enable navigation and use of basic features like logging into your account."}
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                {isFr ? "Cookies de session" : "Session Cookies"}
              </h3>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Ces cookies maintiennent votre session active pendant que vous naviguez sur le site. Ils sont supprimés lorsque vous fermez votre navigateur."
                  : "These cookies keep your session active while you browse the site. They are deleted when you close your browser."}
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                {isFr ? "Cookies de préférences" : "Preference Cookies"}
              </h3>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Ces cookies mémorisent vos préférences, comme votre langue préférée, pour personnaliser votre expérience."
                  : "These cookies remember your preferences, such as your preferred language, to personalize your experience."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "3. Gestion des cookies" : "3. Managing Cookies"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur. Notez que la désactivation de certains cookies peut affecter le fonctionnement du site."
                  : "You can control and delete cookies through your browser settings. Note that disabling certain cookies may affect site functionality."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "4. Cookies tiers" : "4. Third-Party Cookies"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Nous utilisons des services tiers (comme l'authentification) qui peuvent placer leurs propres cookies. Ces cookies sont soumis aux politiques de confidentialité de ces services."
                  : "We use third-party services (such as authentication) that may place their own cookies. These cookies are subject to the privacy policies of those services."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "5. Contact" : "5. Contact"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Pour toute question concernant notre utilisation des cookies, contactez-nous à contact@orphelia.net"
                  : "For any questions regarding our use of cookies, contact us at contact@orphelia.net"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
