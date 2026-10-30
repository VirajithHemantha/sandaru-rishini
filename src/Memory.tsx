import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, CheckCircle2, ImagePlus, Loader2, X, AlertCircle } from "lucide-react";

// Paste the Web App URL from deploying memory.gs here
const MEMORY_ENDPOINT = "https://script.google.com/macros/s/AKfycbw86BmNvCr66vZA7IR6znLgZCOUQQ-jEzoLK8HuvUMf_1n_Hg66YjNyAbNYMqke8U0I/exec";

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Memory() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file, status: "pending" as UploadStatus })),
    ]);
    setFinished(false);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function setStatus(id: string, status: UploadStatus) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function handleUpload() {
    if (!MEMORY_ENDPOINT) {
      alert("Upload is not configured yet. Please add the Apps Script URL.");
      return;
    }
    setUploading(true);
    // Upload one at a time to stay under Apps Script request limits
    for (const item of items) {
      if (item.status === "done") continue;
      setStatus(item.id, "uploading");
      try {
        const fileData = await fileToBase64(item.file);
        const res = await fetch(MEMORY_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            fileName: item.file.name,
            mimeType: item.file.type,
            fileData,
          }),
        });
        const json = await res.json();
        setStatus(item.id, json.status === "success" ? "done" : "error");
      } catch (err) {
        console.error(err);
        setStatus(item.id, "error");
      }
    }
    setUploading(false);
    setFinished(true);
  }

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const allDone = items.length > 0 && doneCount === items.length;

  function reset() {
    setItems([]);
    setFinished(false);
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-sage/20 bg-white/70 shadow-xl p-6 md:p-8"
      >
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center">
            <Camera className="text-sage" size={26} />
          </div>
          <p className="script text-3xl text-sage">Sandaru & Rishini</p>
          <h1 className="serif text-3xl text-umber font-bold mt-1">Share Your Memories</h1>
          <p className="text-xs md:text-sm text-umber/70 mt-2 leading-relaxed">
            Upload the photos you captured on our special day.
          </p>
        </div>

        {allDone && finished ? (
          <div className="text-center space-y-4 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center"
            >
              <CheckCircle2 className="text-sage" size={32} />
            </motion.div>
            <h2 className="serif text-2xl text-umber font-bold">Thank You!</h2>
            <p className="text-sm text-umber/80">
              {doneCount} photo{doneCount === 1 ? "" : "s"} uploaded. We can't wait to see them.
            </p>
            <button
              onClick={reset}
              className="w-full bg-umber text-white py-3 rounded-xl text-[12px] md:text-sm uppercase tracking-widest font-bold transition-all hover:bg-umber/90 shadow-lg"
            >
              Upload More
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={uploading}
              className="w-full rounded-xl border border-sage/20 bg-white/60 px-4 py-3 text-xs md:text-sm outline-none focus:border-sage/40 transition-colors"
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-2xl border-2 border-dashed border-sage/30 bg-sage/5 py-8 flex flex-col items-center gap-2 text-umber/80 hover:bg-sage/10 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="text-sage" size={30} />
              <span className="text-sm font-semibold">Tap to choose photos</span>
              <span className="text-[11px] text-umber/50">You can select multiple images</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {items.length > 0 && (
              <ul className="max-h-60 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-sage/15 bg-white/60 px-3 py-2 text-xs"
                  >
                    <span className="flex-1 truncate text-umber/80">{item.file.name}</span>
                    <span className="text-umber/40 shrink-0">{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
                    {item.status === "uploading" && <Loader2 className="animate-spin text-sage shrink-0" size={16} />}
                    {item.status === "done" && <CheckCircle2 className="text-taupe shrink-0" size={16} />}
                    {item.status === "error" && <AlertCircle className="text-red-500 shrink-0" size={16} />}
                    {item.status === "pending" && !uploading && (
                      <button onClick={() => removeItem(item.id)} className="text-umber/40 hover:text-umber shrink-0" aria-label="Remove">
                        <X size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {finished && errorCount > 0 && (
              <p className="text-xs text-red-500 text-center">
                {errorCount} photo{errorCount === 1 ? "" : "s"} failed. Tap upload to try again.
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || items.length === 0}
              className="w-full bg-umber text-white py-3 rounded-xl text-[12px] md:text-sm uppercase tracking-widest font-bold disabled:opacity-50 transition-all hover:bg-umber/90 shadow-lg"
            >
              {uploading
                ? `Uploading ${doneCount + 1} of ${items.length}...`
                : `Upload ${items.length || ""} Photo${items.length === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
