type Props = {
  title: string;
  bodyHtml: string;
};

export default function HomePageBody({ title, bodyHtml }: Props) {
  return (
    <>
      <h1>{title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
