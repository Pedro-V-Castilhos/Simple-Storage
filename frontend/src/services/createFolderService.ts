import { getConstants } from "@/constants";

export const createFolderService = async (
  name: string,
  parentFolderId: number | null,
) => {
  const { url } = getConstants();
  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const response = await fetch(`${url}/folder`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, parentFolderId }),
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.folder;
};
