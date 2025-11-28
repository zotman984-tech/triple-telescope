import { Metadata } from 'next';
import DestinationContent from './DestinationContent';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // Convert slug to display name
    const name = slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: `eSIM for ${name} | High Speed Data Plans`,
        description: `Get instant eSIM data plans for ${name}. No roaming fees, keep your number, and stay connected with local rates.`,
        openGraph: {
            title: `eSIM for ${name} | High Speed Data Plans`,
            description: `Get instant eSIM data plans for ${name}. No roaming fees, keep your number, and stay connected with local rates.`,
        },
    };
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    return <DestinationContent slug={slug} />;
}
