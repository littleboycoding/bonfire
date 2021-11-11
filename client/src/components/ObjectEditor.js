import styled from "styled-components/macro";
import { ASSETS, BLOB_CONTENT, OBJECT } from "../store_constant";
import { useQuery, useQueryClient } from "react-query";
import { getAssets, getObject } from "../api/api";
import mime from "mime-types";
import { useRef, useEffect, useState } from "react";
import { getBitmap } from "../api/api";
import useBuffer from "../hook/buffer";
import useWebSocket from "../hook/websocket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const Editor = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-areas: "panel preview";
`;

const Panel = styled.div`
  grid: panel;
  background-color: #eee;
  border-right: 1px solid rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 15px;

  .title {
    font-size: 24px;
  }

  .label {
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .label input {
    width: 100%;
  }
`;

const VariablesEditpr = styled.textarea`
  resize: none;
  overflow: auto;
  height: 250px;
`;

const Preview = styled.div`
  grid: preview;
`;

function isImage(mimetype) {
  const image = new RegExp(/image\/.*$/);

  return !!image.exec(mimetype);
}

function ImageOption({ assets }) {
  return assets
    .filter((asset) => isImage(mime.lookup(asset.name)))
    .map((item) => <option key={item.name}>{item.name}</option>);
}

function PanelStyled({
  assetName,
  animations,
  frameWidth,
  frameHeight,
  variables,
  updateObject,
  focus,
  setFocus,
}) {
  const { data, isLoading, error } = useQuery(ASSETS, getAssets);
  const { sendJsonMessage } = useWebSocket();
  const { focusPath } = useBuffer();
  const client = useQueryClient();

  if (isLoading) return "…";
  if (error) return error;

  const setAsset = ({ target: { value } }) => {
    updateObject({ assetName: value });
  };

  const deleteAnimation = () => {
    client.setQueryData([OBJECT, focusPath], (data) => {
      const newData = { ...data };
      const [animation] = newData.animations.splice(focus, 1);
      sendJsonMessage({
        event: "DELETE_ANIMATION",
        data: { name: focusPath, id: animation.ID },
      });
      return data;
    });

    setFocus(0);
  };

  const onFramesChange = (event) => {
    const value = event.target.value;

    client.setQueryData([OBJECT, focusPath], (data) => {
      const newData = { ...data };

      newData.animations[focus].frames = value;

      sendJsonMessage({
        event: "UPDATE_ANIMATION_FRAMES",
        data: {
          objectName: focusPath,
          name: data.animations[focus].name,
          frames: value,
        },
      });

      return newData;
    });

    event.preventDefault();
  };

  const setFrameSize = (t, { target: { value } }) => {
    let v = parseFloat(value);

    if (Number.isNaN(v)) v = 0;

    if (t === "width") {
      const obj = { frameWidth: v };
      updateObject(obj);
    } else {
      const obj = { frameHeight: v };
      updateObject(obj);
    }
  };

  const setVariables = ({ target: { value } }) => {
    updateObject({ variables: value });
  };

  const onAnimationChange = (event) => {
    const value = event.target.value;

    if (value === "__create") {
      const name = window.prompt("Enter animation name");
      if (name) {
        sendJsonMessage({
          event: "CREATE_ANIMATION",
          data: { objectName: focusPath, animationName: name },
        });
        client.setQueryData([OBJECT, focusPath], (data) => {
          const newData = { ...data };
          newData.animations = [
            ...(newData.animation || []),
            { name: name, frames: "" },
          ];

          return newData;
        });
      }
    } else {
      setFocus(value);
    }
  };

  return (
    <Panel>
      <span className="title">Asset</span>
      <select onChange={setAsset} value={assetName || "Select asset"}>
        <option disabled>{assetName || "Select asset"}</option>
        <ImageOption assets={data} />
      </select>
      <span className="title">Frame size</span>
      <label className="label">
        Width
        <input
          type="text"
          placeholder="pixel"
          value={frameWidth}
          onChange={(event) => setFrameSize("width", event)}
        />
      </label>
      <label className="label">
        Height
        <input
          type="text"
          placeholder="pixel"
          value={frameHeight}
          onChange={(event) => setFrameSize("height", event)}
        />
      </label>
      <span className="title">Animations</span>
      <select onChange={onAnimationChange} value={focus}>
        {animations.map((a, i) => (
          <option value={i} key={a.ID}>
            {a.name}
          </option>
        ))}
        <option value="__create">Create new...</option>
      </select>
      {animations?.length > 1 && (
        <span style={{ color: "red" }} onClick={deleteAnimation}>
          <FontAwesomeIcon icon={faTrash} /> Delete
        </span>
      )}
      <span className="title">Frames</span>
      <input
        type="text"
        value={animations[focus].frames}
        onChange={onFramesChange}
        placeholder="1,2,3,..."
      />
      <span className="title">Variables</span>
      <VariablesEditpr value={variables} onChange={setVariables} />
    </Panel>
  );
}

function PreviewStyled({
  frameWidth,
  frameHeight,
  bitmap: object,
  framesList,
}) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const clear = () => {
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(object, 0, 0);
      };

      const renderGrid = () => {
        const fH = parseFloat(frameHeight);
        const fW = parseFloat(frameWidth);

        if (fH > 0 && fW > 0) {
          new Promise(() => {
            for (let i = 0; i < Math.ceil(object.height / fH) - 1; i++) {
              ctx.moveTo(0, i * fH + fH);
              ctx.lineTo(object.width, i * fH + fH);
              ctx.stroke();
            }
          });
          new Promise(() => {
            for (let i = 0; i < Math.ceil(object.width / fW) - 1; i++) {
              ctx.moveTo(i * fW + fW, 0);
              ctx.lineTo(i * fW + fW, object.height);
              ctx.stroke();
            }
          });
          new Promise(() => {
            let f = 0;
            ctx.font = "30px monospace";
            ctx.fillStyle = "black";
            for (let i = 0; i < Math.ceil(object.height / fH); i++) {
              for (let x = 0; x < Math.ceil(object.width / fW); x++) {
                ctx.fillText(f, x * fW + 5, i * fH + 30);
                f += 1;
              }
            }
          });
        }
      };

      const onWheel = (event) => {
        if (event.deltaY < 0 && scale < 2) {
          setScale(scale + 0.1);
        } else if (event.deltaY > 0 && scale > 0.2) {
          setScale(scale - 0.1);
        }
        event.preventDefault();
      };

      let timeout;
      const renderer = () => {
        clear();
        render();
        timeout = setTimeout(() => renderGrid(), 500);
      };

      if (object instanceof ImageBitmap) {
        renderer();
      }

      canvas.addEventListener("wheel", onWheel);
      window.addEventListener("resize", renderer);
      return () => {
        canvas.removeEventListener("wheel", onWheel);
        window.removeEventListener("resize", renderer);
        clearTimeout(timeout);
      };
    }
  }, [frameWidth, frameHeight, object, scale]);

  useEffect(() => {
    if (canvasRef.current && framesList.length > 0) {
      let frameTimeout;
      const renderAnimation = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(
          canvas.width / scale - framesList[frame].width,
          canvas.height / scale - framesList[frame].height,
          framesList[frame].width,
          framesList[frame].height
        );
        ctx.drawImage(
          framesList[frame],
          canvas.width / scale - framesList[frame].width,
          canvas.height / scale - framesList[frame].height
        );
      };
      frameTimeout = setTimeout(() => {
        if (frame < framesList.length - 1) {
          setFrame(frame + 1);
        } else {
          setFrame(0);
        }
      }, 100);

      if (framesList[frame]) {
        renderAnimation();
      }

      window.addEventListener("resize", renderAnimation);
      return () => {
        clearTimeout(frameTimeout);
        window.removeEventListener("resize", renderAnimation);
      };
    }
  }, [framesList, frame, scale]);

  if (!object) return null;

  return (
    <Preview>
      <canvas ref={canvasRef} />
    </Preview>
  );
}

async function preloadBitmap(client, object) {
  const [, bitmap] = await client.fetchQuery(
    [BLOB_CONTENT, object.assetName],
    getBitmap
  );

  if (bitmap instanceof ImageBitmap) {
    const { frameHeight: h, frameWidth: w } = object;
    let frames = [];
    if (bitmap.width > 0 && bitmap.height > 0 && h > 0 && w > 0) {
      for (let row = 0; row < Math.ceil(bitmap.height / h); row++) {
        for (let col = 0; col < Math.ceil(bitmap.width / w); col++) {
          frames = frames.concat(
            createImageBitmap(bitmap, col * w, row * h, w, h)
          );
        }
      }
      frames = await Promise.all(frames);
    }
    return [bitmap, frames];
  }
  return [null, []];
}

function ObjectEditor() {
  const client = useQueryClient();
  const { focusPath } = useBuffer();
  const { sendJsonMessage } = useWebSocket();
  const { data, isLoading, error } = useQuery([OBJECT, focusPath], getObject);

  // State
  const [focus, setFocus] = useState(0);
  const [bitmap, setBitmap] = useState(null);
  const [framesList, setFramesList] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      if (data.object.assetName !== "") {
        (async () => {
          const [bitmap, frames] = await preloadBitmap(client, data.object);
          setFramesList(frames);
          setBitmap(bitmap);
        })();
      }
    }
  }, [isLoading, client, data]);

  useEffect(() => {
    setFocus(0);
    setBitmap(null);
    setFramesList([]);
  }, [focusPath]);

  if (isLoading || !data.animations[focus]) return "…";
  if (error) return error;

  const updateObject = (obj) => {
    client.setQueryData([OBJECT, focusPath], (data) => {
      const newData = { ...data };
      newData.object = { ...newData.object, ...obj };
      sendJsonMessage({
        event: "UPDATE_OBJECT",
        data: {
          name: focusPath,
          frameWidth: newData.object.frameWidth,
          frameHeight: newData.object.frameHeight,
          assetName: newData.object.assetName,
          variables: newData.object.variables,
        },
      });
      return newData;
    });
  };

  const mapAnimationFrames = data.animations[focus].frames
    .split(",")
    .map((f) => parseInt(f))
    .filter((f) => Number.isInteger(f))
    .map((f) => framesList[f]);

  return (
    <Editor>
      <PanelStyled
        assetName={data.object.assetName}
        animations={data.animations}
        frameWidth={data.object.frameWidth}
        frameHeight={data.object.frameHeight}
        variables={data.object.variables}
        updateObject={updateObject}
        focus={focus}
        setFocus={setFocus}
      />
      <PreviewStyled
        bitmap={bitmap}
        framesList={mapAnimationFrames}
        frameWidth={data.object.frameWidth}
        frameHeight={data.object.frameHeight}
      />
    </Editor>
  );
}

export default ObjectEditor;
