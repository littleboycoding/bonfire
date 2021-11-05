package main

import (
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"github.com/littleboycoding/bonfire/server/internal/route"
	gorm "github.com/littleboycoding/bonfire/server/pkg/db"
)

func main() {
	_, err := os.ReadDir("./data")
	if err != nil {
		log.Printf("Error in reading ./data directory, Reason %s", err)
	}

	router := httprouter.New()

	sub := route.Subscription{}

	// router.GET("/api/:type", route.Api)
	// router.GET("/api/:type/:file", route.Api)
	router.ServeFiles("/assets/*filepath", http.Dir("./data"))
	router.GET("/", route.App)
	router.GET("/ws", route.InitializedWS(&sub))

	gorm.GetDb()

	log.Println("Server started listening on http://localhost:8080 🔥")
	log.Fatal(http.ListenAndServe(":8080", router))
}
