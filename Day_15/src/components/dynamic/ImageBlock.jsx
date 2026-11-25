import { Image } from "react-bootstrap";
export default function ImageBlock({
  url = "",
  alt = "Page image",
  caption = "",
  width = "100%",
  height = "auto",
  alignment = "center",
  radius = "18",
}) {
  return (
    <figure className="my-4" style={{ textAlign: alignment }}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          style={{
            width,
            height,
            objectFit: "cover",
            borderRadius: `${radius}px`,
            maxWidth: "100%",
          }}
        />
      ) : (
        <div className="empty-data">
          Add an image URL in the component settings.
        </div>
      )}
      {caption && (
        <figcaption className="text-secondary small mt-2">{caption}</figcaption>
      )}
    </figure>
  );
}
