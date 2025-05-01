import { extractYoutubeVideoId } from "@/helpers/extractYoutubeVideoId";

type Props = {
  url: string;
}

export function YoutubeVideo({ url } : Props) {
  return (
    <iframe
      className="w-full aspect-video"
      src={`https://www.youtube.com/embed/${extractYoutubeVideoId(url)}`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    />
  );
}
