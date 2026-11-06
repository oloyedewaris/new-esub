import { getEsubDetails } from '../api';
import App from '../App';

type HomeProps = {
  searchParams: Promise<{ listing?: string | string[]; agent?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const esubDetails = await getEsubDetails();

  return <App esubDetails={esubDetails} listingId={first(params.listing)} agentId={first(params.agent)} />;
}
