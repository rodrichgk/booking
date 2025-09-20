import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the default locale (French as specified in user rules)
  redirect('/fr');
}
