import "./AirTableFormEmbed.css";

type Props = {
  formUrl: string;
};

export default function AirTableFormEmbed({ formUrl }: Props) {
  return (
    <iframe
      src={formUrl}
      className="airtable-embed"
    />
  );
}
