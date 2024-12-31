export type TMedia = {
  title: string;
  avatar: string;
  thumbnail: string;
  $id: string;
  creator: any;
  media: string; // This could be a video or audio file URL
  type: "video" | "audio";
  createdAt: string;
};
