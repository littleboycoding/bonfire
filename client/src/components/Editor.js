import SceneEditor from "./SceneEditor";
import CodeEditor from "./CodeEditor";
import useBuffer from "../hook/buffer";

function EditorStyled() {
  const { buffers, focusPath } = useBuffer();

  const buffer = buffers.find((buf) => buf.path === focusPath);

  if (focusPath === null || !buffer) return null;

  if (buffer.type === "scenes") return <SceneEditor />;
  if (buffer.type === "assets") return <CodeEditor />;

  return null;
}

export default EditorStyled;
