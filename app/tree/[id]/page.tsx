import ViewTreeContainer from "@/components/viewTreeContainer"
import { getTree } from "@/requests/trees"
import type { Metadata, ResolvingMetadata } from "next"
import { redirect } from "next/navigation"

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id
  // fetch data
  const tree = await getTree(id)

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []

  return {
    metadataBase: new URL(`${process.env.FRONTEND_BASE_URL}`),
    title: `${tree.title} | Gatree - Create and share trees of links`,
    description: `A tree of ${tree.user.username}, powered by Gattree. Gatree is a platform to create and share trees of links. You can create a tree of links for your social media, your portfolio, your company, your project, or anything you want. And the best part is that it's free!`,
    robots: "index, follow",
    publisher: "Gattree",
    authors: [
      {
        name: "Vinicius Gabriel",
        url: "https://www.viniciusgabriel.tech/"
      }
    ],
    openGraph: {
      type: "website",
      url: `${process.env.FRONTEND_BASE_URL}/tree/${id}`,
      title: tree.title,
      description: `A tree of ${tree.user.username}, powered by Gattree. Gatree is a platform to create and share trees of links. You can create a tree of links for your social media, your portfolio, your company, your project, or anything you want. And the best part is that it's free!`,
      images: [
        ...previousImages,
        {
          url: tree.photo ?? "",
          width: 800,
          height: 600,
          alt: tree.title,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: tree.photo ?? "",
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
      startupImage: tree.photo ?? "",
    }
  }
}

export default async function TreePage({ params }: { params: { id: string } }) {
  try {
    const tree = await getTree(params.id)
    return (
      <ViewTreeContainer tree={tree} tree_id={params.id} />
    )
  } catch (err) {
    console.error(err)
    redirect("/not-found")
  }
}