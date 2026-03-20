import { getConstants } from "@/constants";

export const uploadFiles = async (file: any, folderId?: number | null) => {
  if (!file) throw Error("Files not Found");

  const { url } = getConstants();

  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (folderId !== undefined && folderId !== null) {
    headers["folderid"] = String(folderId);
  }

  const response = await fetch(`${url}/file/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.file;
};
