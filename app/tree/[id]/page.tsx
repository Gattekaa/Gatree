import Tree from "@/components/tree"
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id

  // fetch data
  const tree = await fetch(`${process.env.FRONTEND_BASE_URL}/api/tree/${id}`).then((res) => res.json())

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []

  return {
    metadataBase: new URL(`${process.env.FRONTEND_BASE_URL}`),
    title: tree.title,
    description: `A tree of ${tree.user.username}, powered by Gattree`,
    robots: "index, follow",
    publisher: "Gattree",
    openGraph: {
      type: "website",
      url: `${process.env.FRONTEND_BASE_URL}/tree/${id}`,
      title: tree.title,
      description: `A tree of ${tree.user.username}, powered by Gattree`,
      images: [
        ...previousImages,
        {
          url: tree.photo,
          width: 800,
          height: 600,
          alt: tree.title,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: tree.photo,
          width: 800,
          height: 600,
          alt: tree.title,
        },
      ]
    },
    
    applicationName: "Gattree",
    appleWebApp: {
      statusBarStyle: "black",
      title: tree.title,
      startupImage: tree.photo,
    }
  }
}

export default function TreePage({ params }: { params: { id: string } }) {
  return (
    <Tree tree_id={params.id} />
  )
}