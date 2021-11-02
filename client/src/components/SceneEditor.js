import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "react";

const SceneEditor = styled.div`
  grid-area: editor;
`;

const EXAMPLE_OBJECT = [
  {
    asset: "Sprite.png",
    position: {
      y: 0,
      x: 0,
    },
    size: {
      width: 50,
      height: 50,
    },
  },
  {
    asset: "Sprite2.png",
    position: {
      y: 500,
      x: 500,
    },
    size: {
      width: 100,
      height: 100,
    },
  },
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

function render(canvas, object, scale, focusObj) {
  const ctx = canvas.getContext("2d");
  clear(canvas, ctx);

  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.scale(scale, scale);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 600, 600);

  ctx.fillStyle = "black";
  for (let i = 0; i < object.length; i++) {
    const obj = object[i];

    if (i === focusObj) {
      ctx.lineCap = "round";
      ctx.rect(
        obj.position.x - 5,
        obj.position.y - 5,
        obj.size.width + 10,
        obj.size.height + 10
      );
      ctx.stroke();
    }

    ctx.fillRect(
      obj.position.x,
      obj.position.y,
      obj.size.width,
      obj.size.height
    );
  }
}

// Internal logic and even handler
function useScene() {
  const canvasRef = useRef();
  const [scale, setScale] = useState(1);
  const [mousedown, setMousedown] = useState(null);
  const [focusObj, setFocusObj] = useState(null);
  const [object, setObject] = useState(EXAMPLE_OBJECT);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.oncontextmenu = (e) => e.preventDefault();

    const renderer = () => render(canvas, object, scale, focusObj);

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

  const onWheel = (event) => {
    if (event.deltaY < 0 && scale < 2) {
      setScale(scale + 0.1);
    } else if (event.deltaY > 0 && scale > 0.5) {
      setScale(scale - 0.1);
    }
    event.preventDefault();
  };

  const onMouseMove = (event) => {
    if (mousedown !== null) {
      if (focusObj !== null) {
        const objs = [...object];
        const obj = objs[focusObj];

        obj.position.x += event.movementX / scale;
        obj.position.y += event.movementY / scale;

        setObject(objs);
      } else {
      }
    }
  };

  const onMouseDown = (event) => {
    for (let i = 0; i < object.length; i++) {
      const obj = object[i];
      if (
        event.offsetX >= obj.position.x * scale &&
        event.offsetX <= (obj.position.x + obj.size.width) * scale &&
        event.offsetY >= obj.position.y * scale &&
        event.offsetY <= (obj.position.y + obj.size.height) * scale
      ) {
        setFocusObj(i);
        setMousedown(true);
        return;
      }
    }

    setMousedown({ x: event.offsetX, y: event.offsetY });
  };

  const onMouseUp = () => {
    setFocusObj(null);
    setMousedown(null);
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
