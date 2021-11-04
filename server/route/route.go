package route

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"encoding/json"
)

func Json(w http.ResponseWriter, b []byte) {
	w.Header().Add("Content-Type", "application/json")
	// DEVELOPMENT ONLY
	w.Header().Add("Access-Control-Allow-Origin", "http://localhost:3000")
	fmt.Fprint(w, string(b))
}

func App(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	http.Redirect(w, r, "http://192.168.1.56:3000", http.StatusTemporaryRedirect)
}

func getResources(t string) []byte {
	dirs, err := os.ReadDir("./data/" + t)
	if err != nil {
		log.Fatal(err)
	}

	var newDir []string

	for _, dir := range dirs {
		if !dir.IsDir() {
			newDir = append(newDir, dir.Name())
		}
	}

	b, err := json.Marshal(newDir)
	if err != nil {
		log.Fatal(err)
	}

	return b
}

func getFiles(t string, f string) []byte {
	file, _ := os.ReadFile("./data/" + t + "/" + f)

	return file
}

func Api(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	t := ps.ByName("type")
	f := ps.ByName("file")

	switch t {
	case "assets":
		if f != "" {
			b := getFiles(t, f)
			Json(w, b)
		} else {
			b := getResources(t)
			Json(w, b)
		}
	case "scenes":
		if f != "" {
			b := getFiles(t, f)
			Json(w, b)
		} else {
			b := getResources(t)
			Json(w, b)
		}
	default:
		fmt.Fprintf(w, "Unknown resources `%s`", t)
	}
}
