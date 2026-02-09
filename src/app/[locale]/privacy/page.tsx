import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {isFr ? "Politique de Confidentialité" : 'Privacy Policy'}
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-6">
                {isFr 
                  ? "Dernière mise à jour : Février 2026"
                  : "Last updated: February 2026"}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "1. Collecte des données" : "1. Data Collection"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Nous collectons les informations que vous nous fournissez directement, notamment votre nom, adresse email, numéro de téléphone et informations de réservation."
                  : "We collect information you provide directly to us, including your name, email address, phone number, and booking information."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "2. Utilisation des données" : "2. Use of Data"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Vos données sont utilisées pour : gérer vos réservations, vous envoyer des confirmations et rappels, améliorer nos services, et vous contacter si nécessaire."
                  : "Your data is used to: manage your bookings, send you confirmations and reminders, improve our services, and contact you when necessary."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "3. Partage des données" : "3. Data Sharing"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Nous partageons vos informations uniquement avec les salons chez lesquels vous effectuez des réservations. Nous ne vendons jamais vos données personnelles à des tiers."
                  : "We share your information only with the salons where you make bookings. We never sell your personal data to third parties."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "4. Sécurité des données" : "4. Data Security"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, modification ou destruction."
                  : "We implement technical and organizational security measures to protect your personal data against unauthorized access, modification, or destruction."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "5. Vos droits" : "5. Your Rights"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Conformément au RGPD, vous avez le droit d'accéder, de rectifier, de supprimer vos données personnelles, ainsi que le droit à la portabilité et à l'opposition au traitement."
                  : "Under GDPR, you have the right to access, rectify, delete your personal data, as well as the right to data portability and to object to processing."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "6. Conservation des données" : "6. Data Retention"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services ou conformément aux obligations légales."
                  : "We retain your personal data for as long as necessary to provide our services or as required by legal obligations."}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                {isFr ? "7. Contact" : "7. Contact"}
              </h2>
              <p className="text-gray-700 mb-4">
                {isFr
                  ? "Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, contactez-nous à privacy@orphelia.net"
                  : "For any questions regarding our privacy policy or to exercise your rights, contact us at privacy@orphelia.net"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
