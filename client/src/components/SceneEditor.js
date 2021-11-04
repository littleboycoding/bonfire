import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import useBuffer from "../hook/buffer";

const SceneEditor = styled.div`
  grid-area: editor;
`;

class SceneObject {
  constructor(asset, pos, size) {
    this.asset = asset;
    this.position = pos;
    this.size = size;
  }

  isPosCollapsed(x, y) {
    const isXGreater = x >= this.position.x;
    const isXLesser = x <= this.position.x + this.size.width;
    const isYGreater = y >= this.position.y;
    const isYLesser = y <= this.position.y + this.size.height;

    return isXGreater && isXLesser && isYGreater && isYLesser;
  }
}

const EXAMPLE_OBJECT = [
  new SceneObject("Sprite.png", { x: 0, y: 0 }, { width: 50, height: 50 }),
  new SceneObject(
    "Sprite2.png",
    { x: 500, y: 500 },
    { width: 100, height: 100 }
  ),
];

function clear(canvas, ctx) {
  canvas.width = 0;
  canvas.height = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function render(canvas, object, scale, viewport, focusObj) {
  const ctx = canvas.getContext("2d");
  clear(canvas, ctx);

  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.scale(scale, scale);

  ctx.fillStyle = "white";
  ctx.fillRect(0 + viewport.x, 0 + viewport.y, 600, 600);

  ctx.fillStyle = "black";
  for (let i = 0; i < object.length; i++) {
    const obj = object[i];

    if (i === focusObj) {
      ctx.lineCap = "round";
      ctx.rect(
        obj.position.x + viewport.x - 5,
        obj.position.y + viewport.y - 5,
        obj.size.width + 10,
        obj.size.height + 10
      );
      ctx.stroke();
    }

    ctx.fillRect(
      obj.position.x + viewport.x,
      obj.position.y + viewport.y,
      obj.size.width,
      obj.size.height
    );
  }
}

const num = Math.floor(Math.random() * 100);

// Internal logic and even handler
function useScene() {
  const { focusPath } = useBuffer();
  const canvasRef = useRef();
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({ x: 100, y: 100 });
  const [mousedown, setMousedown] = useState(false);
  const [focusObj, setFocusObj] = useState(null);
  const [object, setObject] = useState(EXAMPLE_OBJECT);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    "ws://localhost:8080/ws?name=__Test" + num
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.oncontextmenu = (e) => e.preventDefault();

    const renderer = () => render(canvas, object, scale, viewport, focusObj);

    window.addEventListener("resize", renderer);
    canvas.addEventListener("wheel", onWheel);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    renderer();

    return () => {
      window.removeEventListener("resize", renderer);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousedown", onMouseDown);
    };
  });

  useEffect(() => {
    if (lastJsonMessage?.event) {
      const { event, data } = lastJsonMessage;

      switch (event) {
        case "DROP_OBJECT":
          if (data.scene === focusPath) {
            const objs = [...object];
            const obj = objs[data.index];

            obj.position.x = lastJsonMessage.data.x;
            obj.position.y = lastJsonMessage.data.y;

            setObject(objs);
          }
          break;
        default:
          console.log("No event handler for", lastJsonMessage.event);
      }
    }
  }, [lastJsonMessage]);

  const onWheel = (event) => {
    if (event.deltaY < 0 && scale < 2) {
      setScale(scale + 0.1);
    } else if (event.deltaY > 0 && scale > 0.5) {
      setScale(scale - 0.1);
    }
    event.preventDefault();
  };

  const onMouseMove = (event) => {
    if (mousedown) {
      if (focusObj !== null) {
        const objs = [...object];
        const obj = objs[focusObj];

        obj.position.x += event.movementX / scale;
        obj.position.y += event.movementY / scale;

        setObject(objs);
      } else {
        const newViewport = { ...viewport };
        newViewport.x += event.movementX / scale;
        newViewport.y += event.movementY / scale;

        setViewport(newViewport);
      }
    }
  };

  const getScaledPos = (x, y) => {
    const scaledX = (x - viewport.x * scale) / scale;
    const scaledY = (y - viewport.y * scale) / scale;

    return { x: scaledX, y: scaledY };
  };

  const onMouseDown = (event) => {
    const { x, y } = getScaledPos(event.offsetX, event.offsetY);

    for (let i = 0; i < object.length; i++) {
      const obj = object[i];
      if (obj.isPosCollapsed(x, y)) {
        setFocusObj(i);
        setMousedown(true);
        return;
      }
    }

    setMousedown(true);
  };

  const onMouseUp = () => {
    if (focusObj !== null) {
      const obj = object[focusObj];
      const op = {
        event: "DROP_OBJECT",
        data: {
          index: focusObj,
          scene: focusPath,
          x: obj.position.x,
          y: obj.position.y,
        },
      };

      sendJsonMessage(op);
    }
    setFocusObj(null);
    setMousedown(false);
  };

  return { ref: canvasRef, scale, focusObj, object };
}

function SceneEditorStyled() {
  const { ref } = useScene();

  return (
    <SceneEditor>
      <canvas ref={ref}></canvas>
    </SceneEditor>
  );
}

export default SceneEditorStyled;
