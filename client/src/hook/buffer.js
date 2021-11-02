import { BufferContext } from "../context/buffer";
import { useContext } from "react";

function useBuffer() {
  const { buffers, setBuffer, focusPath, setFocusPath } =
    useContext(BufferContext);

  const focusBuffer = (path) => {
    if (path === null) return;
    setFocusPath(path);
  };

  const closeBuffer = (path) => {
    const newBuffer = [];

    for (let i = 0; i < buffers.length; i++) {
      if (buffers[i].path !== path) newBuffer.push(buffers[i]);
    }

    if (path === focusPath) setFocusPath(null);
    setBuffer(newBuffer);
  };

  return { buffers, focusPath, focusBuffer, closeBuffer };
}

export default useBuffer;
