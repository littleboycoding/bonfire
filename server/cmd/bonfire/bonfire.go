package main

import (
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"github.com/littleboycoding/bonfire/server/internal/handler"
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

	DB := db.Init()
	r := handler.Handler{
		DB:    DB,
		Relay: &handler.Relay{DB: DB},
	}

	router.GET("/", r.App)
	router.GET("/ws", r.Subscription)

	router.GET("/assets", r.Assets)
	router.GET("/scenes", r.Scenes)
	router.GET("/objects", r.Objects)

	router.ServeFiles("/resources/*filepath", http.Dir("./data"))
	router.POST("/upload", r.Upload)

	log.Println("Server started listening on http://localhost:8080 🔥")
	log.Fatal(http.ListenAndServe(":8080", CustomRouter{router: router}))
}
