import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicShare } from "../lib/api";

export default function PublicSharePage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicShare(token || "");
        setFiles(data.files || []);
        setTitle(data.caseItem?.title || "");
      } catch (e) {
        console.log(e);
      }

      setLoading(false);
    };

    load();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 30 }}>
      <h2>{title}</h2>

      {files.map((f) => (
        <div key={f.id} style={{ marginTop: 10 }}>
          <a href={f.file_url} target="_blank">
            {f.file_name}
          </a>
        </div>
      ))}
    </div>
  );
}
