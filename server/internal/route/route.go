package route

import (
	"fmt"
	"io"

	"log"
	"net/http"
	"os"

	"encoding/json"
	// "github.com/gabriel-vasile/mimetype"
	"github.com/julienschmidt/httprouter"
	"github.com/littleboycoding/bonfire/server/pkg/db"
	"gorm.io/gorm"
)

type Route struct {
	Subscription *Subscription
	DB           *gorm.DB
}

type File struct {
	Filename string
	Mimetype string
}

func (route *Route) App(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	http.Redirect(w, r, "http://192.168.1.56:3000", http.StatusTemporaryRedirect)
}

func (route *Route) Upload(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	asset, header, err := r.FormFile("asset")
	defer asset.Close()
	if err != nil {
		log.Println("Error getting uploaded file", err)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("error"))
		return
	}
	b, err := io.ReadAll(asset)
	if err != nil {
		log.Println("Error reading file", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
		return
	}
	if err := os.WriteFile("./data/assets/"+header.Filename, b, 0777); err != nil {
		log.Println("Error reading file", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("error"))
		return
	}
	a := db.Assets{Name: header.Filename, Mimetype: header.Header.Get("Content-Type")}
	route.DB.Create(&a)
	route.Subscription.BroadcastAll("CREATE_ASSET", a)
	w.Write([]byte("ok"))
}

func (route *Route) Assets(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var assets []db.Assets
	route.DB.Find(&assets)

	files := []File{}

	for i := range assets {
		files = append(files, File{Filename: assets[i].Name, Mimetype: assets[i].Mimetype})
	}

	b, err := json.Marshal(files)
	if err != nil {
		log.Fatal("Error marshaling json", err)
	}

	fmt.Fprintln(w, string(b))
}

// func (route *Route) Objects(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
// 	var scenes []db.Scene
// 	route.DB.Find(&scenes)

// 	scene := []string{}

// 	for i := range scenes {
// 		scene = append(scene, scenes[i].Name)
// 	}

// 	b, err := json.Marshal(scene)
// 	if err != nil {
// 		log.Fatal("Error marshaling json", err)
// 	}

// 	fmt.Fprintln(w, string(b))
// }

func (route *Route) Scenes(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var scenes []db.Scene
	route.DB.Find(&scenes)

	scene := []string{}

	for i := range scenes {
		scene = append(scene, scenes[i].Name)
	}

	b, err := json.Marshal(scene)
	if err != nil {
		log.Fatal("Error marshaling json", err)
	}

	fmt.Fprintln(w, string(b))
}
