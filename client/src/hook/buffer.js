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

  const addBuffer = (path, type, focus = true) => {
    for (let i = 0; i < buffers.length; i++) {
      if (buffers[i].path === path && buffers[i].type === type) return;
    }

    const newBuffer = [...buffers, { path, type }];
    setBuffer(newBuffer);

    if (focus) setFocusPath(path);
  };

  return { buffers, focusPath, focusBuffer, closeBuffer, addBuffer };
}

export default useBuffer;
