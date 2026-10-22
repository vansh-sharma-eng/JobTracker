import toast from "react-hot-toast";

export const copyToClipboard = (text, label = "Text") => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard!`);
};

export const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename}`);
};
