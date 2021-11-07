package handler

import (
	"fmt"
	"io"

	"log"
	"net/http"
	"os"

	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"github.com/littleboycoding/bonfire/server/pkg/db"
	"gorm.io/gorm"
)

const APP_URL = "http://localhost:3000"

type Handler struct {
	Relay *Relay
	DB    *gorm.DB
}

type Event struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

func (event *Event) Json() []byte {
	e, err := json.Marshal(event)
	if err != nil {
		log.Fatal("Error marshaling json")
	}

	return e
}

func writeError(error string, w http.ResponseWriter) {
	event := Event{"ERROR", error}
	w.WriteHeader(http.StatusBadRequest)
	w.Header().Add("Content-Type", "application/json")
	w.Write(event.Json())
}

func (h *Handler) App(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	http.Redirect(w, r, APP_URL, http.StatusTemporaryRedirect)
}

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	asset, header, err := r.FormFile("asset")
	defer asset.Close()
	if err != nil {
		writeError("error uploading file", w)
		return
	}
	b, err := io.ReadAll(asset)
	if err != nil {
		writeError("error reading file", w)
		return
	}
	if err := os.WriteFile("./data/assets/"+header.Filename, b, 0777); err != nil {
		writeError("error writing file", w)
		return
	}
	a := db.Assets{Name: header.Filename, Mimetype: header.Header.Get("Content-Type")}
	h.DB.Create(&a)
	h.Relay.BroadcastAll("UPDATE_RESOURCES", UpdateEvent{Key: "ASSETS", Item: Asset{a.Name, a.Mimetype}})
	e := Event{"Status", "OK"}
	w.Write(e.Json())
}

func (h *Handler) Assets(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var assets []db.Assets
	h.DB.Find(&assets)

	files := []Asset{}

	for i := range assets {
		files = append(files, Asset{assets[i].Name, assets[i].Mimetype})
	}

	b, err := json.Marshal(files)
	if err != nil {
		log.Fatal("Error marshaling json", err)
	}

	fmt.Fprintln(w, string(b))
}

func (h *Handler) Objects(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var objects []db.Object
	h.DB.Find(&objects)

	objs := []Object{}

	for i := range objects {
		objs = append(objs, Object{objects[i].Name})
	}

	b, err := json.Marshal(objs)
	if err != nil {
		log.Fatal("Error marshaling json", err)
	}

	fmt.Fprintln(w, string(b))
}

func (h *Handler) Scenes(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var scenes []db.Scene
	h.DB.Find(&scenes)

	scene := []Scene{}

	for i := range scenes {
		scene = append(scene, Scene{scenes[i].Name})
	}

	b, err := json.Marshal(scene)
	if err != nil {
		log.Fatal("Error marshaling json", err)
	}

	fmt.Fprintln(w, string(b))
}
