package main

import (
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"github.com/littleboycoding/bonfire/server/route"
)

func main() {
	router := httprouter.New()

	sub := route.Subscription{}

	router.GET("/", route.App)
	router.GET("/api/:type", route.Api)
	router.GET("/api/:type/:file", route.Api)
	router.GET("/ws", route.InitializedWS(&sub))

	log.Fatal(http.ListenAndServe(":8080", router))
}
