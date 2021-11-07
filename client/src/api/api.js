const URL = "http://localhost:8080";

async function getResources(focus) {
  switch (focus) {
    case "ASSETS":
      return getAssets();
    case "SCENES":
      return getScenes();
    case "OBJECTS":
      return getObjects();
    default:
      return;
  }
}

async function getAssets() {
  return fetch(`${URL}/assets`).then((res) => res.json());
}

async function getScenes() {
  return fetch(`${URL}/scenes`).then((res) => res.json());
}

async function getObjects() {
  return fetch(`${URL}/objects`).then((res) => res.json());
}

async function getAssetsContent({ queryKey }) {
  const res = await fetch(`${URL}/resources/assets/${queryKey[1]}`);
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  const text = await res.text();
  return text
}

async function uploadAsset(formData) {
  return fetch(`${URL}/upload`, {
    method: "POST",
    body: formData,
  }).then((res) => res.text());
}

export {
  getAssets,
  getScenes,
  getObjects,
  getResources,
  getAssetsContent,
  uploadAsset,
};
