package main

import (
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"github.com/littleboycoding/bonfire/server/internal/route"
	"github.com/littleboycoding/bonfire/server/pkg/db"
)

type CustomRouter struct {
	router *httprouter.Router
}

func (h CustomRouter) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	h.router.ServeHTTP(w, r)
}

func main() {
	_, err := os.ReadDir("./data")
	if err != nil {
		log.Printf("Error in reading ./data directory, Reason %s", err)
	}

	router := httprouter.New()

	r := route.Route{
		DB: db.Init(),
		Subscription: &route.Subscription{},
	}

	router.GET("/", r.App)
	router.GET("/ws", r.InitializedWS)
	router.GET("/assets", r.Assets)
	router.GET("/scenes", r.Scenes)

	router.ServeFiles("/resources/*filepath", http.Dir("./data"))
	router.POST("/upload", r.Upload)

	log.Println("Server started listening on http://localhost:8080 🔥")
	log.Fatal(http.ListenAndServe(":8080", CustomRouter{router: router}))
}
