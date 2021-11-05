const URL = "http://localhost:8080";

async function getAssets() {
  return fetch(`${URL}/assets`).then((res) => res.json());
}

async function getScenes() {
  return fetch(`${URL}/scenes`).then((res) => res.json());
}

async function getContent({ queryKey }) {
  return fetch(`${URL}/resources/assets/${queryKey[1]}`).then((res) =>
    res.text()
  );
}

async function uploadAsset(formData) {
  return fetch("http://localhost:8080/upload", {
    method: "POST",
    body: formData,
  }).then((res) => res.text());
}

export { getAssets, getScenes, getContent, uploadAsset };
