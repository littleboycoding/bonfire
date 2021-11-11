import SceneEditor from "./SceneEditor";
import CodeEditor from "./CodeEditor";
import ObjectEditor from "./ObjectEditor";
import useBuffer from "../hook/buffer";

function EditorStyled() {
  const { buffers, focusPath } = useBuffer();

  const buffer = buffers.find((buf) => buf.path === focusPath);

  if (focusPath === null || !buffer) return null;

  if (buffer.type === "SCENES") return <SceneEditor />;
  if (buffer.type === "ASSETS") return <CodeEditor />;
  if (buffer.type === "OBJECTS") return <ObjectEditor />;

  return null;
}

export default EditorStyled;
