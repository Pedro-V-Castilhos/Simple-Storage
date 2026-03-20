import { getConstants } from "@/constants";

export const getFoldersService = async (parentFolderId: number | null) => {
  const { url } = getConstants();
  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const query =
    parentFolderId !== null
      ? `?parentFolderId=${parentFolderId}`
      : "?parentFolderId=null";

  const response = await fetch(`${url}/folders${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.folders;
};
