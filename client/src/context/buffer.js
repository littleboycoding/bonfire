import { createContext, useState } from "react";

// Development example data set
export const EXAMPLE_BUFFERS = [
  {
    path: "App.js",
    type: "assets",
  },
  {
    path: "main_scene",
    type: "scene",
  },
  {
    path: "main.js",
    type: "assets",
  },
];

const DEFAULT = {
  buffers: EXAMPLE_BUFFERS,
  setBuffer() {},
  focusPath: EXAMPLE_BUFFERS[1].path,
  setFocusPath() {},
};

const BufferContext = createContext(DEFAULT);

function BufferProvider({ children }) {
  const [buffers, setBuffer] = useState(EXAMPLE_BUFFERS);
  const [focusPath, setFocusPath] = useState(EXAMPLE_BUFFERS[1].path);

  const bufferData = {
    buffers,
    setBuffer,
    focusPath,
    setFocusPath,
  };

  return (
    <BufferContext.Provider value={bufferData}>
      {children}
    </BufferContext.Provider>
  );
}

export { BufferProvider, BufferContext };
