package handler

import (
	"log"
	"os"
	"path"

	"github.com/gobwas/ws/wsutil"
	model "github.com/littleboycoding/bonfire/server/pkg/db"
	"gorm.io/gorm"
)

type Resource string

const (
	ASSETS  Resource = "ASSETS"
	OBJECTS Resource = "OBJECTS"
	SCENES  Resource = "SCENES"
)

type UpdateEvent struct {
	Key  Resource    `json:"key"`
	Item interface{} `json:"item"`
}

func (s *Relay) eventHandler(e *Event, c *Client, db *gorm.DB) {
	switch e.Event {
	case "DROP_OBJECT":
		data, ok := e.Data.(map[string]interface{})
		if !ok {
			s.Broadcast(c, "ERROR", "Invalid position")
		} else {
			_, xOk := data["x"].(float64)
			_, yOk := data["y"].(float64)
			_, indexOk := data["index"].(float64)
			_, sceneOk := data["scene"].(string)

			if xOk && yOk && indexOk && sceneOk {
				s.BroadcastFromClient(c, "DROP_OBJECT", data)
			}
		}
	case "CREATE_ASSET":
		name, ok := e.Data.(string)
		if !ok {
			s.Broadcast(c, "ERROR", "Invalid name")
		} else {
			p := path.Join("./data/assets/", name)
			stat, _ := os.Lstat(p)
			if stat != nil {
				log.Printf("File `%s` already exist", name)
				event := Event{"ERROR", "File already exists"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			file, err := os.Create(p)
			if err != nil {
				log.Printf("Error in creating `%s`", name)
				event := Event{"ERROR", "File creation error"}
				wsutil.WriteServerText(*c.Conn, event.Json())
				return
			}
			defer file.Close()
			asset := model.Assets{Name: name, Mimetype: "applcation/octet-stream"}
			db.Create(&asset)
			s.BroadcastAll("UPDATE_RESOURCES", UpdateEvent{ASSETS, Asset{name, "applcation/octet-stream"}})
		}
	default:
		log.Println("Unmatched event name")
	}
}
